import { NextResponse } from 'next/server';
import { getProducts, addProduct } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  let products = getProducts();
  if (search) {
    const query = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query));
  }
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = addProduct(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création du produit" }, { status: 500 });
  }
}
