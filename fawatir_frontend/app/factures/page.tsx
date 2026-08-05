"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Loader2 } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import { mad, statusTone } from "@/lib/format";
import { fetchAPI } from "@/lib/api";

const statutFilters = ["Toutes", "Brouillon", "Envoyée", "Vue", "Payée", "En retard", "Annulée"];

export default function FacturesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clientsMap, setClientsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStatut, setActiveStatut] = useState("Toutes");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setError("");
    try {
      const [invRes, cliRes] = await Promise.all([
        fetchAPI("api/invoices/"),
        fetchAPI("api/clients/"),
      ]);

      if (!invRes.ok) {
        setError("Impossible de charger les factures");
        setLoading(false);
        return;
      }

      const invData = await invRes.json();
      const cliData = await cliRes.json();

      const invList = Array.isArray(invData) ? invData : invData.results || [];
      const cliList = Array.isArray(cliData) ? cliData : cliData.results || [];

      const map: Record<string, string> = {};
      cliList.forEach((c: any) => {
        map[c.id] = c.contact_name || c.company_name || "Client inconnu";
      });

      setClientsMap(map);
      setInvoices(invList);
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const rows =
    activeStatut === "Toutes"
      ? invoices
      : invoices.filter((f) => f.status === activeStatut);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">Factures</h1>
          <p className="text-[13px] text-ink-400">Créez, suivez et encaissez vos factures</p>
        </div>
        <Link
          href="/factures/nouvelle"
          className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
        >
          <Plus size={15} /> Nouvelle facture
        </Link>
      </div>

      <div className="ledger-card !p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {statutFilters.map((s) => (
              <button
                key={s}
                onClick={() => setActiveStatut(s)}
                className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                  activeStatut === s
                    ? "bg-ink-900 text-white"
                    : "bg-paper text-ink-600 hover:bg-ink-200/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Rechercher une facture..."
              className="w-56 rounded-md border border-ink-200 bg-paper px-3 py-1.5 text-[13px] placeholder:text-ink-400 focus:border-brass/60 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-[13px] text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-ink-300" size={24} />
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
                <th className="pb-2.5 font-medium">Facture N°</th>
                <th className="pb-2.5 font-medium">Client</th>
                <th className="pb-2.5 font-medium">Montant</th>
                <th className="pb-2.5 font-medium">Statut</th>
                <th className="pb-2.5 font-medium">Date d'émission</th>
                <th className="pb-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/60">
              {rows.map((f) => (
                <tr key={f.id} className="group">
                  <td className="py-3">
                    <Link href={`/factures/${f.id}`} className="font-medium text-brass hover:underline">
                      {f.invoice_number}
                    </Link>
                  </td>
                  <td className="py-3 text-ink-700">{clientsMap[f.client] || "—"}</td>
                  <td className="figure py-3 text-ink-900">{mad(f.total_amount)}</td>
                  <td className="py-3">
                    <StatusChip tone={statusTone(f.status)}>{f.status}</StatusChip>
                  </td>
                  <td className="py-3 text-ink-400">{f.issue_date}</td>
                  <td className="py-3 text-right">
                    <button className="rounded-md p-1.5 text-ink-400 opacity-0 hover:bg-ink-900/[0.04] hover:text-ink-700 group-hover:opacity-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-ink-400">
                    Aucune facture pour ce statut.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}