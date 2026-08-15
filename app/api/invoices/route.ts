import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DJANGO_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const res = await fetch(`${DJANGO_URL}/api/invoices/`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de connexion au vrai backend" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Fetch default company and client for POS checkout
    const compRes = await fetch(`${DJANGO_URL}/api/companies/`);
    const compData = await compRes.json();
    const companyId = compData.length > 0 ? compData[0].id : null;

    const cliRes = await fetch(`${DJANGO_URL}/api/clients/`);
    const cliData = await cliRes.json();
    const clientId = cliData.length > 0 ? cliData[0].id : null;

    if (!companyId || !clientId) {
      return NextResponse.json({ error: "Base de données non initialisée. Aucune compagnie ou client trouvé." }, { status: 400 });
    }

    // Format payload for Django Invoice model
    const djangoPayload = {
      company: companyId,
      client: clientId,
      invoice_number: body.invoice_number,
      issue_date: body.date,
      status: body.status,
      subtotal: body.total_amount,
      total_amount: body.total_amount,
    };

    const res = await fetch(`${DJANGO_URL}/api/invoices/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(djangoPayload)
    });

    const created = await res.json();
    return NextResponse.json(created, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création de la facture" }, { status: 500 });
  }
}
