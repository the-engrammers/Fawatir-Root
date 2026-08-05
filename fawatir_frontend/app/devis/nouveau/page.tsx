"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { mad } from "@/lib/format";
import { fetchAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

type Ligne = { id: number; article: string; qte: number; prix: number };
let nextId = 2;

function DevisFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get("doc_id");
  const companyId = useAuthStore((s) => s.user?.company);

  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState("");
  const [validiteJusquau, setValiditeJusquau] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [taxePct, setTaxePct] = useState(20);
  const [lignes, setLignes] = useState<Ligne[]>([{ id: 1, article: "", qte: 1, prix: 0 }]);
  const [isLoadingOcr, setIsLoadingOcr] = useState(false);
  const [ocrMessage, setOcrMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAPI("api/clients/")
      .then((res) => res.json())
      .then((data) => setClients(Array.isArray(data) ? data : data.results || []))
      .catch(() => setError("Impossible de charger les clients"));
  }, []);

  useEffect(() => {
    if (!docId) return;
    const fetchDoc = async () => {
      setIsLoadingOcr(true);
      try {
        const res = await fetchAPI(`api/ai/documents/${docId}/`);
        if (!res.ok) throw new Error("Erreur lors de la récupération du document");
        const doc = await res.json();

        if (doc.extracted_data && doc.extracted_data.lignes) {
          const newLignes = doc.extracted_data.lignes.map((l: any) => {
            nextId++;
            return {
              id: nextId,
              article: l.description || "Article inconnu",
              qte: l.quantite || 1,
              prix: l.prix_unitaire || l.montant || 0,
            };
          });
          if (newLignes.length > 0) {
            setLignes(newLignes);
            setOcrMessage("Les lignes ont été remplies par l'IA.");
          }
        }
      } catch (err) {
        setOcrMessage("Impossible de lire les données du document.");
      } finally {
        setIsLoadingOcr(false);
      }
    };
    fetchDoc();
  }, [docId]);

  const sousTotal = useMemo(() => lignes.reduce((s, l) => s + l.qte * l.prix, 0), [lignes]);
  const taxe = sousTotal * (taxePct / 100);
  const total = sousTotal + taxe;

  function updateLigne(id: number, patch: Partial<Ligne>) {
    setLignes((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function addLigne() {
    nextId += 1;
    setLignes((prev) => [...prev, { id: nextId, article: "", qte: 1, prix: 0 }]);
  }
  function removeLigne(id: number) {
    setLignes((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
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
      const quotationNumber = `DEV-${Date.now()}`;

      const devRes = await fetchAPI("api/quotations/", {
        method: "POST",
        body: JSON.stringify({
          company: companyId,
          client: clientId,
          quotation_number: quotationNumber,
          status: statut,
          total_amount: total.toFixed(2),
        }),
      });

      if (!devRes.ok) {
        const errData = await devRes.json().catch(() => ({}));
        setError("Erreur devis: " + JSON.stringify(errData));
        setSubmitting(false);
        return;
      }

      const quotation = await devRes.json();

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

        const lineTotal = l.qte * l.prix;

        await fetchAPI("api/quotation-items/", {
          method: "POST",
          body: JSON.stringify({
            quotation: quotation.id,
            product: product.id,
            quantity: l.qte,
            unit_price: l.prix.toFixed(2),
            tax_rate: taxePct.toFixed(2),
            tax_amount: (lineTotal * (taxePct / 100)).toFixed(2),
            line_total: lineTotal.toFixed(2),
          }),
        });
      }

      router.push("/devis");
    } catch (err) {
      setError("Erreur de connexion au serveur");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/devis"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:border-brass/50 hover:text-ink-800"
        >
          <ChevronLeft size={16} />
        </Link>
        <h1 className="font-display text-[22px] font-semibold text-ink-900">Créer un devis</h1>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-[13px] text-red-600">
          {error}
        </div>
      )}

      {isLoadingOcr && (
        <div className="rounded-card bg-brass/10 border border-brass/30 p-4 flex items-center gap-3">
          <Loader2 className="animate-spin text-brass-dark" size={20} />
          <p className="text-[13.5px] font-medium text-brass-dark">Extraction des données du document en cours par l'IA...</p>
        </div>
      )}

      {ocrMessage && !isLoadingOcr && (
        <div className="rounded-card bg-green-50 border border-green-200 p-4 flex items-center gap-3">
          <Sparkles className="text-green-600" size={20} />
          <p className="text-[13.5px] font-medium text-green-800">{ocrMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="ledger-card space-y-4">
            <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
              Détails du devis
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
              <div>
                <label className="mb-1.5 block text-[12.5px] text-ink-600">Valide jusqu'au</label>
                <input
                  type="date"
                  value={validiteJusquau}
                  onChange={(e) => setValiditeJusquau(e.target.value)}
                  className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="ledger-card space-y-3">
            <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
              Lignes du devis
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
                <div className="grid grid-cols-2 gap-2">
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
            <div>
              <label className="mb-1.5 block text-[12.5px] text-ink-600">Taxe %</label>
              <input
                type="number"
                value={taxePct}
                onChange={(e) => setTaxePct(Number(e.target.value))}
                className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5 border-t border-ink-200/60 pt-3 text-[13px]">
              <div className="flex justify-between text-ink-500">
                <span>Sous-total</span>
                <span className="figure">{mad(sousTotal)}</span>
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

export default function NouveauDevisPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-500">Chargement...</div>}>
      <DevisFormContent />
    </Suspense>
  );
}