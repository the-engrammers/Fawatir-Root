import { NextResponse } from 'next/server';
import { getClientById, deleteClient } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const client = getClientById(params.id);
  if (!client) return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
  return NextResponse.json(client);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  deleteClient(params.id);
  return NextResponse.json({ message: "Client supprimé avec succès" });
}
