import Link from "next/link";
import { Plus } from "lucide-react";
import { produitsList } from "@/lib/mock-data";
import { mad } from "@/lib/format";

export default function StocksPage() {
  const suivis = produitsList.filter((p) => p.suivreStock);
  const enRupture = suivis.filter((p) => (p.stock ?? 0) === 0).length;
  const stockBas = suivis.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 10).length;
  const valeurTotale = suivis.reduce((s, p) => s + p.prix * (p.stock ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">
            Gestion des stocks
          </h1>
          <p className="text-[13px] text-ink-400">Gérez vos produits, services et inventaire</p>
        </div>
        <Link
          href="/stocks/nouveau"
          className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
        >
          <Plus size={15} /> Ajouter un produit
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="ledger-card">
          <p className="figure text-[19px] font-medium text-ink-900">{suivis.length}</p>
          <p className="text-[12px] text-ink-400">Produits suivis · {produitsList.length} total</p>
        </div>
        <div className="ledger-card !border-l-status-danger/70">
          <p className="figure text-[19px] font-medium text-ink-900">{enRupture}</p>
          <p className="text-[12px] text-ink-400">En rupture</p>
        </div>
        <div className="ledger-card !border-l-status-warning/70">
          <p className="figure text-[19px] font-medium text-ink-900">{stockBas}</p>
          <p className="text-[12px] text-ink-400">Stock bas</p>
        </div>
        <div className="ledger-card">
          <p className="figure text-[19px] font-medium text-ink-900">{mad(valeurTotale)}</p>
          <p className="text-[12px] text-ink-400">Valeur totale du stock</p>
        </div>
      </div>

      <div className="ledger-card !p-4">
        <input
          type="text"
          placeholder="Rechercher des produits..."
          className="mb-4 w-72 rounded-md border border-ink-200 bg-paper px-3 py-1.5 text-[13px] placeholder:text-ink-400 focus:border-brass/60 focus:outline-none"
        />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
              <th className="pb-2.5 font-medium">Nom</th>
              <th className="pb-2.5 font-medium">SKU</th>
              <th className="pb-2.5 font-medium">Prix</th>
              <th className="pb-2.5 font-medium">Unité</th>
              <th className="pb-2.5 font-medium">Catégorie</th>
              <th className="pb-2.5 font-medium">Stock</th>
              <th className="pb-2.5 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/60">
            {produitsList.map((p) => (
              <tr key={p.id}>
                <td className="py-3">
                  <Link href={`/stocks/${p.id}`} className="font-medium text-ink-900 hover:text-brass">
                    {p.nom}
                  </Link>
                </td>
                <td className="figure py-3 text-ink-500">{p.sku}</td>
                <td className="figure py-3 text-ink-900">{mad(p.prix)}</td>
                <td className="py-3 text-ink-500">{p.unite}</td>
                <td className="py-3">
                  <span className="rounded-full bg-status-infoBg px-2 py-0.5 text-[11px] font-medium text-status-info">
                    {p.categorie}
                  </span>
                </td>
                <td className="figure py-3 text-ink-700">
                  {p.suivreStock ? p.stock : <span className="text-ink-300">—</span>}
                </td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      p.statut === "Actif"
                        ? "bg-status-successBg text-status-success"
                        : "bg-ink-200/60 text-ink-500"
                    }`}
                  >
                    {p.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
