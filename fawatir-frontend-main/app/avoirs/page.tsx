import { Plus } from "lucide-react";
import { avoirsList } from "@/lib/mock-data";
import { mad } from "@/lib/format";

export default function AvoirsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">Avoirs</h1>
          <p className="text-[13px] text-ink-400">Notes de crédit émises sur vos factures</p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800">
          <Plus size={15} /> Nouvel avoir
        </button>
      </div>

      <div className="ledger-card !p-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
              <th className="pb-2.5 font-medium">Avoir N°</th>
              <th className="pb-2.5 font-medium">Client</th>
              <th className="pb-2.5 font-medium">Facture liée</th>
              <th className="pb-2.5 font-medium">Motif</th>
              <th className="pb-2.5 font-medium">Montant</th>
              <th className="pb-2.5 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/60">
            {avoirsList.map((a) => (
              <tr key={a.id}>
                <td className="py-3 font-medium text-brass">{a.id}</td>
                <td className="py-3 text-ink-700">{a.client}</td>
                <td className="py-3 text-ink-500">{a.facture}</td>
                <td className="py-3 text-ink-500">{a.motif}</td>
                <td className="figure py-3 text-ink-900">-{mad(a.montant)}</td>
                <td className="py-3 text-ink-400">{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
