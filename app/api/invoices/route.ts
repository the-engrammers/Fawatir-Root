import { NextResponse } from 'next/server';
import { getInvoices, addInvoice } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';
export async function GET() {
  return NextResponse.json(getInvoices());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = addInvoice(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création de la facture" }, { status: 500 });
  }
}
