"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Plus, Trash2, Loader2, Sparkles, Check } from "lucide-react";
import { mad } from "@/lib/format";

type Ligne = { id: number; article: string; qte: number; prix: number };
let nextId = 2;

function DevisFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const docId = searchParams.get("doc_id");

  const [clientId, setClientId] = useState("");
  const [taxePct, setTaxePct] = useState(20);
  const [clients, setClients] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(data => setClients(Array.isArray(data) ? data : (data.results || [])));
    fetch('/api/products').then(r => r.json()).then(data => setProduits(Array.isArray(data) ? data : (data.results || [])));
  }, []);

  const [lignes, setLignes] = useState<Ligne[]>([{ id: 1, article: "", qte: 1, prix: 0 }]);
  const [isLoadingOcr, setIsLoadingOcr] = useState(false);
  const [ocrMessage, setOcrMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!docId) return;
    const fetchDoc = async () => {
      setIsLoadingOcr(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${apiUrl}/api/ai/documents/${docId}/`);
        if (!res.ok) throw new Error("Erreur lors de la récupération du document");
        const doc = await res.json();
        
        if (doc.extracted_data && doc.extracted_data.lignes) {
          const newLignes = doc.extracted_data.lignes.map((l: any, idx: number) => {
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
        console.error(err);
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

  const handleSave = async (status: string) => {
    setIsSubmitting(true);
    try {
      const selectedClient = clients.find(c => c.id === clientId);
      const devisData = {
        numero: `DEV-00${Math.floor(Math.random() * 1000)}`,
        client: clientId,
        client_name: selectedClient ? (selectedClient.company_name || selectedClient.nom) : "Client Inconnu",
        statut: status,
        montant: total,
        date: new Date().toISOString(),
        validiteJusquau: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lignes,
      };
      
      // Fetch in background to not block UI
      fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devisData)
      }).then(() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "quotations" } }));
        }
      });
      
      setSaveSuccess(true);
      router.push("/devis");
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

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
                    className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                  >
                    <option value="">-- Choisir un client existant --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name || c.nom}
                      </option>
                    ))}
                  </select>

              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] text-ink-600">Valide jusqu'au</label>
                <input
                  type="date"
                  defaultValue="2026-05-12"
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
              <div key={l.id} className="rounded-md border border-ink-200 p-3 bg-paper">
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
                
                {/* Product picker */}
                <div className="mb-2">
                  <label className="mb-1 block text-[11px] text-ink-500 font-medium">Sélectionner un produit du catalogue</label>
                  <select
                    onChange={(e) => {
                      const selectedProd = produits.find((p: any) => p.id === e.target.value);
                      if (selectedProd) {
                        updateLigne(l.id, {
                          article: selectedProd.name || selectedProd.nom,
                          prix: selectedProd.selling_price || selectedProd.prix
                        });
                      }
                    }}
                    className="w-full rounded-md border border-ink-200 bg-white px-2 py-1.5 text-[12px] mb-1.5 focus:border-brass/60 focus:outline-none"
                  >
                    <option value="">-- Choisir dans le catalogue --</option>
                    {produits.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.nom} ({mad(p.selling_price || p.prix)})
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  value={l.article}
                  onChange={(e) => updateLigne(l.id, { article: e.target.value })}
                  placeholder="Description / Désignation de l'article"
                  className="mb-2 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[11px] text-ink-400">Qté</label>
                    <input
                      type="number"
                      value={l.qte}
                      onChange={(e) => updateLigne(l.id, { qte: Number(e.target.value) })}
                      className="w-full rounded-md border border-ink-200 bg-white px-2 py-1.5 text-[13px] focus:border-brass/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-ink-400">Prix unitaire (MAD)</label>
                    <input
                      type="number"
                      value={l.prix}
                      onChange={(e) => updateLigne(l.id, { prix: Number(e.target.value) })}
                      className="w-full rounded-md border border-ink-200 bg-white px-2 py-1.5 text-[13px] focus:border-brass/60 focus:outline-none"
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
              disabled={isSubmitting}
              onClick={() => handleSave("Brouillon")}
              className="w-full rounded-md border border-ink-200 py-2.5 text-[13px] font-medium text-ink-700 hover:border-brass/50 flex items-center justify-center gap-2"
            >
              {saveSuccess ? <Check size={16} className="text-green-600" /> : null}
              {saveSuccess ? "Brouillon enregistré !" : "Enregistrer comme brouillon"}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave("Envoyée")}
              className="w-full rounded-md bg-ink-900 py-2.5 text-[13px] font-medium text-white hover:bg-ink-800 flex items-center justify-center gap-2"
            >
              {saveSuccess ? <Check size={16} /> : null}
              {saveSuccess ? "Devis créé et envoyé !" : "Créer et envoyer"}
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
