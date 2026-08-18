import { NextResponse } from 'next/server';
import { deleteDepense } from '@/lib/mock-data-store';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  deleteDepense(params.id);
  return NextResponse.json({ message: "Dépense supprimée" });
}
