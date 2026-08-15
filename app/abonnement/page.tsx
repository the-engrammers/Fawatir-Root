import { Check } from "lucide-react";

export default function AbonnementPage() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-5">
      <div>
        <h1 className="font-display text-[22px] font-semibold text-ink-900">Abonnement</h1>
        <p className="text-[13px] text-ink-400">Gérez votre plan et votre facturation</p>
      </div>

      <div className="ledger-card flex items-center justify-between">
        <div>
          <p className="text-[11.5px] uppercase tracking-wide text-ink-400">Plan actuel</p>
          <p className="mt-1 text-[18px] font-semibold text-ink-900">Pro</p>
          <p className="text-[12.5px] text-ink-400">Renouvellement le 12 mai 2026</p>
        </div>
        <button className="rounded-md border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50">
          Changer de plan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="ledger-card">
          <p className="text-[12px] text-ink-400">Factures ce mois-ci</p>
          <p className="figure mt-1 text-[20px] font-medium text-ink-900">46 / Illimité</p>
        </div>
        <div className="ledger-card">
          <p className="text-[12px] text-ink-400">Membres de l'équipe</p>
          <p className="figure mt-1 text-[20px] font-medium text-ink-900">3 / 10</p>
        </div>
        <div className="ledger-card">
          <p className="text-[12px] text-ink-400">Prochain paiement</p>
          <p className="figure mt-1 text-[20px] font-medium text-ink-900">299 MAD</p>
        </div>
      </div>

      <div className="ledger-card">
        <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-ink-400">
          Ce qui est inclus dans le plan Pro
        </p>
        <ul className="grid grid-cols-1 gap-2 text-[13px] text-ink-700 sm:grid-cols-2">
          {[
            "Factures et devis illimités",
            "Assistant IA & bot WhatsApp",
            "Point de vente",
            "Bulletins de paie",
            "Rapprochement bancaire",
            "Jusqu'à 10 membres d'équipe",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check size={14} className="text-status-success" /> {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="ledger-card">
        <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-ink-400">
          Historique de facturation
        </p>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
              <th className="pb-2 font-medium">Date</th>
              <th className="pb-2 font-medium">Montant</th>
              <th className="pb-2 font-medium">Statut</th>
              <th className="pb-2 font-medium text-right">Reçu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/60">
            {["12 Avr 2026", "12 Mar 2026", "12 Fev 2026"].map((date) => (
              <tr key={date}>
                <td className="py-2.5 text-ink-700">{date}</td>
                <td className="figure py-2.5 text-ink-900">299,00 MAD</td>
                <td className="py-2.5">
                  <span className="rounded-full bg-status-successBg px-2 py-0.5 text-[11px] font-medium text-status-success">
                    Payée
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <button className="text-[12.5px] font-medium text-brass hover:underline">Télécharger</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
