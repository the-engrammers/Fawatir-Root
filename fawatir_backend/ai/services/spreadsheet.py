import io
import json
import re
from typing import Optional

import pandas as pd
from django.conf import settings
import google.generativeai as genai
from pydantic import BaseModel, Field

from pydantic import BaseModel, Field
from typing import Optional, Literal

TARGET_SCHEMAS = {
    "stock": ["product_name", "description", "sku", "barcode", "brand", "unit", "purchase_price", "selling_price", "tax_rate", "minimum_stock", "weight", "stock_quantity", "warehouse_location", "category_name", "supplier_name", "status"],
    "clients": ["customer_code", "company_name", "contact_name", "email", "phone", "mobile", "website", "tax_identifier", "ice", "rc", "address", "city", "postal_code", "country", "credit_limit", "notes"],
    "suppliers": ["supplier_code", "company_name", "contact_name", "email", "phone", "mobile", "website", "tax_identifier", "ice", "rc", "address", "city", "postal_code", "country", "notes"],
    "invoices": ["invoice_number", "issue_date", "due_date", "status", "subtotal", "tax_amount", "discount_amount", "total_amount", "balance_due", "notes", "terms", "client", "client_email", "description", "quantity", "unit_price", "payment_method"],
    "inventory": ["product_name", "variant_name", "quantity", "reserved_quantity", "available_quantity", "reorder_level", "warehouse_location"],
}

MAX_PROMPT_ROWS = 3

MAPPING_PROMPT_TEMPLATE = """You are an expert data architect responsible for migrating messy, unpredictable user CSV/Excel files into a strict relational database schema. 

Your task is to analyze the incoming columns and map them to the correct target database column.

### TARGET COLUMNS
Here are the exact schemas of our database for each data type.
<schemas>
{schemas}
</schemas>

### INPUT DATA
- Incoming Headers: {headers}
- Sample Data: {sample_rows}

### RULES
3. Guess the data_type (stock, clients, suppliers, invoices, inventory, or other).
4. Analyze both the Incoming Headers AND the Sample Data. **Trust the Header names primarily**. The Header is usually the best indicator of what the column represents (e.g., a header named "RC" maps to 'rc', even if the sample data just looks like random numbers).
5. Use the Sample Data to confirm the header, or to figure out what a column is if the header is generic (like "Column 1" or "Data").
6. You may ONLY map to one of the exact column names available in the <schemas> list for the detected data type.
8. If the Source Header logically matches a Target Column (even if the wording is slightly different, like "Nom" -> "contact_name" or "company_name", "Téléphone" -> "phone", "Ville" -> "city"), map it! Be lenient and intelligent.
9. If the Source Header has absolutely NO logical equivalent in the target schema (e.g. "Genre", "Date de naissance", "Allergies" for a B2B client schema), you MUST output "UNMAPPED".
10. Provide a short 2-3 sentence analysis of the entire dataset.

Output strictly in the requested JSON format."""


class ColumnMapping(BaseModel):
    source_header: str = Field(description="The original header name provided in the user's file.")
    mapped_column: str = Field(description="The exact database column this maps to. MUST be one of the target schema fields or 'UNMAPPED'.")
    confidence_score: float = Field(description="A score from 0.0 to 1.0 indicating how confident you are in this mapping.")
    reasoning: str = Field(description="A brief, 1-sentence explanation of why this mapping was chosen based on the header and sample data.")

class MappingResponse(BaseModel):
    data_type: Literal['stock', 'suppliers', 'clients', 'inventory', 'invoices', 'other'] = Field(description="Classification")
    columns: list[ColumnMapping]
    analysis: str = Field(description="A short, intelligent human-like summary (2-3 sentences) of what this dataset represents, what the data is about, and any obvious insights.")


class SpreadsheetError(Exception):
    pass


import datetime

def _to_native(value):
    """Converts a pandas/numpy scalar to a plain JSON-serializable Python value."""
    if pd.isna(value):
        return None
    if hasattr(value, 'item'):  # numpy scalar (int64, float64, bool_, ...)
        value = value.item()
    if isinstance(value, (pd.Timestamp, datetime.datetime, datetime.date)):
        return value.strftime('%Y-%m-%d')
    return value


