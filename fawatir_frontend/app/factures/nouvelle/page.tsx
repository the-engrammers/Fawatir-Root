"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { mad } from "@/lib/format";
import { fetchAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

type Ligne = { id: number; article: string; description: string; qte: number; prix: number; remise: number };

let nextId = 2;

export default function NouvelleFacturePage() {
  const router = useRouter();
  const companyId = useAuthStore((s) => s.user?.company);

  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState("");
  const [dateEmission, setDateEmission] = useState(new Date().toISOString().slice(0, 10));
  const [dateEcheance, setDateEcheance] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [echeance, setEcheance] = useState<"15" | "30" | "60" | "perso">("30");
  const [afficherTva, setAfficherTva] = useState(true);
  const [afficherLettres, setAfficherLettres] = useState(true);
  const [taxePct, setTaxePct] = useState(20);
  const [remisePct, setRemisePct] = useState(0);
  const [lignes, setLignes] = useState<Ligne[]>([
    { id: 1, article: "", description: "", qte: 1, prix: 0, remise: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAPI("api/clients/")
      .then((res) => res.json())
      .then((data) => setClients(Array.isArray(data) ? data : data.results || []))
      .catch(() => setError("Impossible de charger les clients"));
  }, []);

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

  function handleEcheance(v: "15" | "30" | "60" | "perso") {
    setEcheance(v);
    if (v !== "perso") {
      const days = Number(v);
      setDateEcheance(new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    }
  }

  async function handleSubmit(statut: "Brouillon" | "Envoyée") {
    if (!clientId) {
      setError("Veuillez sélectionner un client");
      return;
    }
    if (lignes.some((l) => !l.article)) {
      setError("Chaque ligne doit avoir un article");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const invoiceNumber = `FAC-${Date.now()}`;

      const invRes = await fetchAPI("api/invoices/", {
        method: "POST",
        body: JSON.stringify({
          company: companyId,
          client: clientId,
          invoice_number: invoiceNumber,
          issue_date: dateEmission,
          due_date: dateEcheance,
          status: statut,
          subtotal: sousTotal.toFixed(2),
          tax_amount: taxe.toFixed(2),
          discount_amount: remiseGlobale.toFixed(2),
          total_amount: total.toFixed(2),
          balance_due: total.toFixed(2),
        }),
      });

      if (!invRes.ok) {
        const errData = await invRes.json().catch(() => ({}));
        setError("Erreur facture: " + JSON.stringify(errData));
        setSubmitting(false);
        return;
      }

      const invoice = await invRes.json();

      for (const l of lignes) {
        const prodRes = await fetchAPI("api/products/", {
          method: "POST",
          body: JSON.stringify({
            company: companyId,
            name: l.article,
            selling_price: l.prix.toFixed(2),
          }),
        });

        if (!prodRes.ok) continue;
        const product = await prodRes.json();

        const lineTotal = l.qte * l.prix * (1 - l.remise / 100);

        await fetchAPI("api/invoice-items/", {
          method: "POST",
          body: JSON.stringify({
            invoice: invoice.id,
            product: product.id,
            description: l.description,
            quantity: l.qte,
            unit_price: l.prix.toFixed(2),
            discount: l.remise.toFixed(2),
            tax_rate: taxePct.toFixed(2),
            tax_amount: (lineTotal * (taxePct / 100)).toFixed(2),
            line_total: lineTotal.toFixed(2),
          }),
        });
      }

      router.push("/factures");
    } catch (err) {
      setError("Erreur de connexion au serveur");
      setSubmitting(false);
    }
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

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-[13px] text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
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
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.contact_name || c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[12.5px] text-ink-600">Date d'émission</label>
                  <input
                    type="date"
                    value={dateEmission}
                    onChange={(e) => setDateEmission(e.target.value)}
                    className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] text-ink-600">Date d'échéance</label>
                  <input
                    type="date"
                    value={dateEcheance}
                    onChange={(e) => setDateEcheance(e.target.value)}
                    className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                  />
                  <div className="mt-1.5 flex gap-1">
                    {(["15", "30", "60", "perso"] as const).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleEcheance(v)}
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
                  <span />
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

        <div className="h-fit space-y-4 lg:sticky lg:top-6">
          <div className="ledger-card space-y-4">
            <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">Résumé</p>

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

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("Brouillon")}
              className="w-full rounded-md border border-ink-200 py-2.5 text-[13px] font-medium text-ink-700 hover:border-brass/50 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="mx-auto animate-spin" size={16} /> : "Enregistrer comme brouillon"}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("Envoyée")}
              className="w-full rounded-md bg-ink-900 py-2.5 text-[13px] font-medium text-white hover:bg-ink-800 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="mx-auto animate-spin" size={16} /> : "Créer et envoyer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}