import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil, Download, CheckCircle2, MoreHorizontal } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import { mad, statusTone } from "@/lib/format";
import { facturesList } from "@/lib/mock-data";

export default function FactureDetailPage({ params }: { params: { id: string } }) {
  const facture = facturesList.find((f) => f.id === params.id);
  if (!facture) notFound();

  const sousTotal = facture.lignes.reduce((sum, l) => sum + l.qte * l.prix, 0);
  const remiseAmount = sousTotal * (facture.remise / 100);
  const taxe = (sousTotal - remiseAmount) * (facture.taxePct / 100);
  const total = sousTotal - remiseAmount + taxe;

  return (
    <div className="mx-auto max-w-[1100px] space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/factures"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:border-brass/50 hover:text-ink-800"
          >
            <ChevronLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[20px] font-semibold text-ink-900">
                {facture.numero}
              </h1>
              <StatusChip tone={statusTone(facture.statut)}>{facture.statut}</StatusChip>
            </div>
            <p className="text-[12.5px] text-ink-400">Créée le {facture.dateEmission}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md border border-ink-200 px-3 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50">
            <Pencil size={14} /> Modifier
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-ink-200 px-3 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50">
            <Download size={14} /> PDF
          </button>
          {facture.statut !== "Payée" && (
            <button className="flex items-center gap-1.5 rounded-md bg-status-success px-3 py-2 text-[13px] font-medium text-white hover:bg-status-success/90">
              <CheckCircle2 size={14} /> Marquer comme payée
            </button>
          )}
          <button className="rounded-md border border-ink-200 p-2 text-ink-500 hover:border-brass/50">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="ledger-card">
          <p className="text-[11.5px] uppercase tracking-wide text-ink-400">Client</p>
          <p className="mt-1 text-[15px] font-medium text-ink-900">{facture.client}</p>
        </div>
        <div className="ledger-card">
          <p className="text-[11.5px] uppercase tracking-wide text-ink-400">Dates</p>
          <div className="mt-1 flex justify-between text-[13px] text-ink-700">
            <span>Émise</span>
            <span>{facture.dateEmission}</span>
          </div>
          <div className="flex justify-between text-[13px] text-ink-700">
            <span>Échéance</span>
            <span>{facture.dateEcheance}</span>
          </div>
        </div>
        <div className="ledger-card">
          <p className="text-[11.5px] uppercase tracking-wide text-ink-400">Total</p>
          <p className="figure mt-1 text-[20px] font-semibold text-ink-900">{mad(total)}</p>
        </div>
      </div>

      <div className="ledger-card flex items-center justify-between">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
          Coordonnées bancaires
        </p>
        <p className="figure text-[13px] text-ink-700">007 780 0001234567890123 45</p>
      </div>

      <div className="ledger-card">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
            Lignes de facture
          </p>
          <span className="text-[12px] text-ink-400">{facture.lignes.length} article(s)</span>
        </div>
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
            {facture.lignes.map((l, idx) => (
              <tr key={idx}>
                <td className="py-2.5 text-ink-400">{idx + 1}</td>
                <td className="py-2.5 text-ink-700">{l.article}</td>
                <td className="figure py-2.5 text-right text-ink-700">{l.qte}</td>
                <td className="figure py-2.5 text-right text-ink-700">{mad(l.prix)}</td>
                <td className="figure py-2.5 text-right font-medium text-ink-900">
                  {mad(l.qte * l.prix)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-3 w-full max-w-xs space-y-1.5 text-[13px]">
          <div className="flex justify-between text-ink-500">
            <span>Sous-total</span>
            <span className="figure">{mad(sousTotal)}</span>
          </div>
          <div className="flex justify-between text-ink-500">
            <span>Taxe ({facture.taxePct}%)</span>
            <span className="figure">{mad(taxe)}</span>
          </div>
          {facture.remise > 0 && (
            <div className="flex justify-between text-ink-500">
              <span>Remise</span>
              <span className="figure">-{mad(remiseAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-ink-200/60 pt-2 text-[15px] font-semibold text-ink-900">
            <span>Total</span>
            <span className="figure">{mad(total)}</span>
          </div>
        </div>
      </div>

      {facture.notes && (
        <div className="ledger-card">
          <p className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-400">Notes</p>
          <p className="text-[13px] text-ink-700">{facture.notes}</p>
        </div>
      )}
    </div>
  );
}