def parse_spreadsheet(file_bytes):
    """Reads the first sheet of an Excel file.

    Returns (headers, rows) — rows is a list of dicts keyed by the ORIGINAL column headers,
    with values converted to plain JSON-serializable Python types.
    """
    try:
        # Read without headers first to find the real header row
        df = pd.read_excel(io.BytesIO(file_bytes), sheet_name=0, engine='openpyxl', header=None)
    except Exception as exc:
        raise SpreadsheetError(f'Could not read spreadsheet: {exc}') from exc

    if df.empty:
        raise SpreadsheetError('The spreadsheet has no data rows')

    # Drop completely empty rows and columns
    df = df.dropna(how='all').dropna(axis=1, how='all')
    df = df.reset_index(drop=True)

    if df.empty:
        raise SpreadsheetError('The spreadsheet has no data rows')

    # Smart header detection: find the row with the most non-null cells in the first 15 rows
    header_idx = 0
    max_non_null = 0
    for i in range(min(15, len(df))):
        non_null_count = df.iloc[i].notna().sum()
        if non_null_count > max_non_null:
            max_non_null = non_null_count
            header_idx = i

    # Extract the headers
    raw_headers = df.iloc[header_idx]
    headers = []
    seen = set()
    for i, c in enumerate(raw_headers):
        val = str(c).strip() if pd.notnull(c) else f"Unnamed_{i}"
        # Ensure unique headers
        original_val = val
        counter = 1
        while val in seen:
            val = f"{original_val}_{counter}"
            counter += 1
        seen.add(val)
        headers.append(val)

    # The data is everything after the header row
    df = df.iloc[header_idx + 1:]
    df.columns = headers
    
    # Extract structural info
    df = df.where(pd.notnull(df), None)
    
    rows = [
        {header: _to_native(value) for header, value in zip(headers, record)}
        for record in df.itertuples(index=False, name=None)
    ]
    return headers, rows


def _slugify(text):
    slug = re.sub(r'[^a-z0-9]+', '_', str(text).strip().lower()).strip('_')
    return slug or 'column'


def _fallback_columns(headers):
    """Used when the model's response is malformed."""
    columns = []
    for header in headers:
        columns.append({
            'source_header': header, 
            'mapped_column': 'UNMAPPED', 
            'confidence_score': 0.0,
            'reasoning': 'System fallback due to processing error.'
        })
    return columns


