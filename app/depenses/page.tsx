"use client";

import { useState } from "react";
import { Plus, X, Search, MoreHorizontal, Check, Trash2 } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import { depensesList } from "@/lib/mock-data";
import { mad, statusTone } from "@/lib/format";

type Depense = {
  id: string;
  categorie: string;
  fournisseur: string;
  montant: number;
  statut: "Payée" | "En attente";
  date: string;
};

export default function DepensesPage() {
  const [list, setList] = useState<Depense[]>(depensesList as Depense[]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categorie, setCategorie] = useState("Fournitures");
  const [fournisseur, setFournisseur] = useState("");
  const [montant, setMontant] = useState("");
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("Tous");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const total = list.reduce((s, d) => s + d.montant, 0);
  const totalPayees = list.filter((d) => d.statut === "Payée").reduce((s, d) => s + d.montant, 0);
  const totalEnAttente = list.filter((d) => d.statut === "En attente").reduce((s, d) => s + d.montant, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fournisseur || !montant) return;

    const newDepense: Depense = {
      id: `DEP-${Math.floor(100 + Math.random() * 900)}`,
      categorie,
      fournisseur,
      montant: parseFloat(montant) || 0,
      statut: "Payée" as const,
      date: new Date().toISOString().split("T")[0],
    };

    setList([newDepense, ...list]);
    setIsModalOpen(false);
    setFournisseur("");
    setMontant("");
  };

  const filtered = list.filter((d) => {
    const term = search.toLowerCase();
    const matchesSearch =
      d.id.toLowerCase().includes(term) ||
      d.categorie.toLowerCase().includes(term) ||
      d.fournisseur.toLowerCase().includes(term);
    const matchesStatut = statutFilter === "Tous" || d.statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Dépenses</h1>
          <p className="text-[13px] text-slate-400">Suivez et contrôlez les charges et achats de votre entreprise</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus size={16} /> Nouvelle dépense
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bento-card">
          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Total Dépenses</p>
          <p className="figure mt-2 text-2xl font-extrabold text-white">{mad(total)}</p>
        </div>
        <div className="bento-card">
          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Dépenses Réglées</p>
          <p className="figure mt-2 text-2xl font-extrabold text-emerald-400">{mad(totalPayees)}</p>
        </div>
        <div className="bento-card">
          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">En attente de paiement</p>
          <p className="figure mt-2 text-2xl font-extrabold text-amber-400">{mad(totalEnAttente)}</p>
        </div>
      </div>

      <div className="bento-card !p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex gap-1.5">
            {["Tous", "Payée", "En attente"].map((st) => (
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
              placeholder="Rechercher dépense, fournisseur..."
              className="w-64 rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3.5 text-[13px] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Référence</th>
                <th className="py-3 px-3">Catégorie</th>
                <th className="py-3 px-3">Fournisseur</th>
                <th className="py-3 px-3">Montant</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Aucune dépense trouvée.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="group hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-indigo-400">{d.id}</td>
                    <td className="py-3.5 px-3 text-slate-200 font-medium">{d.categorie}</td>
                    <td className="py-3.5 px-3 text-slate-300 font-semibold">{d.fournisseur}</td>
                    <td className="figure py-3.5 px-3 font-mono font-bold text-white">{mad(d.montant)}</td>
                    <td className="py-3.5 px-3">
                      <StatusChip tone={statusTone(d.statut)}>{d.statut}</StatusChip>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 text-[12.5px]">{d.date}</td>
                    <td className="py-3.5 px-3 text-right relative">
                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === d.id ? null : d.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {actionMenuOpen === d.id && (
                        <div className="absolute right-2 top-10 z-20 w-44 rounded-xl bg-slate-900 shadow-2xl border border-slate-800 p-1.5 text-left animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => {
                              setList((prev) =>
                                prev.map((item) =>
                                  item.id === d.id
                                    ? { ...item, statut: item.statut === "Payée" ? "En attente" : "Payée" }
                                    : item
                                )
                              );
                              setActionMenuOpen(null);
                            }}
                            className="block w-full text-left rounded-lg px-3 py-2 text-[12.5px] text-slate-200 hover:bg-slate-800 font-medium"
                          >
                            Marquer comme {d.statut === "Payée" ? "Non payée" : "Payée"}
                          </button>
                          <button
                            onClick={() => {
                              setList((prev) => prev.filter((item) => item.id !== d.id));
                              setActionMenuOpen(null);
                            }}
                            className="block w-full text-left rounded-lg px-3 py-2 text-[12.5px] text-red-400 hover:bg-red-500/10 font-medium"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-800">
            <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white">Nouvelle dépense</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-300">Catégorie</label>
                <select
                  value={categorie}
                  onChange={(e) => setCategorie(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-[13px] text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Fournitures">Fournitures de bureau</option>
                  <option value="Logiciels">Logiciels & SaaS</option>
                  <option value="Transport">Transport & Déplacement</option>
                  <option value="Services">Services externes</option>
                  <option value="Loyer">Loyer & Charges</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-300">Fournisseur / Bénéficiaire *</label>
                <input
                  required
                  value={fournisseur}
                  onChange={(e) => setFournisseur(e.target.value)}
                  placeholder="Nom du fournisseur ou prestataire"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-semibold text-slate-300">Montant (MAD) *</label>
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
                  Enregistrer la dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
