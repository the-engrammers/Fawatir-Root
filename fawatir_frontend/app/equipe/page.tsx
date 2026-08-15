import { UserPlus } from "lucide-react";
import { equipeList } from "@/lib/mock-data";

export default function EquipePage() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">Équipe</h1>
          <p className="text-[13px] text-ink-400">Gérez les membres et leurs accès</p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800">
          <UserPlus size={15} /> Inviter un membre
        </button>
      </div>

      <div className="ledger-card !p-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
              <th className="pb-2.5 font-medium">Nom</th>
              <th className="pb-2.5 font-medium">E-mail</th>
              <th className="pb-2.5 font-medium">Rôle</th>
              <th className="pb-2.5 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/60">
            {equipeList.map((m) => (
              <tr key={m.id}>
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brass/15 text-[11px] font-medium text-brass">
                      {m.nom.charAt(0)}
                    </span>
                    <span className="font-medium text-ink-900">{m.nom}</span>
                  </div>
                </td>
                <td className="py-3 text-ink-500">{m.email}</td>
                <td className="py-3 text-ink-700">{m.role}</td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      m.statut === "Actif"
                        ? "bg-status-successBg text-status-success"
                        : "bg-status-warningBg text-status-warning"
                    }`}
                  >
                    {m.statut}
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