def propose_mapping(headers: list[str], sample_rows: list[dict], expected_type: str = None) -> dict:
    """
    Calls Gemini to intelligently map spreadsheet headers to Fawatir schemas.
    """
    import os
    import json
    import google.generativeai as genai

    if expected_type and expected_type in TARGET_SCHEMAS:
        schemas_to_pass = {expected_type: TARGET_SCHEMAS[expected_type]}
    else:
        schemas_to_pass = TARGET_SCHEMAS

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key or api_key == 'votre_cle_api_gemini_ici':
        print("Invalid or missing Gemini API key. Using fallback.")
        return {
            'data_type': expected_type or 'other',
            'analysis': 'Analyse impossible : Clé API Gemini manquante.',
            'columns': _fallback_columns(headers)
        }

    genai.configure(api_key=api_key)
    
    prompt = MAPPING_PROMPT_TEMPLATE.format(
        schemas=json.dumps(schemas_to_pass, indent=2),
        headers=json.dumps(headers, ensure_ascii=False),
        sample_rows=json.dumps(sample_rows[:MAX_PROMPT_ROWS], ensure_ascii=False, default=str),
    )

    models_to_try = [
        "gemini-3.5-flash-lite",
        "gemini-3-flash-preview",
        "gemini-flash-lite-latest",
        "gemini-3.1-flash-lite-preview",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash-lite",
        "gemini-pro-latest",
        "gemini-2.0-flash",
        "gemini-2.5-flash",
    ]

    parsed = None
    last_error = None

    for model_name in models_to_try:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                )
            )
            response_text = response.text.strip()
            parsed = json.loads(response_text)
            print(f"--- SUCCESS WITH MODEL: {model_name} ---")
            print(json.dumps(parsed, indent=2))
            break  # Stop trying if successful
        except Exception as e:
            print(f"Failed with model {model_name}: {str(e)}")
            last_error = str(e)
            continue

    if not parsed:
        print("All models failed. Last error:", last_error)
        return {
            'data_type': expected_type or 'other',
            'analysis': 'L\'IA est actuellement indisponible (Quota Google dépassé). Veuillez mapper vos colonnes manuellement ci-dessous.',
            'columns': _fallback_columns(headers)
        }

    data_type = parsed.get('data_type') if isinstance(parsed, dict) else None
    columns = parsed.get('columns') or parsed.get('mappings') if isinstance(parsed, dict) else None
    analysis = parsed.get('analysis') if isinstance(parsed, dict) else None

    # Handle the case where the model returns a dictionary of mappings instead of a list of objects
    # It might be in 'mapping', 'mappings', or 'columns'
    dict_mapping = None
    if isinstance(columns, dict):
        dict_mapping = columns
    elif not columns and isinstance(parsed, dict) and isinstance(parsed.get('mapping'), dict):
        dict_mapping = parsed.get('mapping')
        
    if dict_mapping:
        columns = []
        for header in headers:
            mapped = dict_mapping.get(header) or 'UNMAPPED'
            if isinstance(mapped, dict):  # In case it's a nested dict
                mapped = mapped.get('mapped_column') or mapped.get('target') or 'UNMAPPED'
            columns.append({
                'source_header': header,
                'mapped_column': str(mapped),
                'confidence_score': 0.9,
                'reasoning': ''
            })

    # Guarantee uniqueness and completeness of mapped columns (excluding UNMAPPED)
    if isinstance(columns, list):
        seen = set()
        clean_columns = []
        
        # Create a lookup for AI's mapped columns by source header
        ai_mappings = {}
        for col in columns:
            if not isinstance(col, dict):
                continue
            source = col.get('source_header') or col.get('source')
            if source:
                ai_mappings[source] = col
                
        for header in headers:
            col = ai_mappings.get(header)
            
            if col:
                mapped_col = col.get('mapped_column') or col.get('target')
                confidence = col.get('confidence_score', 0.9)
                reasoning = col.get('reasoning', '')
            else:
                mapped_col = 'UNMAPPED'
                confidence = 0.0
                reasoning = 'Not mapped by AI'
            
            if mapped_col and mapped_col != 'UNMAPPED':
                mapped_col = re.sub(r'[^a-z0-9_]', '_', str(mapped_col).lower()).strip('_')
                if mapped_col:
                    original_mapped = mapped_col
                    counter = 2
                    while mapped_col in seen:
                        mapped_col = f'{original_mapped}_{counter}'
                        counter += 1
                    seen.add(mapped_col)
            else:
                mapped_col = 'UNMAPPED'
            
            clean_columns.append({
                'source_header': header,
                'mapped_column': mapped_col,
                'confidence_score': confidence,
                'reasoning': reasoning
            })
        columns = clean_columns

    if not columns or len(columns) != len(headers):
        columns = _fallback_columns(headers)

    return {
        'data_type': expected_type or data_type or 'other',
        'analysis': analysis or 'No analysis generated.',
        'columns': columns
    }


def apply_mapping(rows, column_mapping):
    """Renames every row's keys per column_mapping; columns with UNMAPPED are collected in metadata."""
    normalized = []
    for row in rows:
        new_row = {}
        metadata = {}
        for col in column_mapping:
            mapped_col = col.get('mapped_column')
            source_val = row.get(col['source_header'])
            
            if mapped_col and mapped_col != 'UNMAPPED':
                new_row[mapped_col] = source_val
            else:
                if source_val is not None and source_val != '':
                    metadata[col['source_header']] = source_val
        
        new_row['metadata'] = metadata
        normalized.append(new_row)
    return normalized
