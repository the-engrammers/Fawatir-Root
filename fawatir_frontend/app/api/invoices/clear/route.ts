import { NextResponse } from 'next/server';
import { clearInvoices } from '@/lib/mock-data-store';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  clearInvoices();
  return NextResponse.json({ message: "Factures effacées avec succès" });
}
