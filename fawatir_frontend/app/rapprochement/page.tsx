"use client";

import { UploadCloud, Info } from "lucide-react";

export default function RapprochementPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div>
        <h1 className="font-display text-[22px] font-semibold text-ink-900">
          Rapprochement bancaire
        </h1>
        <p className="text-[13px] text-ink-400">
          Importez votre relevé bancaire et rapprochez les transactions
        </p>
      </div>

      <label className="ledger-card flex cursor-pointer flex-col items-center justify-center gap-2 border-dashed !border-l-4 py-12 text-center hover:border-brass/50">
        <UploadCloud size={26} className="text-brass" />
        <p className="text-[13.5px] font-medium text-ink-800">
          Téléversez votre relevé bancaire au format CSV
        </p>
        <p className="text-[12px] text-ink-400">Supporté : CIH, Attijariwafa, BMCE, CSV générique</p>
        <input type="file" accept=".csv" className="hidden" />
      </label>

      <div className="ledger-card flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Info size={20} className="text-ink-400" />
        <p className="text-[13.5px] font-medium text-ink-700">Aucune transaction importée</p>
        <p className="text-[12px] text-ink-400">Importez un relevé CSV pour commencer</p>
      </div>
    </div>
  );
}
