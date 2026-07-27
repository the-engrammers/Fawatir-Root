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

MAX_PROMPT_ROWS = 10

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
1. Guess the data_type (products, clients, suppliers, invoices, inventory, or other).
2. Analyze both the Incoming Headers AND the Sample Data. **Trust the Header names primarily**. The Header is usually the best indicator of what the column represents (e.g., a header named "RC" maps to 'rc', even if the sample data just looks like random numbers).
3. Use the Sample Data to confirm the header, or to figure out what a column is if the header is generic (like "Column 1" or "Data").
4. You may ONLY map to one of the exact column names available in the <schemas> list for the detected data type.
5. If the Header matches a target column well, map it and assign a high confidence score (> 0.90).
6. If the Source Header and Sample Data do not logically match ANY of the Target Columns, you MUST output "UNMAPPED" for the mapped_column. Do not force a bad fit.
7. Provide a short 2-3 sentence analysis of the entire dataset.

Output strictly in the requested JSON format."""


class ColumnMapping(BaseModel):
    source_header: str = Field(description="The original header name provided in the user's file.")
    mapped_column: str = Field(description="The exact database column this maps to. MUST be one of the target schema fields or 'UNMAPPED'.")
    confidence_score: float = Field(description="A score from 0.0 to 1.0 indicating how confident you are in this mapping.")
    reasoning: str = Field(description="A brief, 1-sentence explanation of why this mapping was chosen based on the header and sample data.")

class MappingResponse(BaseModel):
    data_type: Literal['stock', 'products', 'suppliers', 'clients', 'inventory', 'invoices', 'other'] = Field(description="Classification")
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
    If expected_type is provided, it forces the AI to map it to that type.
    """
    if not settings.GEMINI_API_KEY:
        # Fallback to simple slugification if API key is not configured
        return {'data_type': 'other', 'columns': _fallback_columns(headers)}

    genai.configure(api_key=settings.GEMINI_API_KEY, transport="rest")
    model = genai.GenerativeModel('gemini-flash-lite-latest')

    # If expected_type is provided, we only pass that schema to the AI
    # to prevent it from guessing wrong or taking the generic 'other' path
    if expected_type and expected_type in TARGET_SCHEMAS:
        schemas_to_pass = {expected_type: TARGET_SCHEMAS[expected_type]}
    else:
        schemas_to_pass = TARGET_SCHEMAS

    prompt = MAPPING_PROMPT_TEMPLATE.format(
        schemas=json.dumps(schemas_to_pass, indent=2),
        headers=json.dumps(headers, ensure_ascii=False),
        sample_rows=json.dumps(sample_rows[:MAX_PROMPT_ROWS], ensure_ascii=False, default=str),
    )

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=MappingResponse,
                temperature=0.0,
            )
        )
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        parsed = json.loads(response_text)
        print("--- LLM GENERATED JSON ---")
        print(json.dumps(parsed, indent=2))
        print("--------------------------")
    except json.JSONDecodeError as e:
        print("JSON Decode Error:", e)
        parsed = None
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("Model Response Error:", e)
        # Any API error (Quota, NotFound, Network) MUST be surfaced to the UI
        # so the user knows why it failed, rather than pretending the AI thinks everything is UNMAPPED.
        raise SpreadsheetError(f"AI API Error: {str(e)}")

    data_type = parsed.get('data_type') if isinstance(parsed, dict) else None
    columns = parsed.get('columns') if isinstance(parsed, dict) else None
    analysis = parsed.get('analysis') if isinstance(parsed, dict) else None

    # Guarantee uniqueness of mapped columns (excluding UNMAPPED)
    if isinstance(columns, list):
        seen = set()
        clean_columns = []
        for col in columns:
            if not isinstance(col, dict):
                continue
            mapped_col = col.get('mapped_column')
            
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
                'source_header': col.get('source_header'),
                'mapped_column': mapped_col,
                'confidence_score': col.get('confidence_score', 0.0),
                'reasoning': col.get('reasoning', '')
            })
        columns = clean_columns

    if not columns or len(columns) != len(headers):
        columns = _fallback_columns(headers)

    return {
        'data_type': data_type or 'other',
        'analysis': analysis or 'No analysis generated.',
        'columns': columns
    }


def apply_mapping(rows, column_mapping):
    """Renames every row's keys per column_mapping; columns with UNMAPPED are dropped."""
    normalized = []
    for row in rows:
        new_row = {}
        for col in column_mapping:
            mapped_col = col.get('mapped_column')
            if mapped_col and mapped_col != 'UNMAPPED':
                new_row[mapped_col] = row.get(col['source_header'])
        normalized.append(new_row)
    return normalized
