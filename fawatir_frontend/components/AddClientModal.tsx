"use client";

import { useState } from "react";
import { X } from "lucide-react";

const fieldsByCountry: Record<string, { label: string; placeholder: string }[]> = {
  Maroc: [
    { label: "Identifiant Fiscal (IF)", placeholder: "IF XXXXXXX" },
    { label: "ICE", placeholder: "000XXXXXXXXXXXX" },
    { label: "Registre de Commerce (RC)", placeholder: "RC XXXXX" },
  ],
  France: [
    { label: "SIREN", placeholder: "XXX XXX XXX" },
    { label: "SIRET", placeholder: "XXX XXX XXX XXXXX" },
    { label: "Numéro RCS", placeholder: "RCS Ville XXXXXXXXX" },
    { label: "N° TVA intracommunautaire", placeholder: "FR XX XXX XXX XXX" },
  ],
};

export default function AddClientModal({ onClose }: { onClose: () => void }) {
  const [pays, setPays] = useState("");
  const fiscalFields = fieldsByCountry[pays] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
      <div className="w-full max-w-md rounded-card bg-paper-card p-5 shadow-panel">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-ink-900">Ajouter un client</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-800">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Nom</label>
            <input
              placeholder="Nom du client"
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Entreprise</label>
            <input
              placeholder="Nom de l'entreprise"
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[12.5px] text-ink-600">E-mail</label>
              <input
                type="email"
                placeholder="Adresse e-mail"
                className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12.5px] text-ink-600">Téléphone</label>
              <input
                placeholder="Numéro de téléphone"
                className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Adresse</label>
            <input
              placeholder="Adresse du client"
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Pays</label>
            <select
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            >
              <option value="">—</option>
              <option value="Maroc">Maroc</option>
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Allemagne">Allemagne</option>
              <option value="Espagne">Espagne</option>
              <option value="Autre">Autre pays</option>
            </select>
          </div>

          {/* Fiscal fields adapt intelligently to the selected country */}
          {fiscalFields.length > 0 && (
            <div className="grid grid-cols-2 gap-3 rounded-md border border-brass/20 bg-brass/5 p-3">
              {fiscalFields.map((f) => (
                <div key={f.label} className={fiscalFields.length % 2 !== 0 && f === fiscalFields[fiscalFields.length - 1] ? "col-span-2" : ""}>
                  <label className="mb-1.5 block text-[12px] text-ink-600">{f.label}</label>
                  <input
                    placeholder={f.placeholder}
                    className="w-full rounded-md border border-ink-200 bg-paper-card px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50"
          >
            Annuler
          </button>
          <button className="rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800">
            Ajouter un client
          </button>
        </div>
      </div>
    </div>
  );
}
