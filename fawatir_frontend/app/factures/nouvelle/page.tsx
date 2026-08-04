"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { clientsRecents, clientsList } from "@/lib/mock-data";
import { mad } from "@/lib/format";

type Ligne = { id: number; article: string; description: string; qte: number; prix: number; remise: number };

let nextId = 2;

export default function NouvelleFacturePage() {
  const [clientId, setClientId] = useState("");
  const [recurrente, setRecurrente] = useState(false);
  const [echeance, setEcheance] = useState<"15" | "30" | "60" | "perso">("30");
  const [afficherTva, setAfficherTva] = useState(true);
  const [afficherLettres, setAfficherLettres] = useState(true);
  const [taxePct, setTaxePct] = useState(20);
  const [remisePct, setRemisePct] = useState(0);
  const [lignes, setLignes] = useState<Ligne[]>([
    { id: 1, article: "", description: "", qte: 1, prix: 0, remise: 0 },
  ]);

  const sousTotal = useMemo(
    () => lignes.reduce((sum, l) => sum + l.qte * l.prix * (1 - l.remise / 100), 0),
    [lignes]
  );
  const remiseGlobale = sousTotal * (remisePct / 100);
  const taxe = (sousTotal - remiseGlobale) * (taxePct / 100);
  const total = sousTotal - remiseGlobale + taxe;

  function updateLigne(id: number, patch: Partial<Ligne>) {
    setLignes((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLigne() {
    nextId += 1;
    setLignes((prev) => [
      ...prev,
      { id: nextId, article: "", description: "", qte: 1, prix: 0, remise: 0 },
    ]);
  }

  function removeLigne(id: number) {
    setLignes((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/factures"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:border-brass/50 hover:text-ink-800"
        >
          <ChevronLeft size={16} />
        </Link>
        <h1 className="font-display text-[22px] font-semibold text-ink-900">Créer une facture</h1>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        {/* Left column: details + lines */}
        <div className="space-y-5">
          <div className="ledger-card space-y-4">
            <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
              Détails de la facture
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12.5px] text-ink-600">Client</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                >
                  <option value="">Sélectionner un client...</option>
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {clientsRecents.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setClientId(c.id)}
                      className={`rounded-full border px-2.5 py-1 text-[11.5px] ${
                        clientId === c.id
                          ? "border-brass bg-brass/10 text-brass"
                          : "border-ink-200 text-ink-600 hover:border-brass/50"
                      }`}
                    >
                      {c.nom}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="rounded-full border border-dashed border-ink-200 px-2.5 py-1 text-[11.5px] text-ink-500 hover:border-brass/50"
                  >
                    + Ajouter un client
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[12.5px] text-ink-600">Date d'émission</label>
                  <input
                    type="date"
                    defaultValue="2026-04-12"
                    className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] text-ink-600">Date d'échéance</label>
                  <input
                    type="date"
                    defaultValue="2026-05-12"
                    className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                  />
                  <div className="mt-1.5 flex gap-1">
                    {(["15", "30", "60", "perso"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setEcheance(v)}
                        className={`flex-1 rounded-md border px-1.5 py-1 text-[11px] ${
                          echeance === v
                            ? "border-brass bg-brass/10 text-brass"
                            : "border-ink-200 text-ink-500 hover:border-brass/50"
                        }`}
                      >
                        {v === "perso" ? "Perso." : `Net ${v}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <label className="flex items-center justify-between rounded-md border border-ink-200 px-3 py-2.5">
              <span className="text-[13px] text-ink-700">
                Factures récurrentes
                <span className="block text-[11.5px] text-ink-400">
                  Automatisez votre facturation
                </span>
              </span>
              <input
                type="checkbox"
                checked={recurrente}
                onChange={(e) => setRecurrente(e.target.checked)}
                className="h-4 w-8 accent-brass"
              />
            </label>
          </div>

          <div className="ledger-card space-y-3">
            <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
              Lignes de facture
            </p>

            {lignes.map((l, idx) => (
              <div key={l.id} className="rounded-md border border-ink-200 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-medium text-ink-400">Ligne {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeLigne(l.id)}
                    className="text-ink-400 hover:text-status-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  value={l.article}
                  onChange={(e) => updateLigne(l.id, { article: e.target.value })}
                  placeholder="Article"
                  className="mb-2 w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                />
                <textarea
                  value={l.description}
                  onChange={(e) => updateLigne(l.id, { description: e.target.value })}
                  placeholder="Description"
                  rows={2}
                  className="mb-2 w-full resize-none rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] text-ink-400">Qté</label>
                    <input
                      type="number"
                      value={l.qte}
                      onChange={(e) => updateLigne(l.id, { qte: Number(e.target.value) })}
                      className="w-full rounded-md border border-ink-200 bg-paper px-2 py-1.5 text-[13px] focus:border-brass/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-ink-400">Prix</label>
                    <input
                      type="number"
                      value={l.prix}
                      onChange={(e) => updateLigne(l.id, { prix: Number(e.target.value) })}
                      className="w-full rounded-md border border-ink-200 bg-paper px-2 py-1.5 text-[13px] focus:border-brass/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-ink-400">Remise %</label>
                    <input
                      type="number"
                      value={l.remise}
                      onChange={(e) => updateLigne(l.id, { remise: Number(e.target.value) })}
                      className="w-full rounded-md border border-ink-200 bg-paper px-2 py-1.5 text-[13px] focus:border-brass/60 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[11.5px] text-ink-500">
                    <input type="checkbox" className="accent-brass" /> Exonéré de taxe
                  </label>
                  <span className="figure text-[13px] font-medium text-ink-900">
                    {mad(l.qte * l.prix * (1 - l.remise / 100))}
                  </span>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addLigne}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-ink-200 py-2 text-[12.5px] text-ink-500 hover:border-brass/50 hover:text-brass"
            >
              <Plus size={14} /> Ajouter une ligne
            </button>
          </div>
        </div>

        {/* Right column: résumé */}
        <div className="h-fit space-y-4 lg:sticky lg:top-6">
          <div className="ledger-card space-y-4">
            <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">Résumé</p>

            <div>
              <label className="mb-1.5 block text-[12.5px] text-ink-600">Devise</label>
              <select className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none">
                <option>MAD - Dirham Marocain</option>
                <option>EUR - Euro</option>
                <option>USD - Dollar</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[12.5px] text-ink-600">Taxe %</label>
                <input
                  type="number"
                  value={taxePct}
                  onChange={(e) => setTaxePct(Number(e.target.value))}
                  className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] text-ink-600">Remise %</label>
                <input
                  type="number"
                  value={remisePct}
                  onChange={(e) => setRemisePct(Number(e.target.value))}
                  className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 border-t border-ink-200/60 pt-3 text-[13px]">
              <div className="flex justify-between text-ink-500">
                <span>Sous-total</span>
                <span className="figure">{mad(sousTotal)}</span>
              </div>
              <div className="flex justify-between text-ink-500">
                <span>Remise ({remisePct}%)</span>
                <span className="figure">-{mad(remiseGlobale)}</span>
              </div>
              <div className="flex justify-between text-ink-500">
                <span>Taxe ({taxePct}%)</span>
                <span className="figure">{mad(taxe)}</span>
              </div>
              <div className="flex justify-between border-t border-ink-200/60 pt-2 text-[15px] font-semibold text-ink-900">
                <span>Total</span>
                <span className="figure">{mad(total)}</span>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-ink-200/60 pt-3">
              <label className="flex items-center justify-between text-[13px] text-ink-700">
                Afficher TVA
                <input
                  type="checkbox"
                  checked={afficherTva}
                  onChange={(e) => setAfficherTva(e.target.checked)}
                  className="accent-brass"
                />
              </label>
              <label className="flex items-center justify-between text-[13px] text-ink-700">
                Afficher le montant en lettres
                <input
                  type="checkbox"
                  checked={afficherLettres}
                  onChange={(e) => setAfficherLettres(e.target.checked)}
                  className="accent-brass"
                />
              </label>
            </div>

            <button
              type="button"
              className="w-full rounded-md border border-ink-200 py-2.5 text-[13px] font-medium text-ink-700 hover:border-brass/50"
            >
              Enregistrer comme brouillon
            </button>
            <button
              type="button"
              className="w-full rounded-md bg-ink-900 py-2.5 text-[13px] font-medium text-white hover:bg-ink-800"
            >
              Créer et envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
