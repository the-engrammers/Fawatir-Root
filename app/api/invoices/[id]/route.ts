import { NextResponse } from 'next/server';
import { getInvoiceById, deleteInvoice, updateInvoice } from '@/lib/mock-data-store';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const inv = getInvoiceById(params.id);
  if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  return NextResponse.json(inv);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  deleteInvoice(params.id);
  return NextResponse.json({ message: "Invoice deleted" });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const inv = updateInvoice(params.id, body);
    if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    return NextResponse.json(inv);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
