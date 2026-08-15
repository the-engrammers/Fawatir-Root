"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { mad } from "@/lib/format";

const DEDUCTION_PAR_PERSONNE = 360; // MAD/an, per Moroccan IR rules referenced in the cartography

export default function NouvelEmployePage() {
  const [personnesACharge, setPersonnesACharge] = useState(0);

  const economieAnnuelle = personnesACharge * DEDUCTION_PAR_PERSONNE;
  const economieMensuelle = economieAnnuelle / 12;

  return (
    <div className="mx-auto max-w-[820px] space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/employes"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:border-brass/50 hover:text-ink-800"
        >
          <ChevronLeft size={16} />
        </Link>
        <h1 className="font-display text-[22px] font-semibold text-ink-900">Nouvel employé</h1>
      </div>

      <div className="ledger-card space-y-4">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
          CIN &amp; Numéro CNSS
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Prénom *" placeholder="Prénom" />
          <Field label="Nom *" placeholder="Nom" />
          <Field label="CIN *" placeholder="AB123456" />
          <Field label="Numéro CNSS" placeholder="123456789" />
        </div>
      </div>

      <div className="ledger-card space-y-4">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
          Poste &amp; Département
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Poste" placeholder="Développeur Full-Stack" />
          <Field label="Département" placeholder="Ingénierie" />
          <Field label="Date d'embauche *" type="date" defaultValue="2026-04-12" />
          <div>
            <label className="mb-1.5 block text-[12.5px] text-ink-600">Statut</label>
            <select className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none">
              <option>Actif</option>
              <option>Inactif</option>
            </select>
          </div>
        </div>
      </div>

      <div className="ledger-card space-y-4">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
          Salaire de base (MAD/mois)
        </p>
        <Field label="Salaire de base (MAD/mois) *" placeholder="0.00" suffix="MAD / mois" />

        <div>
          <label className="mb-2 block text-[12.5px] text-ink-600">Personnes à charge</label>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPersonnesACharge(i + 1 === personnesACharge ? i : i + 1)}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium ${
                  i < personnesACharge ? "bg-brass text-white" : "bg-ink-200/60 text-ink-500"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <span className="ml-1 text-[12px] text-ink-400">{personnesACharge} / 6</span>
          </div>
          {personnesACharge > 0 && (
            <div className="mt-2 rounded-md bg-status-successBg px-3 py-2 text-[12.5px] text-status-success">
              ~{mad(economieAnnuelle)}/an · ~{mad(Math.round(economieMensuelle))}/mois
              <span className="ml-1 text-status-success/70">économie IR</span>
            </div>
          )}
        </div>
      </div>

      <div className="ledger-card space-y-4">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
          E-mail &amp; Téléphone
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="E-mail" type="email" placeholder="employe@entreprise.ma" />
          <Field label="Téléphone" placeholder="+212 6XX XXX XXX" />
        </div>
        <Field label="Adresse" placeholder="" />
      </div>

      <div className="ledger-card space-y-2">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">Notes</p>
        <textarea
          rows={3}
          className="w-full resize-none rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Link
          href="/employes"
          className="rounded-md border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50"
        >
          Annuler
        </Link>
        <button className="rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800">
          Ajouter l'employé
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  defaultValue,
  suffix,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] text-ink-600">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
        />
        {suffix && <span className="shrink-0 text-[12px] text-ink-400">{suffix}</span>}
      </div>
    </div>
  );
}
