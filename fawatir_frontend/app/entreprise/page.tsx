"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";

const fieldsByCountry: Record<string, { label: string; placeholder: string }[]> = {
  Maroc: [
    { label: "Identifiant Fiscal (IF)", placeholder: "IF87654321" },
    { label: "ICE", placeholder: "002345678000091" },
    { label: "Registre de Commerce (RC)", placeholder: "RC XXXXX" },
  ],
  France: [
    { label: "SIREN", placeholder: "XXX XXX XXX" },
    { label: "SIRET", placeholder: "XXX XXX XXX XXXXX" },
    { label: "Numéro RCS", placeholder: "RCS Ville XXXXXXXXX" },
    { label: "N° TVA intracommunautaire", placeholder: "FR XX XXX XXX XXX" },
  ],
};

export default function EntreprisePage() {
  const [pays, setPays] = useState("Maroc");
  const [afficherTva, setAfficherTva] = useState(true);
  const [montantLettres, setMontantLettres] = useState(true);
  const fiscalFields = fieldsByCountry[pays] ?? [];

  return (
    <div className="mx-auto max-w-[820px] space-y-5">
      <div>
        <h1 className="font-display text-[22px] font-semibold text-ink-900">
          Détails de l'entreprise
        </h1>
        <p className="text-[13px] text-ink-400">Informations de votre entreprise pour les factures</p>
      </div>

      <div className="ledger-card space-y-4">
        <div className="flex items-center gap-3">
          <label className="flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-ink-200 text-ink-400 hover:border-brass/50 hover:text-brass">
            <ImagePlus size={16} />
            <input type="file" accept="image/*" className="hidden" />
          </label>
          <div>
            <p className="text-[13px] font-medium text-ink-800">Logo de l'entreprise</p>
            <p className="text-[11.5px] text-ink-400">Affiché sur vos factures. JPG, PNG ou SVG. Max 5 Mo.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nom de l'entreprise" defaultValue="Fatourati" />
          <Field label="Adresse" defaultValue="45 Bd Mohammed V, Casablanca 20250, Maroc" />
          <Field label="Téléphone" defaultValue="+212 522 987 654" />
          <Field label="E-mail" defaultValue="contact@fatourati.app" type="email" />
          <Field label="Site web" defaultValue="https://fatourati.app" />
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Secteur d'activité</label>
            <select
              defaultValue="Autre"
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            >
              <option>Technologie & Services</option>
              <option>Commerce</option>
              <option>Construction</option>
              <option>Santé</option>
              <option>Autre</option>
            </select>
          </div>
        </div>
      </div>

      <div className="ledger-card space-y-4">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
          Informations fiscales et de facturation
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Pays</label>
            <select
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
            >
              <option>Maroc</option>
              <option>France</option>
              <option>Belgique</option>
              <option>Allemagne</option>
              <option>Espagne</option>
              <option>Autre pays</option>
            </select>
          </div>
          <Field label="TVA %" defaultValue="20" type="number" />
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Devise</label>
            <select className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none">
              <option>MAD - Dirham Marocain</option>
              <option>EUR - Euro</option>
              <option>USD - Dollar</option>
            </select>
          </div>
        </div>

        {fiscalFields.length > 0 && (
          <div className="grid grid-cols-1 gap-4 rounded-md border border-brass/20 bg-brass/5 p-3 sm:grid-cols-3">
            {fiscalFields.map((f) => (
              <div key={f.label}>
                <label className="mb-1.5 block text-[12px] text-ink-600">{f.label}</label>
                <input
                  placeholder={f.placeholder}
                  className="w-full rounded-md border border-ink-200 bg-paper-card px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center justify-between rounded-md border border-ink-200 px-3 py-2.5">
          <span className="text-[13px] text-ink-700">
            Afficher la TVA sur les factures
            <span className="block text-[11.5px] text-ink-400">
              Si désactivé, la TVA sera masquée sur toutes les factures et les PDF.
            </span>
          </span>
          <input
            type="checkbox"
            checked={afficherTva}
            onChange={(e) => setAfficherTva(e.target.checked)}
            className="h-4 w-8 accent-brass"
          />
        </label>
        <label className="flex items-center justify-between rounded-md border border-ink-200 px-3 py-2.5">
          <span className="text-[13px] text-ink-700">
            Montant en lettres
            <span className="block text-[11.5px] text-ink-400">
              Affiche le total en toutes lettres sous le montant TTC.
            </span>
          </span>
          <input
            type="checkbox"
            checked={montantLettres}
            onChange={(e) => setMontantLettres(e.target.checked)}
            className="h-4 w-8 accent-brass"
          />
        </label>
      </div>

      <div className="ledger-card space-y-4">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
          Coordonnées bancaires
        </p>
        <p className="text-[12px] text-ink-400">
          Ces informations apparaîtront sur vos factures pour permettre à vos clients d'effectuer des
          paiements.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="RIB" placeholder="007 780 0001234567890123 45" />
          <Field label="IBAN" placeholder="MAXX XXXX XXXX XXXX XXXX XXXX" />
          <Field label="Code SWIFT / BIC" placeholder="XXXXXXXX" />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="rounded-md bg-ink-900 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-ink-800">
          Enregistrer
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] text-ink-600">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
      />
    </div>
  );
}
