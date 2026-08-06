import { NextResponse } from 'next/server';
import { getProductById, deleteProduct } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const product = getProductById(params.id);
  if (!product) return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  return NextResponse.json(product);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  deleteProduct(params.id);
  return NextResponse.json({ message: "Produit supprimé avec succès" });
}
