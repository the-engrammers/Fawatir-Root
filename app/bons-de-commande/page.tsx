"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, X, Search, MoreHorizontal } from "lucide-react";
import { bonsCommandeList } from "@/lib/mock-data";
import { mad } from "@/lib/format";

const statutStyles: Record<string, string> = {
  Brouillon: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold",
  Envoyé: "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold",
  Partiel: "bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold",
  Reçu: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold",
};

export default function BonsCommandePage() {
  const [list, setList] = useState(bonsCommandeList);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fournisseur, setFournisseur] = useState("");
  const [montant, setMontant] = useState("");
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("Tous");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fournisseur || !montant) return;

    const newPO = {
      id: `BC-${Math.floor(1000 + Math.random() * 9000)}`,
      fournisseur,
      statut: "Brouillon" as const,
      dateEmission: new Date().toISOString().split("T")[0],
      livraisonPrevue: new Date().toISOString().split("T")[0],
      montant: parseFloat(montant) || 0,
      articles: [{ nom: "Article général", qte: 1, recu: 0, prixUnitaire: parseFloat(montant) || 0 }],
    };

    setList([newPO, ...list]);
    setIsModalOpen(false);
    setFournisseur("");
    setMontant("");
  };

  const filtered = list.filter((po) => {
    const term = search.toLowerCase();
    const matchesSearch =
      po.id.toLowerCase().includes(term) || po.fournisseur.toLowerCase().includes(term);
    const matchesStatut = statutFilter === "Tous" || po.statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Bons de commande
          </h1>
          <p className="text-[13px] text-slate-400">Gérez vos commandes d'achat auprès de vos fournisseurs</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus size={16} /> Nouveau bon de commande
        </button>
      </div>

      <div className="bento-card !p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex gap-1.5">
            {["Tous", "Brouillon", "Envoyé", "Partiel", "Reçu"].map((st) => (
              <button
                key={st}
                onClick={() => setStatutFilter(st)}
                className={`rounded-xl px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                  statutFilter === st
                    ? "bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400/30"
                    : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher BC, fournisseur..."
              className="w-64 rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3.5 text-[13px] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-[13px]">
              Aucun bon de commande trouvé.
            </div>
          ) : (
            filtered.map((po) => {
              const totalArticles = po.articles.reduce((s, a) => s + a.qte, 0);
              const totalRecu = po.articles.reduce((s, a) => s + a.recu, 0);
              const progress = totalArticles > 0 ? (totalRecu / totalArticles) * 100 : 0;
              return (
                <div
                  key={po.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 flex items-center justify-between hover:bg-slate-800/40 hover:border-slate-700 transition-all relative"
                >
                  <Link href={`/bons-de-commande/${po.id}`} className="flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-indigo-400">{po.id}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${statutStyles[po.statut] || statutStyles.Brouillon}`}>
                        {po.statut}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-slate-400 mt-1">
                      <span className="font-semibold text-slate-200">{po.fournisseur}</span> · Émis le {po.dateEmission}
                    </p>
                    {progress > 0 && progress < 100 && (
                      <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </Link>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="figure font-mono font-bold text-white text-[15px]">{mad(po.montant)}</p>
                      <p className="text-[11.5px] text-slate-400">{po.articles.length} article(s)</p>
                    </div>
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === po.id ? null : po.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {actionMenuOpen === po.id && (
                      <div className="absolute right-4 top-12 z-20 w-44 rounded-xl bg-slate-900 shadow-2xl border border-slate-800 p-1.5 text-left animate-in fade-in zoom-in-95">
                        <Link
                          href={`/bons-de-commande/${po.id}`}
                          className="block rounded-lg px-3 py-2 text-[12.5px] text-slate-200 hover:bg-slate-800 font-medium"
                        >
                          Voir le bon
                        </Link>
                        <button
                          onClick={() => {
                            setList((prev) =>
                              prev.map((item) =>
                                item.id === po.id ? { ...item, statut: "Reçu" } : item
                              )
                            );
                            setActionMenuOpen(null);
                          }}
                          className="block w-full text-left rounded-lg px-3 py-2 text-[12.5px] text-emerald-400 hover:bg-emerald-500/10 font-medium"
                        >
                          Marquer Reçu
                        </button>
                        <button
                          onClick={() => {
                            setList((prev) => prev.filter((item) => item.id !== po.id));
                            setActionMenuOpen(null);
                          }}
                          className="block w-full text-left rounded-lg px-3 py-2 text-[12.5px] text-red-400 hover:bg-red-500/10 font-medium"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-800">
            <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white">Nouveau bon de commande</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-300">Fournisseur *</label>
                <input
                  required
                  value={fournisseur}
                  onChange={(e) => setFournisseur(e.target.value)}
                  placeholder="Ex: Papeterie du Sud"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-300">Montant estimé (MAD) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-[13px] font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
                >
                  Créer le bon de commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
