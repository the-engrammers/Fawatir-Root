"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, Plus, MoreHorizontal, Users, Loader2 } from "lucide-react";
import { mad } from "@/lib/format";

export default function EmployesPage() {
  const [employesList, setEmployesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`/api/employes?t=${Date.now()}`);
      const data = await res.json();
      setEmployesList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    const handleUpdate = () => fetchEmployees();
    window.addEventListener("dataUpdated", handleUpdate);
    return () => window.removeEventListener("dataUpdated", handleUpdate);
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">Employés</h1>
          <p className="text-[13px] text-ink-400">
            Gérez votre équipe et leurs informations salariales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-md border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50">
            <Settings size={15} /> Paramètres de paie
          </button>
          <Link
            href="/employes/nouveau"
            className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
          >
            <Plus size={15} /> Ajouter un employé
          </Link>
        </div>
      </div>

      <div className="ledger-card !p-4">
        <input
          type="text"
          placeholder="Rechercher..."
          className="mb-4 w-64 rounded-md border border-ink-200 bg-paper px-3 py-1.5 text-[13px] placeholder:text-ink-400 focus:border-brass/60 focus:outline-none"
        />

        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-ink-300" size={32} /></div>
        ) : employesList.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <Users size={22} className="text-ink-300" />
            <p className="text-[13.5px] font-medium text-ink-700">Aucun employé</p>
            <p className="text-[12px] text-ink-400">
              Ajoutez votre premier employé pour commencer à générer des bulletins
            </p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
                <th className="pb-2.5 font-medium">Nom</th>
                <th className="pb-2.5 font-medium">Poste</th>
                <th className="pb-2.5 font-medium">Département</th>
                <th className="pb-2.5 font-medium">Salaire de base</th>
                <th className="pb-2.5 font-medium">Statut</th>
                <th className="pb-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/60">
              {employesList.map((e) => (
                <tr key={e.id} className="group">
                  <td className="py-3 font-medium text-ink-900">
                    {e.prenom} {e.nom}
                    <div className="text-[11.5px] font-normal text-ink-400 font-mono mt-0.5">{e.cin || "-"}</div>
                  </td>
                  <td className="py-3 text-ink-700">{e.poste}</td>
                  <td className="py-3 text-ink-500">{e.departement}</td>
                  <td className="figure py-3 text-ink-900">{mad(e.salaire_base)}/mois</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        e.statut === "Actif"
                          ? "bg-status-successBg text-status-success"
                          : "bg-ink-200/60 text-ink-500"
                      }`}
                    >
                      {e.statut}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="rounded-md p-1.5 text-ink-400 opacity-0 hover:bg-ink-900/[0.04] hover:text-ink-700 group-hover:opacity-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
