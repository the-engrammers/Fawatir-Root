"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Loader2, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import AddClientModal from "@/components/AddClientModal";
import SpreadsheetImportModal from "@/components/SpreadsheetImportModal";
import WhatsAppSendModal from "@/components/WhatsAppSendModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function ClientsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedClientForWhatsApp, setSelectedClientForWhatsApp] = useState<any | null>(null);
  
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metadataKeys, setMetadataKeys] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchClients();
    const handleDataUpdate = () => fetchClients();
    window.addEventListener("dataUpdated", handleDataUpdate);
    return () => window.removeEventListener("dataUpdated", handleDataUpdate);
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch(`/api/clients?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setClients(list);
      setCurrentPage(1);
      
      const keys = new Set<string>();
      list.forEach((c: any) => {
        if (c.metadata && typeof c.metadata === 'object') {
          Object.keys(c.metadata).forEach((key) => keys.add(key));
        }
      });
      setMetadataKeys(Array.from(keys));
    } catch (err) {
      console.error("Error fetching clients", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.company_name || "").toLowerCase().includes(term) ||
      (c.contact_name || "").toLowerCase().includes(term) ||
      (c.email || "").toLowerCase().includes(term) ||
      (c.phone || "").toLowerCase().includes(term) ||
      (c.city || "").toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const displayedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Clients</h1>
          <p className="text-[13px] text-slate-400">Gérez votre portefeuille client et l'historique de facturation</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setConfirmConfig({
                isOpen: true,
                title: "Vider les clients",
                message: "Voulez-vous vraiment vider toute la liste des clients ? Cette action est irréversible.",
                onConfirm: async () => {
                  await fetch("/api/clients/clear", { method: "DELETE" });
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "clients" } }));
                  }
                  fetchClients();
                }
              });
            }}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-[12.5px] font-semibold text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
          >
            Vider
          </button>
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-[12.5px] font-semibold text-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
          >
            Importer Excel
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
          >
            <Plus size={16} /> Ajouter un client
          </button>
        </div>
      </div>

      <div className="bento-card !p-5 flex flex-col min-h-[500px]">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Rechercher des clients..."
          className="mb-5 w-72 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-[13px] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        {loading ? (
          <div className="flex justify-center py-12 flex-1 items-center">
            <Loader2 className="animate-spin text-indigo-400" size={28} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-[13.5px] min-w-max border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Nom</th>
                    <th className="py-3 px-3">Entreprise</th>
                    <th className="py-3 px-3">E-mail</th>
                    <th className="py-3 px-3">Téléphone</th>
                    {metadataKeys.map(key => (
                      <th key={key} className="py-3 px-3 text-indigo-400">{key}</th>
                    ))}
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {displayedClients.length === 0 ? (
                    <tr>
                      <td colSpan={5 + metadataKeys.length} className="py-12 text-center text-slate-500">
                        Aucun client trouvé.
                      </td>
                    </tr>
                  ) : (
                    displayedClients.map((c, idx) => (
                      <tr key={`${c.id}-${idx}`} className="group hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-3">
                          <Link href={`/clients/${c.id}`} className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-[12px] font-bold text-indigo-300 ring-1 ring-indigo-500/30">
                              {(c.contact_name || c.company_name || "?").charAt(0).toUpperCase()}
                            </span>
                            <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{c.contact_name || c.company_name}</span>
                          </Link>
                        </td>
                        <td className="py-3.5 px-3 text-slate-300 font-medium">{c.company_name}</td>
                        <td className="py-3.5 px-3 text-slate-400">{c.email}</td>
                        <td className="figure py-3.5 px-3 text-slate-400 font-mono">{c.phone || c.mobile}</td>
                        
                        {metadataKeys.map(key => (
                          <td key={key} className="py-3.5 px-3 text-slate-400">
                            {c.metadata && c.metadata[key] ? c.metadata[key] : '-'}
                          </td>
                        ))}
                        
                        <td className="py-3.5 px-3 text-right relative">
                          <button 
                            onClick={() => setActionMenuOpen(actionMenuOpen === c.id ? null : c.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {actionMenuOpen === c.id && (
                            <div className="absolute right-2 top-10 z-20 w-44 rounded-xl bg-slate-900 shadow-2xl border border-slate-800 p-1.5 text-left animate-in fade-in zoom-in-95">
                              <Link 
                                href={`/clients/${c.id}`}
                                className="block rounded-lg px-3 py-2 text-[12.5px] text-slate-200 hover:bg-slate-800 font-medium"
                              >
                                Voir la fiche
                              </Link>
                              <Link 
                                href={`/factures/nouvelle?client_id=${c.id}`}
                                className="block rounded-lg px-3 py-2 text-[12.5px] text-indigo-400 hover:bg-slate-800 font-semibold"
                              >
                                Créer une facture
                              </Link>
                              <Link 
                                href={`/devis/nouveau?client_id=${c.id}`}
                                className="block rounded-lg px-3 py-2 text-[12.5px] text-slate-300 hover:bg-slate-800"
                              >
                                Créer un devis
                              </Link>
                              <button
                                onClick={() => {
                                  setSelectedClientForWhatsApp(c);
                                  setActionMenuOpen(null);
                                }}
                                className="flex items-center gap-1.5 w-full text-left rounded-lg px-3 py-2 text-[12.5px] text-emerald-300 hover:bg-slate-800 font-medium"
                              >
                                <MessageSquare size={14} className="text-emerald-400" />
                                Contacter sur WhatsApp
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmConfig({
                                    isOpen: true,
                                    title: `Supprimer le client ${c.company_name || c.contact_name}`,
                                    message: "Voulez-vous vraiment supprimer ce client ? Cette action est irréversible.",
                                    onConfirm: async () => {
                                      try {
                                        await fetch(`/api/clients/${c.id}`, { method: "DELETE" });
                                      } catch (err) {}
                                      if (typeof window !== "undefined") {
                                        window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "clients" } }));
                                      }
                                      fetchClients();
                                    }
                                  });
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

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-4 mt-4 gap-3">
              <span className="text-[13px] text-slate-400">
                Affichage de {clients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} à {Math.min(currentPage * itemsPerPage, clients.length)} sur {clients.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center rounded-lg border border-slate-800 bg-slate-950 h-8 w-8 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[13px] font-bold px-3 text-white">
                  Page {currentPage} / {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="flex items-center justify-center rounded-lg border border-slate-800 bg-slate-950 h-8 w-8 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <AddClientModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => fetchClients()}
        />
      )}
      
      <SpreadsheetImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => {
          setIsImportModalOpen(false);
          fetchClients(); 
        }}
        onSuccess={() => {
          fetchClients();
        }}
        expectedType="clients"
      />

      {/* WhatsApp Modal */}
      {selectedClientForWhatsApp && (
        <WhatsAppSendModal
          isOpen={!!selectedClientForWhatsApp}
          onClose={() => setSelectedClientForWhatsApp(null)}
          documentType="facture"
          recipientName={selectedClientForWhatsApp.contact_name || selectedClientForWhatsApp.company_name}
          recipientPhone={selectedClientForWhatsApp.phone || selectedClientForWhatsApp.mobile || ""}
          documentNumber="INFO-CLIENT"
          amount={0}
        />
      )}

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
      />
    </div>
  );
}
