import { Download } from "lucide-react";
import { revenuMensuel, topClients, revenuParCategorie, kpis } from "@/lib/mock-data";
import { mad } from "@/lib/format";

export default function RapportsPage() {
  const maxCat = Math.max(...revenuParCategorie.map((c) => c.montant));

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">Rapports</h1>
          <p className="text-[13px] text-ink-400">Analysez la performance de votre activité</p>
        </div>
        <button className="flex items-center gap-2 rounded-md border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50">
          <Download size={15} /> Exporter (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="ledger-card">
          <p className="text-[12px] text-ink-400">Revenu total (6 mois)</p>
          <p className="figure mt-1 text-[20px] font-medium text-ink-900">{mad(kpis.revenuTotal)}</p>
        </div>
        <div className="ledger-card">
          <p className="text-[12px] text-ink-400">Facture moyenne</p>
          <p className="figure mt-1 text-[20px] font-medium text-ink-900">{mad(kpis.factureMoyenne)}</p>
        </div>
        <div className="ledger-card">
          <p className="text-[12px] text-ink-400">Taux de recouvrement</p>
          <p className="figure mt-1 text-[20px] font-medium text-ink-900">{kpis.tauxRecouvrement}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="ledger-card lg:col-span-2">
          <p className="mb-4 text-[13.5px] font-medium text-ink-900">Revenu mensuel</p>
          <div className="flex h-40 items-end gap-3">
            {revenuMensuel.map((d) => (
              <div key={d.mois} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-sm bg-brass/80"
                  style={{ height: `${(d.revenu / Math.max(...revenuMensuel.map((r) => r.revenu))) * 100}%` }}
                  title={mad(d.revenu)}
                />
                <span className="text-[11px] text-ink-400">{d.mois}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ledger-card">
          <p className="mb-4 text-[13.5px] font-medium text-ink-900">Meilleurs clients</p>
          <div className="space-y-2.5">
            {topClients
              .sort((a, b) => b.revenu - a.revenu)
              .map((c, i) => (
                <div key={c.nom} className="flex items-center justify-between text-[12.5px]">
                  <span className="flex items-center gap-2 text-ink-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brass/15 text-[10px] font-medium text-brass">
                      {i + 1}
                    </span>
                    {c.nom}
                  </span>
                  <span className="figure text-ink-900">{mad(c.revenu)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="ledger-card">
        <p className="mb-4 text-[13.5px] font-medium text-ink-900">Revenu par catégorie</p>
        <div className="space-y-3">
          {revenuParCategorie.map((c) => (
            <div key={c.categorie}>
              <div className="mb-1 flex justify-between text-[12.5px]">
                <span className="text-ink-700">{c.categorie}</span>
                <span className="figure text-ink-900">{mad(c.montant)}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-200/60">
                <div
                  className="h-full rounded-full bg-brass"
                  style={{ width: `${(c.montant / maxCat) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
