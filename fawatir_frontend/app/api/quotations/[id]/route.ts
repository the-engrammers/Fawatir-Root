import { NextResponse } from 'next/server';
import { getQuotationById, deleteQuotation } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const quotation = getQuotationById(params.id);
  if (!quotation) return NextResponse.json({ error: "Devis non trouvé" }, { status: 404 });
  return NextResponse.json(quotation);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  deleteQuotation(params.id);
  return NextResponse.json({ message: "Devis supprimé avec succès" });
}
