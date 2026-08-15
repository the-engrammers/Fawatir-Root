"use client";

import { Plus, MoreHorizontal, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import SpreadsheetImportModal from "@/components/SpreadsheetImportModal";
import AddSupplierModal from "@/components/AddSupplierModal";
import { fetchAPI } from "@/lib/api";

export default function FournisseursPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metadataKeys, setMetadataKeys] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setError("");
    try {
      const res = await fetchAPI("api/suppliers/");
      if (!res.ok) {
        setError("Impossible de charger les fournisseurs");
        setLoading(false);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setSuppliers(list);

      const keys = new Set<string>();
      list.forEach((sup: any) => {
        if (sup.metadata && typeof sup.metadata === "object") {
          Object.keys(sup.metadata).forEach((key) => keys.add(key));
        }
      });
      setMetadataKeys(Array.from(keys));
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(suppliers.length / itemsPerPage);
  const displayedSuppliers = suppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">Fournisseurs</h1>
          <p className="text-[13px] text-ink-400">
            Gérez votre répertoire de fournisseurs et les produits liés
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              if (confirm("Voulez-vous vraiment vider toute la liste des fournisseurs ?")) {
                await fetchAPI("api/suppliers/clear/", { method: "DELETE" });
                fetchSuppliers();
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
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
          >
            <Plus size={15} /> Ajouter un fournisseur
          </button>
        </div>
      </div>

      <div className="ledger-card !p-4 flex flex-col min-h-[500px]">
        <input
          type="text"
          placeholder="Rechercher des fournisseurs..."
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
                    <th className="pb-2.5 font-medium px-2">Code</th>
                    <th className="pb-2.5 font-medium px-2">Nom de l'entreprise</th>
                    <th className="pb-2.5 font-medium px-2">Contact</th>
                    <th className="pb-2.5 font-medium px-2">E-mail</th>
                    <th className="pb-2.5 font-medium px-2">Téléphone</th>
                    {metadataKeys.map(key => (
                      <th key={key} className="pb-2.5 font-medium px-2 text-brass">{key}</th>
                    ))}
                    <th className="pb-2.5 font-medium text-right px-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-200/60">
                  {displayedSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={6 + metadataKeys.length} className="py-8 text-center text-ink-400">
                        Aucun fournisseur trouvé.
                      </td>
                    </tr>
                  ) : (
                    displayedSuppliers.map((f) => (
                      <tr key={f.id} className="group">
                        <td className="py-3 px-2 font-medium text-ink-500">{f.supplier_code}</td>
                        <td className="py-3 px-2 font-medium text-ink-900">{f.company_name}</td>
                        <td className="py-3 px-2 text-ink-700">{f.contact_name}</td>
                        <td className="py-3 px-2 text-ink-500">{f.email}</td>
                        <td className="figure py-3 px-2 text-ink-500">{f.phone || f.mobile}</td>

                        {metadataKeys.map(key => (
                          <td key={key} className="py-3 px-2 text-ink-500">
                            {f.metadata && f.metadata[key] ? f.metadata[key] : '-'}
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
                Affichage de {suppliers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} à {Math.min(currentPage * itemsPerPage, suppliers.length)} sur {suppliers.length}
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

      <SpreadsheetImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          fetchSuppliers();
        }}
        expectedType="suppliers"
      />

      {isAddModalOpen && (
        <AddSupplierModal
          onClose={() => {
            setIsAddModalOpen(false);
            fetchSuppliers();
          }}
        />
      )}
    </div>
  );
}