"use client";

import { useState, useRef } from "react";
import Modal from "./Modal";
import { TableProperties, Upload, Send, Loader2, CheckCircle2, AlertCircle, Database } from "lucide-react";

interface SpreadsheetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expectedType?: string;
}

export default function SpreadsheetImportModal({ isOpen, onClose, expectedType = "stock" }: SpreadsheetImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [importSession, setImportSession] = useState<any>(null);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      // Get or create company ID
      let companyId = null;
      const compRes = await fetch(`${apiUrl}/api/companies/`);
      const compData = await compRes.json();
      const compList = Array.isArray(compData) ? compData : (compData.results || []);
      if (compList.length > 0) {
        companyId = compList[0].id;
      } else {
        const createRes = await fetch(`${apiUrl}/api/companies/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Fawatir Demo', email: 'demo@fawatir.ma' })
        });
        const created = await createRes.json();
        companyId = created.id;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("expected_type", expectedType);
      formData.append("company", companyId); // REQUIRED BY BACKEND

      const response = await fetch(`${apiUrl}/api/ai/spreadsheets/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur d'analyse: ${errorText}`);
      }

      const data = await response.json();
      setImportSession(data);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!importSession?.id) return;
    setIsConfirming(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      // 1. First save the customized column_mapping via PATCH
      const patchResponse = await fetch(`${apiUrl}/api/ai/spreadsheets/${importSession.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          column_mapping: importSession.column_mapping
        }),
      });

      if (!patchResponse.ok) {
        throw new Error("Erreur lors de la sauvegarde du mapping personnalisé.");
      }

      // 2. Then confirm the import
      const response = await fetch(`${apiUrl}/api/ai/spreadsheets/${importSession.id}/confirm/`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'importation finale.");
      }

      const data = await response.json();
      setFinalResult(data);
    } catch (err: any) {
      setError(err.message || "Erreur d'import");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImportSession(null);
    setFinalResult(null);
    setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { handleReset(); onClose(); }} title="Importer des Données">
      <div className="flex flex-col gap-4">
        
        {finalResult ? (
          /* State 3: Success */
          <div className="flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-4 shadow-sm ring-4 ring-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-sm font-semibold text-ink-900 mb-2">Données importées avec succès !</h4>
            <p className="text-xs text-ink-500 mb-6 text-center max-w-[280px]">
              Les lignes ont été insérées dans la base de données ({finalResult.data_type}).
            </p>
            <button
              onClick={() => { handleReset(); onClose(); }}
              className="rounded-full bg-ink-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-ink-800 transition-all shadow-sm active:scale-95"
            >
              Terminer
            </button>
          </div>
        ) : importSession ? (
          /* State 2: Mapping Validation */
          <div className="flex flex-col animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brass/10 text-brass">
                <Database size={18} />
              </div>
              <div>
                <h4 className="text-[13px] font-semibold text-ink-900">Validation du Mapping</h4>
                <p className="text-[11px] text-ink-500">
                  {importSession.row_count} lignes détectées ({importSession.data_type})
                </p>
              </div>
            </div>

            <div className="bg-paper rounded-xl border border-ink-100 p-4 mb-4 max-h-[300px] overflow-y-auto custom-scrollbar">
              <p className="text-[11px] text-ink-700 font-medium mb-3">Vérifiez et personnalisez le mapping :</p>
              <div className="flex flex-col gap-2">
                {Array.isArray(importSession.column_mapping) ? importSession.column_mapping.map((col: any, idx: number) => (
                  <div key={idx} className="bg-white border border-ink-200 px-3 py-2 rounded-lg text-[11px] flex justify-between items-center shadow-sm">
                    <span className="text-ink-700 font-medium truncate max-w-[150px]" title={col.source_header}>
                      {col.source_header || "Colonne inconnue"}
                    </span>
                    <span className="text-brass font-bold mx-2">→</span>
                    <select
                      className="border border-ink-200 rounded px-2 py-1 bg-ink-50/50 text-ink-900 font-semibold focus:outline-none focus:border-brass/50 max-w-[180px]"
                      value={col.mapped_column}
                      onChange={(e) => {
                        const newMapping = [...importSession.column_mapping];
                        newMapping[idx].mapped_column = e.target.value;
                        setImportSession({ ...importSession, column_mapping: newMapping });
                      }}
                    >
                      <option value="UNMAPPED">Ignoré (Ajouté aux Métadonnées)</option>
                      {expectedType === "stock" && (
                        <>
                          <option value="name">Nom / Produit</option>
                          <option value="sku">SKU / Référence</option>
                          <option value="barcode">Code-barres</option>
                          <option value="description">Description</option>
                          <option value="category_name">Catégorie</option>
                          <option value="selling_price">Prix de vente</option>
                          <option value="quantity">Quantité</option>
                          <option value="unit">Unité</option>
                          <option value="brand">Marque</option>
                          <option value="supplier_name">Fournisseur</option>
                          <option value="status">Statut</option>
                        </>
                      )}
                      {expectedType === "clients" && (
                        <>
                          <option value="customer_code">Code Client</option>
                          <option value="company_name">Entreprise</option>
                          <option value="contact_name">Nom du contact</option>
                          <option value="email">E-mail</option>
                          <option value="phone">Téléphone</option>
                          <option value="mobile">Mobile</option>
                          <option value="address">Adresse</option>
                          <option value="city">Ville</option>
                          <option value="country">Pays</option>
                          <option value="tax_identifier">Matricule Fiscal</option>
                          <option value="ice">ICE</option>
                        </>
                      )}
                      {expectedType === "suppliers" && (
                        <>
                          <option value="supplier_code">Code Fournisseur</option>
                          <option value="company_name">Entreprise</option>
                          <option value="contact_name">Nom du contact</option>
                          <option value="email">E-mail</option>
                          <option value="phone">Téléphone</option>
                          <option value="mobile">Mobile</option>
                          <option value="address">Adresse</option>
                          <option value="city">Ville</option>
                          <option value="country">Pays</option>
                          <option value="tax_identifier">Matricule Fiscal</option>
                          <option value="ice">ICE</option>
                        </>
                      )}
                      {/* Add the currently mapped column if it's not in the standard list above but was mapped by AI */}
                      {col.mapped_column !== "UNMAPPED" && 
                       !["name", "sku", "barcode", "description", "category_name", "selling_price", "quantity", "unit", "brand", "supplier_name", "status", "customer_code", "company_name", "contact_name", "email", "phone", "mobile", "address", "city", "country", "tax_identifier", "ice"].includes(col.mapped_column) && (
                        <option value={col.mapped_column}>{col.mapped_column}</option>
                      )}
                    </select>
                  </div>
                )) : <span className="text-ink-500 text-[11px]">Erreur: données de mapping invalides</span>}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-[11px] text-red-600 font-medium mb-4">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={isConfirming}
                className="rounded-full px-5 py-2 text-[12px] font-semibold text-ink-600 hover:bg-ink-100 transition-all duration-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isConfirming}
                className="flex items-center gap-2 rounded-full bg-brass px-6 py-2 text-[12px] font-bold text-white hover:bg-brass-dark hover:shadow-lg active:scale-95 transition-all duration-300 disabled:opacity-50"
              >
                {isConfirming ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Confirmer l'import
              </button>
            </div>
          </div>
        ) : (
          /* State 1: Upload Form */
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-ai text-white shadow-glow">
              <TableProperties size={20} />
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-ink-900 mb-1">Import Intelligent via IA</h4>
              <p className="text-[11px] text-ink-500 mb-4 leading-relaxed">
                Uploadez un fichier <strong>Excel (.xlsx)</strong>. L'IA va analyser les colonnes, proposer un mapping, puis insérer les données.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-[11px] text-red-600 font-medium">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all duration-300 ${
                  file ? "border-brass bg-brass/5" : "border-ink-200 bg-paper hover:border-brass/50 hover:bg-ink-50/50"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
                  }}
                />
                <div className={`flex h-10 w-10 items-center justify-center rounded-full mb-3 shadow-sm ${file ? 'bg-brass text-white' : 'bg-white text-ink-400 border border-ink-100'}`}>
                  {file ? <CheckCircle2 size={18} /> : <Upload size={18} />}
                </div>
                <p className="text-[12px] font-medium text-ink-700">
                  {file ? file.name : "Sélectionner un fichier Excel"}
                </p>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="rounded-full px-5 py-2 text-[12px] font-semibold text-ink-600 hover:bg-ink-100 transition-all duration-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !file}
                  className="flex items-center gap-2 rounded-full bg-ink-900 px-6 py-2.5 text-[12px] font-semibold text-white hover:bg-ink-800 hover:shadow-lg active:scale-95 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Analyse...</>
                  ) : (
                    <><Send size={14} /> Suivant</>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
