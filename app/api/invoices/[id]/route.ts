import { NextResponse } from 'next/server';
import { getInvoiceById, deleteInvoice } from '@/lib/mock-data-store';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const inv = getInvoiceById(params.id);
  if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  return NextResponse.json(inv);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  deleteInvoice(params.id);
  return NextResponse.json({ message: "Invoice deleted" });
}
