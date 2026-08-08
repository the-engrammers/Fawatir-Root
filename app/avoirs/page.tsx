"use client";

import { useState, useEffect } from "react";
import { Plus, X, Search, MoreHorizontal, Printer, CheckCircle, Trash2, Loader2 } from "lucide-react";
import { mad } from "@/lib/format";

type AvoirItem = {
  id: string;
  client: string;
  facture: string;
  motif: string;
  montant: number;
  date: string;
  statut?: "Émis" | "Appliqué" | "Remboursé";
};

export default function AvoirsPage() {
  const [list, setList] = useState<AvoirItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [client, setClient] = useState("");
  const [facture, setFacture] = useState("");
  const [motif, setMotif] = useState("");
  const [montant, setMontant] = useState("");
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("Tous");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const fetchAvoirs = async () => {
    try {
      const res = await fetch(`/api/avoirs?t=${Date.now()}`);
      const data = await res.json();
      setList(data.map((a: any) => ({ ...a, statut: a.statut || "Émis" })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvoirs();
    const handleUpdate = () => fetchAvoirs();
    window.addEventListener("dataUpdated", handleUpdate);
    return () => window.removeEventListener("dataUpdated", handleUpdate);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !montant) return;

    const newAvoir = {
      client,
      facture: facture || `FAC-${Math.floor(100 + Math.random() * 900)}`,
      motif: motif || "Retour marchandise / Ajustement",
      montant: parseFloat(montant) || 0,
      date: new Date().toISOString().split("T")[0],
      statut: "Émis",
    };

    try {
      fetch('/api/avoirs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAvoir)
      }).then(() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "avoirs" } }));
        }
      });
      setIsModalOpen(false);
      setClient("");
      setFacture("");
      setMotif("");
      setMontant("");
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = list.filter((a) => {
    const term = search.toLowerCase();
    const matchesSearch =
      a.id.toLowerCase().includes(term) ||
      a.client.toLowerCase().includes(term) ||
      a.facture.toLowerCase().includes(term) ||
      a.motif.toLowerCase().includes(term);
    const matchesStatut = statutFilter === "Tous" || a.statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  const totalAvoirs = list.reduce((s, a) => s + a.montant, 0);
  const totalEmis = list.filter((a) => a.statut === "Émis").reduce((s, a) => s + a.montant, 0);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">Avoirs & Notes de Crédit</h1>
          <p className="text-[13px] text-ink-400">Gérez les remboursements et déductions sur factures</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
        >
          <Plus size={15} /> Nouvel avoir
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="ledger-card">
          <p className="text-[12px] text-ink-400">Total des avoirs émises</p>
          <p className="figure mt-1 text-[20px] font-medium text-ink-900">{mad(totalAvoirs)}</p>
        </div>
        <div className="ledger-card">
          <p className="text-[12px] text-ink-400">En attente d'application</p>
          <p className="figure mt-1 text-[20px] font-medium text-brass">{mad(totalEmis)}</p>
        </div>
        <div className="ledger-card">
          <p className="text-[12px] text-ink-400">Nombre d'avoirs</p>
          <p className="figure mt-1 text-[20px] font-medium text-ink-900">{list.length}</p>
        </div>
      </div>

      <div className="ledger-card !p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200/60 pb-3">
          <div className="flex gap-1.5">
            {["Tous", "Émis", "Appliqué", "Remboursé"].map((st) => (
              <button
                key={st}
                onClick={() => setStatutFilter(st)}
                className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                  statutFilter === st
                    ? "bg-ink-900 text-white"
                    : "bg-paper border border-ink-200 text-ink-600 hover:bg-ink-50"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher avoir, client..."
              className="w-64 rounded-md border border-ink-200 bg-paper py-1.5 pl-8 pr-3 text-[13px] placeholder:text-ink-400 focus:border-brass/60 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
                <th className="pb-2.5 font-medium">Avoir N°</th>
                <th className="pb-2.5 font-medium">Client</th>
                <th className="pb-2.5 font-medium">Facture liée</th>
                <th className="pb-2.5 font-medium">Motif</th>
                <th className="pb-2.5 font-medium">Montant</th>
                <th className="pb-2.5 font-medium">Date</th>
                <th className="pb-2.5 font-medium">Statut</th>
                <th className="pb-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-ink-400">
                    Aucun avoir trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="group">
                    <td className="py-3 font-medium text-brass">{a.id}</td>
                    <td className="py-3 font-medium text-ink-900">{a.client}</td>
                    <td className="py-3 text-ink-500 font-mono text-[12px]">{a.facture}</td>
                    <td className="py-3 text-ink-500">{a.motif}</td>
                    <td className="figure py-3 font-semibold text-status-danger">-{mad(a.montant)}</td>
                    <td className="py-3 text-ink-400">{a.date}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          a.statut === "Appliqué"
                            ? "bg-status-successBg text-status-success"
                            : a.statut === "Remboursé"
                            ? "bg-status-infoBg text-status-info"
                            : "bg-status-warningBg text-status-warning"
                        }`}
                      >
                        {a.statut || "Émis"}
                      </span>
                    </td>
                    <td className="py-3 text-right relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === a.id ? null : a.id)}
                        className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {actionMenuOpen === a.id && (
                        <div className="absolute right-2 top-9 z-20 w-44 rounded-md bg-paper-card shadow-panel border border-ink-200 py-1 text-left">
                          <button
                            onClick={() => {
                              window.print();
                              setActionMenuOpen(null);
                            }}
                            className="block w-full text-left px-3 py-1.5 text-[12px] text-ink-700 hover:bg-ink-50"
                          >
                            Imprimer l'avoir
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await fetch(`/api/avoirs/${a.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'Appliqué' }),
                                });
                              } catch (err) {
                                console.error('Failed to update avoir status:', err);
                              }
                              setList((prev) =>
                                prev.map((item) =>
                                  item.id === a.id ? { ...item, statut: "Appliqué" } : item
                                )
                              );
                              setActionMenuOpen(null);
                            }}
                            className="block w-full text-left px-3 py-1.5 text-[12px] text-brass font-medium hover:bg-ink-50"
                          >
                            Appliquer sur la facture
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await fetch(`/api/avoirs/${a.id}`, { method: 'DELETE' });
                              } catch (err) {
                                console.error('Failed to delete avoir:', err);
                              }
                              setList((prev) => prev.filter((item) => item.id !== a.id));
                              setActionMenuOpen(null);
                            }}
                            className="block w-full text-left px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg bg-paper-card p-5 shadow-panel border border-ink-200 space-y-4">
            <div className="flex items-center justify-between border-b border-ink-200/60 pb-3">
              <h2 className="text-[15px] font-semibold text-ink-900">Créer un nouvel avoir</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-ink-400 hover:text-ink-800">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="mb-1 block text-[12.5px] text-ink-600">Client *</label>
                <input
                  required
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Mouad El Khatib"
                  className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[12.5px] text-ink-600">Facture liée</label>
                <input
                  value={facture}
                  onChange={(e) => setFacture(e.target.value)}
                  placeholder="FAC-0045"
                  className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[12.5px] text-ink-600">Motif de l'avoir</label>
                <input
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Retour produit / Remise commerciale"
                  className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[12.5px] text-ink-600">Montant HT (MAD) *</label>
                <input
                  required
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="1500"
                  className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
                >
                  Créer l'avoir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
