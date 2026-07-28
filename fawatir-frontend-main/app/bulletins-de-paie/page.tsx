"use client";

import { useState } from "react";
import { Settings, ChevronDown, Download } from "lucide-react";
import { bulletinsList, employesList } from "@/lib/mock-data";
import { mad } from "@/lib/format";

const CNSS_PCT = 4.48;
const CNSS_PLAFOND = 6000;
const AMO_PCT = 2.26;
const TAUX_IR = 20; // simplified single-bracket display matching the cartography's example

function computeBulletin(salaireBase: number, personnesACharge: number) {
  const salaireBrut = salaireBase;
  const cnssBase = Math.min(salaireBrut, CNSS_PLAFOND);
  const cnss = cnssBase * (CNSS_PCT / 100);
  const amo = salaireBrut * (AMO_PCT / 100);
  const fraisPro = salaireBrut * 0.191;
  const baseImposableIR = salaireBrut - cnss - amo - fraisPro;
  const deductionPersonnes = personnesACharge * (360 / 12);
  const ir = Math.max(0, baseImposableIR * (TAUX_IR / 100) - deductionPersonnes);
  const totalRetenues = cnss + amo + ir;
  const netAPayer = salaireBrut - totalRetenues;
  const coutEmployeur = salaireBrut + cnss * 1.3; // illustrative employer-side charges
  return { salaireBrut, cnss, amo, fraisPro, baseImposableIR, deductionPersonnes, ir, totalRetenues, netAPayer, coutEmployeur };
}

