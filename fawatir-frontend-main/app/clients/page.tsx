"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal } from "lucide-react";
import { clientsFull } from "@/lib/mock-data";
import AddClientModal from "@/components/AddClientModal";

export default function ClientsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">Clients</h1>
          <p className="text-[13px] text-ink-400">Gérez votre répertoire de clients</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
        >
          <Plus size={15} /> Ajouter un client
        </button>
      </div>

      <div className="ledger-card !p-4">
        <input
          type="text"
          placeholder="Rechercher des clients..."
          className="mb-4 w-72 rounded-md border border-ink-200 bg-paper px-3 py-1.5 text-[13px] placeholder:text-ink-400 focus:border-brass/60 focus:outline-none"
        />

        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
              <th className="pb-2.5 font-medium">Nom</th>
              <th className="pb-2.5 font-medium">Entreprise</th>
              <th className="pb-2.5 font-medium">E-mail</th>
              <th className="pb-2.5 font-medium">Téléphone</th>
              <th className="pb-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/60">
            {clientsFull.map((c) => (
              <tr key={c.id} className="group">
                <td className="py-3">
                  <Link href={`/clients/${c.id}`} className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brass/15 text-[12px] font-medium text-brass">
                      {c.nom.charAt(0)}
                    </span>
                    <span className="font-medium text-ink-900 hover:text-brass">{c.nom}</span>
                  </Link>
                </td>
                <td className="py-3 text-ink-700">{c.entreprise}</td>
                <td className="py-3 text-ink-500">{c.email}</td>
                <td className="figure py-3 text-ink-500">{c.telephone}</td>
                <td className="py-3 text-right">
                  <button className="rounded-md p-1.5 text-ink-400 opacity-0 hover:bg-ink-900/[0.04] hover:text-ink-700 group-hover:opacity-100">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && <AddClientModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
