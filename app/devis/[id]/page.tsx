import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil, Download, RefreshCw } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import { mad, statusTone } from "@/lib/format";
import { getQuotationById } from "@/lib/mock-data-store";

export default function DevisDetailPage({ params }: { params: { id: string } }) {
  const devis = getQuotationById(params.id);
  if (!devis) notFound();

  const lignes = devis.lignes || [];
  const sousTotal = lignes.reduce((s: any, l: any) => s + (l.quantite || l.qte || 1) * (l.prix_unitaire || l.prix || 0), 0);
  const taxe = sousTotal * 0.2;
  const total = sousTotal + taxe;

  return (
    <div className="mx-auto max-w-[1100px] space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/devis"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:border-brass/50 hover:text-ink-800"
          >
            <ChevronLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[20px] font-semibold text-ink-900">
                {devis.quotation_number}
              </h1>
              <StatusChip tone={statusTone(devis.status)}>{devis.status}</StatusChip>
            </div>
            <p className="text-[12.5px] text-ink-400">Valide jusqu'au {devis.date}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md border border-ink-200 px-3 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50">
            <Pencil size={14} /> Modifier
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-ink-200 px-3 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50">
            <Download size={14} /> PDF
          </button>
          {devis.statut !== "Converti" && (
            <button className="flex items-center gap-1.5 rounded-md bg-brass px-3 py-2 text-[13px] font-medium text-white hover:bg-brass-dark">
              <RefreshCw size={14} /> Convertir en facture
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="ledger-card">
          <p className="text-[11.5px] uppercase tracking-wide text-ink-400">Client</p>
          <p className="mt-1 text-[15px] font-medium text-ink-900">{devis.client_name}</p>
        </div>
        <div className="ledger-card">
          <p className="text-[11.5px] uppercase tracking-wide text-ink-400">Validité</p>
          <p className="mt-1 text-[15px] font-medium text-ink-900">{devis.date}</p>
        </div>
        <div className="ledger-card">
          <p className="text-[11.5px] uppercase tracking-wide text-ink-400">Total</p>
          <p className="figure mt-1 text-[20px] font-semibold text-ink-900">{mad(total)}</p>
        </div>
      </div>

      <div className="ledger-card">
        <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-ink-400">
          Lignes du devis
        </p>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
              <th className="pb-2 font-medium">#</th>
              <th className="pb-2 font-medium">Article</th>
              <th className="pb-2 font-medium text-right">Qté</th>
              <th className="pb-2 font-medium text-right">Prix</th>
              <th className="pb-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/60">
            {lignes.map((l: any, idx: number) => {
              const qte = l.quantite || l.qte || 1;
              const prix = l.prix_unitaire || l.prix || 0;
              return (
                <tr key={idx}>
                  <td className="py-2.5 text-ink-400">{idx + 1}</td>
                  <td className="py-2.5 text-ink-700">{l.description || l.article || "Article inconnu"}</td>
                  <td className="figure py-2.5 text-right text-ink-700">{qte}</td>
                  <td className="figure py-2.5 text-right text-ink-700">{mad(prix)}</td>
                  <td className="figure py-2.5 text-right font-medium text-ink-900">
                    {mad(qte * prix)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="ml-auto mt-3 w-full max-w-xs space-y-1.5 text-[13px]">
          <div className="flex justify-between text-ink-500">
            <span>Sous-total</span>
            <span className="figure">{mad(sousTotal)}</span>
          </div>
          <div className="flex justify-between text-ink-500">
            <span>Taxe (20%)</span>
            <span className="figure">{mad(taxe)}</span>
          </div>
          <div className="flex justify-between border-t border-ink-200/60 pt-2 text-[15px] font-semibold text-ink-900">
            <span>Total</span>
            <span className="figure">{mad(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
