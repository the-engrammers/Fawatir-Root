import { NextResponse } from 'next/server';
import { getEquipe, addEquipe } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getEquipe());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = addEquipe(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
