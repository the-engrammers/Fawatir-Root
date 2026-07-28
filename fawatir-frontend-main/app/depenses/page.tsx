import { Plus } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import { depensesList } from "@/lib/mock-data";
import { mad, statusTone } from "@/lib/format";

export default function DepensesPage() {
  const total = depensesList.reduce((s, d) => s + d.montant, 0);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">Dépenses</h1>
          <p className="text-[13px] text-ink-400">Suivez les dépenses de votre entreprise</p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800">
          <Plus size={15} /> Nouvelle dépense
        </button>
      </div>

      <div className="ledger-card w-fit">
        <p className="text-[12px] text-ink-400">Total des dépenses</p>
        <p className="figure mt-1 text-[22px] font-medium text-ink-900">{mad(total)}</p>
      </div>

      <div className="ledger-card !p-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
              <th className="pb-2.5 font-medium">Référence</th>
              <th className="pb-2.5 font-medium">Catégorie</th>
              <th className="pb-2.5 font-medium">Fournisseur</th>
              <th className="pb-2.5 font-medium">Montant</th>
              <th className="pb-2.5 font-medium">Statut</th>
              <th className="pb-2.5 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/60">
            {depensesList.map((d) => (
              <tr key={d.id}>
                <td className="py-3 font-medium text-ink-900">{d.id}</td>
                <td className="py-3 text-ink-700">{d.categorie}</td>
                <td className="py-3 text-ink-500">{d.fournisseur}</td>
                <td className="figure py-3 text-ink-900">{mad(d.montant)}</td>
                <td className="py-3">
                  <StatusChip tone={statusTone(d.statut)}>{d.statut}</StatusChip>
                </td>
                <td className="py-3 text-ink-400">{d.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