export default function BulletinsPaiePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(bulletinsList[0]?.id ?? null);

  const rows = bulletinsList.map((b) => {
    const emp = employesList.find((e) => e.id === b.employeId)!;
    return { ...b, emp, calc: computeBulletin(emp.salaireBase, emp.personnesACharge) };
  });

  const selectedRow = rows.find((r) => r.id === selected);
  const totalBrut = rows.reduce((s, r) => s + r.calc.salaireBrut, 0);
  const totalNet = rows.reduce((s, r) => s + r.calc.netAPayer, 0);
  const totalCoutEmployeur = rows.reduce((s, r) => s + r.calc.coutEmployeur, 0);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">Bulletins de paie</h1>
          <p className="text-[13px] text-ink-400">
            Gérez les salaires de vos employés et générez des bulletins de paie
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border border-ink-200 px-3 py-2 text-[13px] text-ink-700">
            avril <ChevronDown size={13} className="text-ink-400" /> 2026
          </div>
          <button className="flex items-center gap-2 rounded-md border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50">
            <Settings size={15} /> Paramètres de paie
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
          >
            Générer le mois
          </button>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="ledger-card">
            <p className="text-[12px] text-ink-400">Salaire brut</p>
            <p className="figure mt-1 text-[20px] font-medium text-ink-900">{mad(totalBrut)}</p>
          </div>
          <div className="ledger-card">
            <p className="text-[12px] text-ink-400">Salaire net</p>
            <p className="figure mt-1 text-[20px] font-medium text-ink-900">{mad(totalNet)}</p>
          </div>
          <div className="ledger-card">
            <p className="text-[12px] text-ink-400">Coût total employeur</p>
            <p className="figure mt-1 text-[20px] font-medium text-ink-900">{mad(totalCoutEmployeur)}</p>
          </div>
        </div>
      )}

      <div className="ledger-card !p-4">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <p className="text-[13.5px] font-medium text-ink-700">Aucun bulletin de paie</p>
            <p className="text-[12px] text-ink-400">
              Créez des bulletins ou générez un mois complet pour tous les employés actifs
            </p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
                <th className="pb-2.5 font-medium">Employés</th>
                <th className="pb-2.5 font-medium">Période</th>
                <th className="pb-2.5 font-medium">Salaire brut</th>
                <th className="pb-2.5 font-medium">Total retenues</th>
                <th className="pb-2.5 font-medium">Net à payer</th>
                <th className="pb-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/60">
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r.id)}
                  className={`cursor-pointer ${selected === r.id ? "bg-brass/5" : ""}`}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-[11px] font-medium text-white">
                        {r.emp.prenom.charAt(0)}
                        {r.emp.nom.charAt(0)}
                      </span>
                      <div>
                        <p className="font-medium text-ink-900">
                          {r.emp.prenom} {r.emp.nom}
                        </p>
                        <p className="text-[11.5px] text-ink-400">{r.emp.departement}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-ink-500">{r.periode}</td>
                  <td className="figure py-3 text-ink-900">{mad(r.calc.salaireBrut)}</td>
                  <td className="figure py-3 text-status-danger">-{mad(r.calc.totalRetenues)}</td>
                  <td className="figure py-3 font-medium text-ink-900">{mad(r.calc.netAPayer)}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-status-infoBg px-2 py-0.5 text-[11px] font-medium text-status-info">
                      {r.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedRow && (
        <div className="ledger-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-medium text-ink-900">{selectedRow.periode}</p>
              <p className="text-[12.5px] text-ink-400">
                {selectedRow.emp.prenom} {selectedRow.emp.nom}
              </p>
            </div>
            <button className="flex items-center gap-1.5 rounded-md bg-ink-900 px-3 py-2 text-[12.5px] font-medium text-white hover:bg-ink-800">
              <Download size={14} /> Télécharger PDF
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3 text-[13px]">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                Taux appliqués à la date de création (loi marocaine 2025)
              </p>
              <Row label="CNSS (Salarié)" value={`${CNSS_PCT}%`} />
              <Row label="CNSS Ceiling" value={mad(CNSS_PLAFOND)} />
              <Row label="AMO (Salarié)" value={`${AMO_PCT}%`} />
              <Row label="Personnes à charge" value={String(selectedRow.emp.personnesACharge)} />
            </div>

            <div className="space-y-1.5 text-[13px]">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-400">
                Salaire brut
              </p>
              <Row label="Salaire de base (MAD/mois)" value={mad(selectedRow.calc.salaireBrut)} bold />
              <p className="mb-1 mt-3 text-[11px] font-medium uppercase tracking-wide text-ink-400">
                Cotisations salarié
              </p>
              <Row label="CNSS" value={`- ${mad(selectedRow.calc.cnss)}`} negative />
              <Row label="AMO" value={`- ${mad(selectedRow.calc.amo)}`} negative />
              <Row label="Frais professionnels" value={mad(selectedRow.calc.fraisPro)} />
              <Row label="Base imposable IR" value={mad(selectedRow.calc.baseImposableIR)} />
              <Row
                label="Déduction IR personnes à charge"
                value={`- ${mad(selectedRow.calc.deductionPersonnes)}`}
                negative
              />
              <Row label="Impôt sur le revenu (IR)" value={`- ${mad(selectedRow.calc.ir)}`} negative />
              <Row label="Total retenues" value={`- ${mad(selectedRow.calc.totalRetenues)}`} negative bold />
            </div>
          </div>

          <div className="ledger-card mt-4 !border-l-status-success/70">
            <p className="text-[12px] text-ink-400">Net à payer</p>
            <p className="figure text-[22px] font-semibold text-status-success">
              {mad(selectedRow.calc.netAPayer)}
            </p>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
          <div className="w-full max-w-sm rounded-card bg-paper-card p-5 shadow-panel">
            <h2 className="mb-1 text-[15px] font-semibold text-ink-900">Générer le mois</h2>
            <p className="mb-3 text-[12.5px] text-ink-400">
              Créer des bulletins brouillon pour tous les employés actifs du mois sélectionné.
            </p>
            <p className="mb-4 text-[13px] font-medium text-ink-800">avril 2026</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50"
              >
                Annuler
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  negative,
  bold,
}: {
  label: string;
  value: string;
  negative?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span
        className={`figure ${negative ? "text-status-danger" : "text-ink-900"} ${bold ? "font-semibold" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
