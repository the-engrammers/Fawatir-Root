import json
import logging
import os
import uuid
from typing import List, Dict, Any, Optional

import google.generativeai as genai
from django.conf import settings
from django.db.models import Q

from api.models import Client, Product, Quotation, QuotationItem, WhatsappMessage, Company

logger = logging.getLogger(__name__)

# Configure Gemini
def get_genai_model():
    api_key = os.environ.get('GEMINI_API_KEY')
    if hasattr(settings, 'GEMINI_API_KEY') and settings.GEMINI_API_KEY:
        api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")
    
    genai.configure(api_key=api_key)
    # Using gemini-3.5-flash-lite to avoid deprecation and strict rate limits
    return genai.GenerativeModel('gemini-3.5-flash-lite', tools=[
        check_stock,
        create_quotation,
        prepare_whatsapp_message,
        get_clients
    ])

# -----------------------------------------------------------------------------
# AI Tools (Function Calling)
# -----------------------------------------------------------------------------

def get_company() -> Company:
    # For now, returning the first company. In a real multi-tenant app, 
    # this should be passed down from the request user.
    return Company.objects.first()

def check_stock(product_name: str) -> str:
    """
    Search for a product by name to check its price and stock quantity.
    
    Args:
        product_name: The name of the product to search for.
    """
    company = get_company()
    products = Product.objects.filter(
        Q(name__icontains=product_name) | Q(sku__icontains=product_name),
        company=company
    )[:5]
    
    if not products:
        return f"Aucun produit trouvé pour '{product_name}'."
    
    results = []
    for p in products:
        stock = p.inventory_records.first()
        qty = stock.quantity if stock else (0 if p.track_inventory else "Non suivi")
        results.append(f"- {p.name} (SKU: {p.sku}): Prix {p.selling_price} MAD, Stock: {qty}")
    
    return "\n".join(results)

def get_clients(search_query: str = "") -> str:
    """
    Search for clients in the database. Leave search_query empty to get recent clients.
    
    Args:
        search_query: Name or email of the client to search for.
    """
    company = get_company()
    if search_query:
        clients = Client.objects.filter(
            Q(company_name__icontains=search_query) | 
            Q(contact_name__icontains=search_query) | 
            Q(email__icontains=search_query),
            company=company
        )[:10]
    else:
        clients = Client.objects.filter(company=company).order_by('-created_at')[:10]
        
    if not clients:
        return "Aucun client trouvé."
    
    results = []
    for c in clients:
        phone = c.phone or c.mobile or "Pas de numéro"
        name = c.contact_name or c.company_name or "Nom inconnu"
        results.append(f"- ID: {c.id} | Nom: {name} | Tel: {phone} | Email: {c.email or 'N/A'}")
        
    return "\n".join(results)

def prepare_whatsapp_message(client_search: str, message: str) -> str:
    """
    Finds a client and generates a WhatsApp message link (wa.me) for them.
    This does NOT send the message automatically. It gives the link to the user to click.
    
    Args:
        client_search: The name of the client to send the message to.
        message: The exact text message to send.
    """
    company = get_company()
    clients = Client.objects.filter(
        Q(company_name__icontains=client_search) | Q(contact_name__icontains=client_search),
        company=company
    )
    if not clients.exists():
        return f"Client '{client_search}' introuvable. Demandez à l'utilisateur de préciser le nom."
        
    client = clients.first()
    phone = client.mobile or client.phone
    if not phone:
        return f"Le client '{client.company_name}' n'a pas de numéro de téléphone enregistré."
        
    # Clean phone number (remove spaces, ensure it has country code, simplified for demo)
    clean_phone = ''.join(filter(str.isdigit, str(phone)))
    if clean_phone.startswith('0'):
        clean_phone = '212' + clean_phone[1:] # Default to Morocco +212 for this demo
        
    import urllib.parse
    encoded_message = urllib.parse.quote(message)
    wa_link = f"https://wa.me/{clean_phone}?text={encoded_message}"
    
    # Log the intent
    WhatsappMessage.objects.create(
        company=company,
        client=client,
        phone_number=clean_phone,
        message=message,
        status="Lien généré"
    )
    
    return f"SUCCÈS: Donnez ce lien à l'utilisateur pour qu'il clique et envoie le message: [Envoyer WhatsApp]({wa_link})"

def create_quotation(client_search: str, product_names: List[str]) -> str:
    """
    Creates a new Quotation (Devis) for a client with the specified products.
    
    Args:
        client_search: The name of the client.
        product_names: A list of product names to add to the quotation.
    """
    company = get_company()
    # Find client
    clients = Client.objects.filter(
        Q(company_name__icontains=client_search) | Q(contact_name__icontains=client_search),
        company=company
    )
    if not clients.exists():
        return f"Client '{client_search}' introuvable."
    client = clients.first()
    
    # Create quotation
    import random
    q_number = f"DEV-{random.randint(1000, 9999)}"
    quotation = Quotation.objects.create(
        company=company,
        client=client,
        quotation_number=q_number,
        status="Brouillon",
        total_amount=0
    )
    
    # Add products
    total = 0
    added_products = []
    for p_name in product_names:
        prod = Product.objects.filter(name__icontains=p_name, company=company).first()
        if prod:
            price = prod.selling_price or 0
            QuotationItem.objects.create(
                quotation=quotation,
                product=prod,
                description=prod.description or prod.name,
                quantity=1,
                unit_price=price,
                line_total=price
            )
            total += price
            added_products.append(prod.name)
            
    quotation.total_amount = total
    quotation.save()
    
    return f"Devis {q_number} créé avec succès pour le client {client.company_name} avec les produits: {', '.join(added_products)}. Montant total: {total} MAD."

# -----------------------------------------------------------------------------
# Chatbot Runner
# -----------------------------------------------------------------------------

def process_chat_message(user_message: str, history: List[Dict[str, str]] = None) -> str:
    """
    Processes a chat message using Gemini and returns the assistant's response.
    Executes function calls automatically if Gemini requests them.
    """
    try:
        model = get_genai_model()
        
        # We start a new chat session but we could inject history if needed
        chat = model.start_chat(enable_automatic_function_calling=True)
        
        system_prompt = (
            "Tu es l'Assistant IA de Fatourati, un logiciel CRM et Facturation. "
            "Tu peux aider l'utilisateur à gérer ses clients, ses stocks, envoyer des messages WhatsApp, et créer des devis. "
            "Si on te demande de montrer des données (comme une liste de clients ou de produits), utilise TOUJOURS un tableau Markdown pour que ce soit beau. "
            "Sois concis, professionnel et direct."
        )
        
        # We send a background instruction first
        chat.send_message(system_prompt)
        
        # Now send the actual user message
        response = chat.send_message(user_message)
        
        return response.text
        
    except Exception as e:
        logger.error(f"Chatbot error: {e}")
        return f"Désolé, une erreur technique s'est produite lors de la communication avec l'IA: {str(e)}"
