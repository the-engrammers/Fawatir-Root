import Link from "next/link";
import { Plus } from "lucide-react";
import { bonsCommandeList } from "@/lib/mock-data";
import { mad } from "@/lib/format";

const statutStyles: Record<string, string> = {
  Brouillon: "bg-status-infoBg text-status-info",
  Envoyé: "bg-status-warningBg text-status-warning",
  Partiel: "bg-brass/15 text-brass-dark",
  Reçu: "bg-status-successBg text-status-success",
};

export default function BonsCommandePage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">
            Bons de commande
          </h1>
          <p className="text-[13px] text-ink-400">Gérez vos bons de commande fournisseurs</p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800">
          <Plus size={15} /> Nouveau bon de commande
        </button>
      </div>

      <div className="space-y-2.5">
        {bonsCommandeList.map((po) => {
          const totalArticles = po.articles.reduce((s, a) => s + a.qte, 0);
          const totalRecu = po.articles.reduce((s, a) => s + a.recu, 0);
          const progress = totalArticles > 0 ? (totalRecu / totalArticles) * 100 : 0;
          return (
            <Link
              key={po.id}
              href={`/bons-de-commande/${po.id}`}
              className="ledger-card flex items-center justify-between !py-3.5 hover:shadow-panel"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink-900">{po.id}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statutStyles[po.statut]}`}>
                    {po.statut}
                  </span>
                </div>
                <p className="text-[12px] text-ink-400">
                  {po.fournisseur} · {po.dateEmission}
                </p>
                {progress > 0 && progress < 100 && (
                  <div className="mt-1.5 h-1 w-40 overflow-hidden rounded-full bg-ink-200/60">
                    <div className="h-full rounded-full bg-brass" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="figure font-medium text-ink-900">{mad(po.montant)}</p>
                <p className="text-[11.5px] text-ink-400">{po.articles.length} article(s)</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
