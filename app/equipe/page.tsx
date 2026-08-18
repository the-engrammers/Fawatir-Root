"use client";

import { useState, useEffect } from "react";
import { UserPlus, X, Shield, Search, MoreHorizontal, Check, HelpCircle, Loader2 } from "lucide-react";

const ROLE_PERMISSIONS: Record<string, string> = {
  Administrateur: "Accès complet: Création, validation, suppression et gestion des paramètres & utilisateurs.",
  Comptable: "Accès financier: Factures, dépenses, avoirs, rapprochement bancaire et export des rapports.",
  Commercial: "Accès vente: Création de devis, gestion des clients et suivi des commandes.",
  Lecteur: "Accès consultation seule: Visualisation des factures et rapports sans modification.",
};

export default function EquipePage() {
  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Comptable");
  const [search, setSearch] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const fetchEquipe = async () => {
    try {
      const res = await fetch(`/api/equipe?t=${Date.now()}`);
      const data = await res.json();
      setList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipe();
    const handleUpdate = () => fetchEquipe();
    window.addEventListener("dataUpdated", handleUpdate);
    return () => window.removeEventListener("dataUpdated", handleUpdate);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !email) return;

    const newMember = {
      nom,
      email,
      role,
      statut: "Invité" as const,
    };

    try {
      fetch('/api/equipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      }).then(() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "equipe" } }));
        }
      });
      setIsModalOpen(false);
      setNom("");
      setEmail("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    setList((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  const handleStatusToggle = (memberId: string) => {
    setList((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, statut: m.statut === "Actif" ? ("Suspendu" as any) : ("Actif" as any) }
          : m
      )
    );
  };

  const filtered = list.filter(
    (m) =>
      m.nom.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[1100px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">Équipe & Access</h1>
          <p className="text-[13px] text-ink-400">Gérez les membres de votre entreprise et attribuez les rôles</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
        >
          <UserPlus size={15} /> Inviter un membre
        </button>
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(ROLE_PERMISSIONS).map(([r, desc]) => (
          <div key={r} className="ledger-card p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-brass font-medium text-[13px]">
              <Shield size={14} />
              {r}
            </div>
            <p className="text-[11.5px] text-ink-500 leading-snug">{desc}</p>
          </div>
        ))}
      </div>

      <div className="ledger-card !p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un membre..."
              className="w-full rounded-md border border-ink-200 bg-paper py-1.5 pl-8 pr-3 text-[13px] placeholder:text-ink-400 focus:border-brass/60 focus:outline-none"
            />
          </div>
          <span className="text-[12.5px] text-ink-500 font-medium">
            {list.length} membre{list.length > 1 ? "s" : ""} au total
          </span>
        </div>

        <div className="overflow-x-auto pb-32 min-h-[300px]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
                <th className="pb-2.5 font-medium">Nom</th>
                <th className="pb-2.5 font-medium">E-mail</th>
                <th className="pb-2.5 font-medium">Rôle (Modifiable)</th>
                <th className="pb-2.5 font-medium">Statut</th>
                <th className="pb-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/60">
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brass/15 text-[11px] font-medium text-brass">
                        {m.nom.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-medium text-ink-900">{m.nom}</span>
                    </div>
                  </td>
                  <td className="py-3 text-ink-500">{m.email}</td>
                  <td className="py-3">
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      className="rounded border border-ink-200 bg-paper px-2 py-1 text-[12px] font-medium text-ink-800 focus:border-brass focus:outline-none"
                    >
                      <option value="Administrateur">Administrateur</option>
                      <option value="Comptable">Comptable</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Lecteur">Lecteur</option>
                    </select>
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        m.statut === "Actif"
                          ? "bg-status-successBg text-status-success"
                          : m.statut === "Invité"
                          ? "bg-status-warningBg text-status-warning"
                          : "bg-ink-200 text-ink-600"
                      }`}
                    >
                      {m.statut}
                    </span>
                  </td>
                  <td className="py-3 text-right relative">
                    <button
                      onClick={() => setActionMenuOpen(actionMenuOpen === m.id ? null : m.id)}
                      className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {actionMenuOpen === m.id && (
                      <div className="absolute right-2 top-9 z-20 w-44 rounded-md bg-paper-card shadow-panel border border-ink-200 py-1 text-left">
                        <button
                          onClick={() => {
                            handleStatusToggle(m.id);
                            setActionMenuOpen(null);
                          }}
                          className="block w-full text-left px-3 py-1.5 text-[12px] text-ink-700 hover:bg-ink-50"
                        >
                          {m.statut === "Actif" ? "Suspendre l'accès" : "Activer le compte"}
                        </button>
                        <button
                          onClick={() => {
                            setList((prev) => prev.filter((item) => item.id !== m.id));
                            setActionMenuOpen(null);
                          }}
                          className="block w-full text-left px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50"
                        >
                          Retirer de l'équipe
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg bg-paper-card p-5 shadow-panel border border-ink-200 space-y-4">
            <div className="flex items-center justify-between border-b border-ink-200/60 pb-3">
              <h2 className="text-[15px] font-semibold text-ink-900">Inviter un membre d'équipe</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-ink-400 hover:text-ink-800">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="mb-1 block text-[12.5px] text-ink-600">Nom complet *</label>
                <input
                  required
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Youssef El Amrani"
                  className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[12.5px] text-ink-600">E-mail professionnel *</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="youssef@entreprise.ma"
                  className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[12.5px] text-ink-600">Rôle attribué</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
                >
                  <option value="Administrateur">Administrateur</option>
                  <option value="Comptable">Comptable</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Lecteur">Lecteur</option>
                </select>
                <p className="mt-1 text-[11px] text-ink-400">{ROLE_PERMISSIONS[role]}</p>
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
                  Envoyer l'invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
