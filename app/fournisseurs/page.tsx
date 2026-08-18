"use client";

import { Plus, MoreHorizontal, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import SpreadsheetImportModal from "@/components/SpreadsheetImportModal";
import AddSupplierModal from "@/components/AddSupplierModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function FournisseursPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metadataKeys, setMetadataKeys] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
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
    fetchSuppliers();
    const handleDataUpdate = () => fetchSuppliers();
    window.addEventListener("dataUpdated", handleDataUpdate);
    return () => window.removeEventListener("dataUpdated", handleDataUpdate);
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`/api/suppliers?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setSuppliers(list);
      setCurrentPage(1);
      
      // Extract all unique metadata keys across all suppliers
      const keys = new Set<string>();
      list.forEach((sup: any) => {
        if (sup.metadata && typeof sup.metadata === 'object') {
          Object.keys(sup.metadata).forEach((key) => keys.add(key));
        }
      });
      setMetadataKeys(Array.from(keys));
    } catch (err) {
      console.error("Error fetching suppliers", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter((f) => {
    const term = searchTerm.toLowerCase();
    return (
      (f.company_name || "").toLowerCase().includes(term) ||
      (f.contact_name || "").toLowerCase().includes(term) ||
      (f.email || "").toLowerCase().includes(term) ||
      (f.supplier_code || "").toLowerCase().includes(term) ||
      (f.city || "").toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const displayedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Fournisseurs</h1>
          <p className="text-[13px] text-slate-400">
            Gérez votre répertoire de fournisseurs et leurs métadonnées
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setConfirmConfig({
                isOpen: true,
                title: "Vider les fournisseurs",
                message: "Voulez-vous vraiment vider toute la liste des fournisseurs ? Cette action est irréversible.",
                onConfirm: async () => {
                  await fetch("/api/suppliers/clear", { method: "DELETE" });
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "suppliers" } }));
                  }
                  fetchSuppliers();
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
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
          >
            <Plus size={16} /> Ajouter un fournisseur
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
          placeholder="Rechercher des fournisseurs..."
          className="mb-5 w-72 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-[13px] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        
        {loading ? (
          <div className="flex justify-center py-12 flex-1 items-center">
            <Loader2 className="animate-spin text-indigo-400" size={28} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1 pb-44 min-h-[360px]">
              <table className="w-full text-[13.5px] min-w-max border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Nom de l'entreprise</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">E-mail</th>
                    <th className="py-3 px-3">Téléphone</th>
                    {metadataKeys.map(key => (
                      <th key={key} className="py-3 px-3 text-indigo-400">{key}</th>
                    ))}
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {displayedSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={6 + metadataKeys.length} className="py-12 text-center text-slate-500">
                        Aucun fournisseur trouvé.
                      </td>
                    </tr>
                  ) : (
                    displayedSuppliers.map((f, idx) => (
                      <tr key={`${f.id}-${idx}`} className="group hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-indigo-400">{f.supplier_code}</td>
                        <td className="py-3.5 px-3 font-semibold text-white">{f.company_name}</td>
                        <td className="py-3.5 px-3 text-slate-300 font-medium">{f.contact_name}</td>
                        <td className="py-3.5 px-3 text-slate-400">{f.email}</td>
                        <td className="figure py-3.5 px-3 text-slate-400 font-mono">{f.phone || f.mobile}</td>
                        
                        {metadataKeys.map(key => (
                          <td key={key} className="py-3.5 px-3 text-slate-400">
                            {f.metadata && f.metadata[key] ? f.metadata[key] : '-'}
                          </td>
                        ))}
                        
                        <td className="py-3.5 px-3 text-right relative">
                          <button 
                            onClick={() => setActionMenuOpen(actionMenuOpen === f.id ? null : f.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {actionMenuOpen === f.id && (
                            <div className="absolute right-2 top-10 z-50 w-48 rounded-xl bg-slate-900 shadow-2xl border border-slate-800 p-1.5 text-left animate-in fade-in zoom-in-95">
                              <button
                                onClick={() => {
                                  setConfirmConfig({
                                    isOpen: true,
                                    title: `Supprimer le fournisseur ${f.company_name || f.contact_name}`,
                                    message: "Voulez-vous vraiment supprimer ce fournisseur ? Cette action est irréversible.",
                                    onConfirm: async () => {
                                      try {
                                        await fetch(`/api/suppliers/${f.id}`, { method: "DELETE" });
                                      } catch (err) {}
                                      if (typeof window !== "undefined") {
                                        window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "suppliers" } }));
                                      }
                                      fetchSuppliers();
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
                Affichage de {suppliers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} à {Math.min(currentPage * itemsPerPage, suppliers.length)} sur {suppliers.length}
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

      <SpreadsheetImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => {
          setIsImportModalOpen(false);
          fetchSuppliers(); // refresh data after import
        }}
        onSuccess={() => {
          fetchSuppliers();
        }}
        expectedType="suppliers"
      />

      <AddSupplierModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchSuppliers();
        }}
      />

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
