"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { mad } from "@/lib/format";
import SpreadsheetImportModal from "@/components/SpreadsheetImportModal";
import { fetchAPI } from "@/lib/api";

export default function StocksPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metadataKeys, setMetadataKeys] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
    const handleDataUpdate = () => fetchProducts();
    window.addEventListener("dataUpdated", handleDataUpdate);
    return () => window.removeEventListener("dataUpdated", handleDataUpdate);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setProducts(list);
      setCurrentPage(1);
      
      const keys = new Set<string>();
      list.forEach((p: any) => {
        if (p.metadata && typeof p.metadata === 'object') {
          Object.keys(p.metadata).forEach((key) => keys.add(key));
        }
      });
      setMetadataKeys(Array.from(keys));
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(term) ||
      (p.sku || "").toLowerCase().includes(term) ||
      (p.category_name || "").toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const suivis = products.filter((p) => p.track_inventory !== false);
  const enRupture = suivis.filter((p) => (p.quantity ?? 0) === 0).length;
  const stockBas = suivis.filter((p) => (p.quantity ?? 0) > 0 && (p.quantity ?? 0) < 10).length;
  const valeurTotale = suivis.reduce((s, p) => s + (p.selling_price || 0) * (p.quantity ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">
            Gestion des stocks
          </h1>
          <p className="text-[13px] text-ink-400">Gérez vos produits, services et inventaire</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              if (confirm("Voulez-vous vraiment vider toute la liste des produits ?")) {
                await fetch("/api/products/clear", { method: "DELETE" });
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "stock" } }));
                }
                fetchProducts();
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
          <Link
            href="/stocks/nouveau"
            className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
          >
            <Plus size={15} /> Ajouter un produit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="ledger-card">
          <p className="figure text-[19px] font-medium text-ink-900">{suivis.length}</p>
          <p className="text-[12px] text-ink-400">Produits suivis · {products.length} total</p>
        </div>
        <div className="ledger-card !border-l-status-danger/70">
          <p className="figure text-[19px] font-medium text-ink-900">{enRupture}</p>
          <p className="text-[12px] text-ink-400">En rupture</p>
        </div>
        <div className="ledger-card !border-l-status-warning/70">
          <p className="figure text-[19px] font-medium text-ink-900">{stockBas}</p>
          <p className="text-[12px] text-ink-400">Stock bas</p>
        </div>
        <div className="ledger-card">
          <p className="figure text-[19px] font-medium text-ink-900">{mad(valeurTotale)}</p>
          <p className="text-[12px] text-ink-400">Valeur totale du stock</p>
        </div>
      </div>

      <div className="ledger-card !p-4 flex flex-col min-h-[500px]">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Rechercher des produits..."
          className="mb-4 w-72 rounded-md border border-ink-200 bg-paper px-3 py-1.5 text-[13px] placeholder:text-ink-400 focus:border-brass/60 focus:outline-none"
        />

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
                    <th className="pb-2.5 font-medium px-2">SKU</th>
                    <th className="pb-2.5 font-medium px-2">Prix</th>
                    <th className="pb-2.5 font-medium px-2">Unité</th>
                    <th className="pb-2.5 font-medium px-2">Catégorie</th>
                    <th className="pb-2.5 font-medium px-2">Stock</th>
                    {metadataKeys.map(key => (
                      <th key={key} className="pb-2.5 font-medium px-2 text-brass">{key}</th>
                    ))}
                    <th className="pb-2.5 font-medium px-2">Statut</th>
                    <th className="pb-2.5 font-medium text-right px-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-200/60">
                  {displayedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8 + metadataKeys.length} className="py-8 text-center text-ink-400">
                        Aucun produit trouvé.
                      </td>
                    </tr>
                  ) : (
                    displayedProducts.map((p, idx) => (
                      <tr key={`${p.id}-${idx}`}>
                        <td className="py-3 px-2">
                          <Link href={`/stocks/${p.id}`} className="font-medium text-ink-900 hover:text-brass">
                            {p.name || 'Sans nom'}
                          </Link>
                        </td>
                        <td className="figure py-3 px-2 text-ink-500">{p.sku}</td>
                        <td className="figure py-3 px-2 text-ink-900">{mad(p.selling_price || 0)}</td>
                        <td className="py-3 px-2 text-ink-500">{p.unit || '-'}</td>
                        <td className="py-3 px-2">
                          <span className="rounded-full bg-status-infoBg px-2 py-0.5 text-[11px] font-medium text-status-info">
                            {p.category_name || 'Général'}
                          </span>
                        </td>
                        <td className="figure py-3 px-2 text-ink-700">
                          {p.track_inventory !== false ? (p.quantity ?? 0) : <span className="text-ink-300">—</span>}
                        </td>
                        
                        {metadataKeys.map(key => (
                          <td key={key} className="py-3 px-2 text-ink-500">
                            {p.metadata && p.metadata[key] ? p.metadata[key] : '-'}
                          </td>
                        ))}
                        
                        <td className="py-3 px-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              p.is_active !== false
                                ? "bg-status-successBg text-status-success"
                                : "bg-ink-200/60 text-ink-500"
                            }`}
                          >
                            {p.is_active !== false ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right relative">
                          <button 
                            onClick={() => setActionMenuOpen(actionMenuOpen === p.id ? null : p.id)}
                            className="rounded-md p-1.5 text-ink-400 hover:bg-ink-900/[0.04] hover:text-ink-700"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {actionMenuOpen === p.id && (
                            <div className="absolute right-2 top-10 z-20 w-44 rounded-md bg-paper-card shadow-panel border border-ink-200 py-1 text-left">
                              <button
                                onClick={async () => {
                                  const newQtyStr = prompt("Ajuster la quantité en stock :", String(p.quantity || 0));
                                  if (newQtyStr !== null) {
                                    const newQty = parseInt(newQtyStr) || 0;
                                    try {
                                      await fetch(`/api/products/${p.id}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ quantity: newQty })
                                      });
                                    } catch (err) {}
                                    if (typeof window !== "undefined") {
                                      window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "stock" } }));
                                    }
                                    fetchProducts();
                                  }
                                  setActionMenuOpen(null);
                                }}
                                className="block w-full text-left px-3 py-1.5 text-[12px] text-ink-700 hover:bg-ink-50"
                              >
                                Ajuster le stock
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Supprimer le produit ${p.name} ?`)) {
                                    try {
                                      await fetch(`/api/products/${p.id}`, { method: "DELETE" });
                                    } catch (err) {}
                                    if (typeof window !== "undefined") {
                                      window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "stock" } }));
                                    }
                                    fetchProducts();
                                    setActionMenuOpen(null);
                                  }
                                }}
                                className="block w-full text-left px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50"
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
            <div className="flex items-center justify-between border-t border-ink-200/60 pt-4 mt-4">
              <span className="text-[13px] text-ink-500">
                Affichage de {products.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} à {Math.min(currentPage * itemsPerPage, products.length)} sur {products.length}
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
          fetchProducts(); 
        }}
        onSuccess={() => {
          fetchProducts();
        }}
        expectedType="stock"
      />
    </div>
  );
}
