import Link from "next/link";
import { Plus, MoreHorizontal } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import { mad, statusTone } from "@/lib/format";
import { facturesList } from "@/lib/mock-data";

const statutFilters = ["Toutes", "Brouillon", "Envoyée", "Vue", "Payée", "En retard", "Annulée"];

export default function FacturesPage({
  searchParams,
}: {
  searchParams?: { statut?: string };
}) {
  const activeStatut = searchParams?.statut ?? "Toutes";
  const rows =
    activeStatut === "Toutes"
      ? facturesList
      : facturesList.filter((f) => f.statut === activeStatut);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">Factures</h1>
          <p className="text-[13px] text-ink-400">Créez, suivez et encaissez vos factures</p>
        </div>
        <Link
          href="/factures/nouvelle"
          className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
        >
          <Plus size={15} /> Nouvelle facture
        </Link>
      </div>

      <div className="ledger-card !p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {statutFilters.map((s) => (
              <Link
                key={s}
                href={s === "Toutes" ? "/factures" : `/factures?statut=${encodeURIComponent(s)}`}
                className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                  activeStatut === s
                    ? "bg-ink-900 text-white"
                    : "bg-paper text-ink-600 hover:bg-ink-200/50"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Rechercher une facture..."
              className="w-56 rounded-md border border-ink-200 bg-paper px-3 py-1.5 text-[13px] placeholder:text-ink-400 focus:border-brass/60 focus:outline-none"
            />
          </div>
        </div>

        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
              <th className="pb-2.5 font-medium">Facture N°</th>
              <th className="pb-2.5 font-medium">Client</th>
              <th className="pb-2.5 font-medium">Montant</th>
              <th className="pb-2.5 font-medium">Statut</th>
              <th className="pb-2.5 font-medium">Date d'émission</th>
              <th className="pb-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/60">
            {rows.map((f) => (
              <tr key={f.id} className="group">
                <td className="py-3">
                  <Link href={`/factures/${f.id}`} className="font-medium text-brass hover:underline">
                    {f.numero}
                  </Link>
                </td>
                <td className="py-3 text-ink-700">{f.client}</td>
                <td className="figure py-3 text-ink-900">{mad(f.montant)}</td>
                <td className="py-3">
                  <StatusChip tone={statusTone(f.statut)}>{f.statut}</StatusChip>
                </td>
                <td className="py-3 text-ink-400">{f.dateEmission}</td>
                <td className="py-3 text-right">
                  <button className="rounded-md p-1.5 text-ink-400 opacity-0 hover:bg-ink-900/[0.04] hover:text-ink-700 group-hover:opacity-100">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-ink-400">
                  Aucune facture pour ce statut.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
