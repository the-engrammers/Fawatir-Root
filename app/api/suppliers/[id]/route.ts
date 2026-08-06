import { NextResponse } from 'next/server';
import { getSupplierById, deleteSupplier } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supplier = getSupplierById(params.id);
  if (!supplier) return NextResponse.json({ error: "Fournisseur non trouvé" }, { status: 404 });
  return NextResponse.json(supplier);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  deleteSupplier(params.id);
  return NextResponse.json({ message: "Fournisseur supprimé avec succès" });
}
