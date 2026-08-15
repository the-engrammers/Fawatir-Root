import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { docId: string } }) {
  return NextResponse.json({
    id: params.docId,
    status: "completed",
    extracted_data: {
      fournisseur: "Maroc Distribution SARL",
      client: "Atlas Tech SARL",
      numero_facture: "FAC-2024-99",
      montant_ht: 8500,
      montant_ttc: 10200,
      lignes: [
        { description: "Maintenance Serveur Cloud", quantite: 1, prix_unitaire: 8500, montant: 8500 }
      ]
    }
  });
}
