"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import AddClientModal from "@/components/AddClientModal";
import SpreadsheetImportModal from "@/components/SpreadsheetImportModal";
import { fetchAPI } from "@/lib/api";

export default function ClientsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metadataKeys, setMetadataKeys] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setError("");
    try {
      const res = await fetchAPI("api/clients/");
      if (!res.ok) {
        setError("Impossible de charger les clients");
        setLoading(false);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setClients(list);

      const keys = new Set<string>();
      list.forEach((c: any) => {
        if (c.metadata && typeof c.metadata === "object") {
          Object.keys(c.metadata).forEach((key) => keys.add(key));
        }
      });
      setMetadataKeys(Array.from(keys));
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const displayedClients = clients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">Clients</h1>
          <p className="text-[13px] text-ink-400">Gérez votre répertoire de clients</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              if (confirm("Voulez-vous vraiment vider toute la liste des clients ?")) {
                await fetchAPI("api/clients/clear/", { method: "DELETE" });
                fetchClients();
              }
            }}
            className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-200 px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-500/20"
          >
            Vider
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-paper border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50"
          >
            Importer
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
          >
            <Plus size={15} /> Ajouter un client
          </button>
        </div>
      </div>

      <div className="ledger-card !p-4 flex flex-col min-h-[500px]">
        <input
          type="text"
          placeholder="Rechercher des clients..."
          className="mb-4 w-72 rounded-md border border-ink-200 bg-paper px-3 py-1.5 text-[13px] placeholder:text-ink-400 focus:border-brass/60 focus:outline-none"
        />

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-[13px] text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10 flex-1">
            <Loader2 className="animate-spin text-ink-300" size={24} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-[13px] min-w-max">
                <thead>
                  <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
                    <th className="pb-2.5 font-medium px-2">Nom</th>
                    <th className="pb-2.5 font-medium px-2">Entreprise</th>
                    <th className="pb-2.5 font-medium px-2">E-mail</th>
                    <th className="pb-2.5 font-medium px-2">Téléphone</th>
                    {metadataKeys.map(key => (
                      <th key={key} className="pb-2.5 font-medium px-2 text-brass">{key}</th>
                    ))}
                    <th className="pb-2.5 font-medium text-right px-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-200/60">
                  {displayedClients.length === 0 ? (
                    <tr>
                      <td colSpan={5 + metadataKeys.length} className="py-8 text-center text-ink-400">
                        Aucun client trouvé.
                      </td>
                    </tr>
                  ) : (
                    displayedClients.map((c) => (
                      <tr key={c.id} className="group">
                        <td className="py-3 px-2">
                          <Link href={`/clients/${c.id}`} className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brass/15 text-[12px] font-medium text-brass">
                              {(c.contact_name || c.company_name || "?").charAt(0).toUpperCase()}
                            </span>
                            <span className="font-medium text-ink-900 hover:text-brass">{c.contact_name || c.company_name}</span>
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-ink-700">{c.company_name}</td>
                        <td className="py-3 px-2 text-ink-500">{c.email}</td>
                        <td className="figure py-3 px-2 text-ink-500">{c.phone || c.mobile}</td>

                        {metadataKeys.map(key => (
                          <td key={key} className="py-3 px-2 text-ink-500">
                            {c.metadata && c.metadata[key] ? c.metadata[key] : '-'}
                          </td>
                        ))}

                        <td className="py-3 px-2 text-right">
                          <button className="rounded-md p-1.5 text-ink-400 opacity-0 hover:bg-ink-900/[0.04] hover:text-ink-700 group-hover:opacity-100">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-ink-200/60 pt-4 mt-4">
              <span className="text-[13px] text-ink-500">
                Affichage de {clients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} à {Math.min(currentPage * itemsPerPage, clients.length)} sur {clients.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center rounded border border-ink-200 h-8 w-8 text-ink-600 disabled:opacity-50 hover:bg-ink-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[13px] font-medium px-3 text-ink-900">
                  Page {currentPage} / {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="flex items-center justify-center rounded border border-ink-200 h-8 w-8 text-ink-600 disabled:opacity-50 hover:bg-ink-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && <AddClientModal onClose={() => {
        setModalOpen(false);
        fetchClients();
      }} />}

      <SpreadsheetImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          fetchClients();
        }}
        expectedType="clients"
      />
    </div>
  );
}