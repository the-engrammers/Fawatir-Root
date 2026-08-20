"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { FileScan, AlertCircle, Loader2, CheckCircle, Plus, Trash2, Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import FormAlert from "./FormAlert";
import { mad } from "@/lib/format";

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "devis" | "factures";
}

type ExtractedLine = {
  description: string;
  quantite: number;
  prix_unitaire: number;
  montant?: number;
};

export default function ScannerModal({ isOpen, onClose, targetType }: ScannerModalProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "verify">("upload");
  const [scannedDocId, setScannedDocId] = useState<string | null>(null);
  
  // Editable Extracted Data State
  const [docNumber, setDocNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [docDate, setDocDate] = useState(new Date().toISOString().split("T")[0]);
  const [lignes, setLignes] = useState<ExtractedLine[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isScanning || step === "verify") return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier (PDF ou Image).");
      return;
    }
    
    setIsScanning(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", targetType === "devis" ? "devis" : "invoice");
      
      const response = await fetch(`/api/ai/documents`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        let errStr = "Erreur lors du traitement par l'IA";
        try {
          const errData = await response.json();
          errStr = errData.error_message || errData.error || errStr;
        } catch (e) {
          errStr = await response.text();
        }
        throw new Error(errStr);
      }
      
      const data = await response.json();
      
      if (data.status === "failed") {
        throw new Error(data.error_message || "Erreur d'extraction OCR avec l'IA.");
      }

      if (data.id) setScannedDocId(data.id);
      
      const ext = data.extracted_data || {};
      
      setDocNumber(ext.numero_facture || (targetType === "devis" ? `DEV-${Math.floor(1000 + Math.random()*9000)}` : `FAC-${Math.floor(1000 + Math.random()*9000)}`));
      setClientName(ext.client || ext.fournisseur || "");
      setDocDate(ext.date || new Date().toISOString().split("T")[0]);
      
      const parsedLignes: ExtractedLine[] = Array.isArray(ext.lignes) && ext.lignes.length > 0
        ? ext.lignes.map((l: any) => ({
            description: l.description || l.nom || "",
            quantite: Number(l.quantite || 1),
            prix_unitaire: Number(l.prix_unitaire || 0)
          }))
        : [];
      
      setLignes(parsedLignes);
      setStep("verify");
      setIsScanning(false);
      
    } catch (err: any) {
      let friendly = err?.message || "Une erreur est survenue lors de l'analyse par l'IA";
      if (friendly.includes("NetworkError") || friendly.includes("Failed to fetch") || friendly.includes("fetch")) {
        friendly = "Problème de connexion réseau avec le serveur. Veuillez vérifier votre connexion ou réduire la taille de l'image/PDF.";
      }
      setError(friendly);
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    if (isScanning || isSaving) return;
    setFile(null);
    setError(null);
    setSuccessMessage(null);
    setStep("upload");
    setLignes([]);
    onClose();
  };

  function updateLine(index: number, patch: Partial<ExtractedLine>) {
    setLignes((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLignes((prev) => [...prev, { description: "", quantite: 1, prix_unitaire: 0 }]);
  }

  function removeLine(index: number) {
    setLignes((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  const sousTotal = lignes.reduce((sum, l) => sum + (l.quantite * l.prix_unitaire), 0);
  const tva = sousTotal * 0.2;
  const totalTtc = sousTotal + tva;

  const handleConfirm = async () => {
    if (!clientName.trim()) {
      setError("Veuillez renseigner le nom du client.");
      return;
    }
    
    setIsSaving(true);
    setError(null);

    try {
      const endpoint = targetType === "devis" ? "/api/quotations" : "/api/invoices";
      
      const payload: any = {
        client_name: clientName,
        client: clientName,
        status: "Brouillon",
        statut: "Brouillon",
        date: docDate,
        dateEmission: docDate,
        total_amount: totalTtc,
        montant: totalTtc,
        lignes
      };

      if (targetType === "devis") {
        payload.quotation_number = docNumber;
        payload.numero = docNumber;
      } else {
        payload.invoice_number = docNumber;
        payload.numero = docNumber;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Échec de l'enregistrement dans la base de données.");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: targetType } }));
      }
      
      setSuccessMessage(`${targetType === "devis" ? "Devis" : "Facture"} numérisé et enregistré avec succès !`);
      setTimeout(() => {
        handleClose();
      }, 500);

    } catch (err: any) {
      setError(err.message || "Erreur de sauvegarde de l'analyse IA");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Numérisation IA ${targetType === "devis" ? "de Devis" : "de Facture"}`}>
      <FormAlert error={error} onClose={() => setError(null)} title="Erreur lors du traitement" />

      {successMessage ? (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle size={32} />
          </div>
          <p className="text-base font-bold text-white">{successMessage}</p>
        </div>
      ) : step === "upload" ? (
        <div className="flex flex-col gap-4 text-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 ring-1 ring-purple-500/30">
              <FileScan size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Analyse Documentaire Vision IA 2.5</h4>
              <p className="text-[11.5px] text-slate-400">
                Extrait automatiquement les clients, articles, numéros et montants depuis tout PDF ou photo.
              </p>
            </div>
          </div>

          <div 
            onClick={() => !isScanning && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all duration-300 ${
              file && !isScanning ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 bg-slate-900/60 hover:border-purple-500/50 hover:bg-slate-900'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept="image/*,application/pdf"
            />
            
            {isScanning ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-purple-400" size={32} />
                <p className="text-[13.5px] font-bold text-purple-300 animate-pulse">Extraction Gemini 2.5 AI Vision en cours...</p>
                <p className="text-[11px] text-slate-400">Lecture des lignes d'articles et des données financières</p>
              </div>
            ) : file ? (
              <div className="text-center">
                <p className="text-[13.5px] font-bold text-purple-300 truncate max-w-[280px]">
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Cliquez pour modifier le fichier</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-[13.5px] font-semibold text-slate-200">Glissez-déposez votre {targetType === "devis" ? "devis" : "facture"} ici</p>
                <p className="text-[11px] text-slate-400 mt-1">Formats PDF, JPG, PNG acceptés</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
            <button 
              onClick={handleClose}
              disabled={isScanning}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-[12.5px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button 
              onClick={handleScan}
              disabled={isScanning || !file}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-[12.5px] font-bold text-white shadow-lg shadow-purple-600/25 hover:bg-purple-500 active:scale-95 transition-all disabled:opacity-50"
            >
              {isScanning && <Loader2 size={15} className="animate-spin" />}
              Lancer l'IA Vision
            </button>
          </div>
        </div>
      ) : (
        /* Verification & Refinement View */
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 size={15} className="text-purple-400" />
                Vérification & Ajustement des Données IA
              </h4>
              <p className="text-[11.5px] text-slate-400">Vérifiez les données extraites avant d'enregistrer dans la base.</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
              IA Vision 2.5 Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-slate-300">N° {targetType === "devis" ? "Devis" : "Facture"}</label>
              <input
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-[12.5px] font-mono font-bold text-indigo-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-slate-300">Client / Émetteur</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-[12.5px] font-semibold text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-slate-300">Date d'Émission</label>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-[12.5px] text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Line items editor */}
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-purple-400">Articles / Prestations Détectés</span>
              <span className="text-[11.5px] text-slate-400">{lignes.length} article(s)</span>
            </div>

            {lignes.map((l, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-semibold text-slate-400">Ligne #{idx + 1}</span>
                  {lignes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      value={l.description}
                      onChange={(e) => updateLine(idx, { description: e.target.value })}
                      placeholder="Désignation article..."
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-[12px] text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={l.quantite}
                      onChange={(e) => updateLine(idx, { quantite: Number(e.target.value) })}
                      placeholder="Qté"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-[12px] text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={l.prix_unitaire}
                      onChange={(e) => updateLine(idx, { prix_unitaire: Number(e.target.value) })}
                      placeholder="Prix U HT"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-[12px] text-white font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addLine}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-800 py-2 text-[12px] font-semibold text-purple-400 hover:border-purple-500 hover:bg-purple-500/5 transition-all"
            >
              <Plus size={14} /> Ajouter un article
            </button>
          </div>

          {/* Financial summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 space-y-1 text-[12px]">
            <div className="flex justify-between text-slate-400">
              <span>Sous-total HT :</span>
              <span className="font-mono font-bold text-slate-200">{mad(sousTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>TVA (20%) :</span>
              <span className="font-mono text-purple-300">+{mad(tva)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 text-[14px] font-extrabold">
              <span className="text-white">Total TTC Détecté :</span>
              <span className="font-mono text-emerald-400">{mad(totalTtc)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            {scannedDocId && (
              <button
                type="button"
                onClick={() => {
                  if (targetType === "devis") {
                    router.push(`/devis/nouveau?doc_id=${scannedDocId}`);
                  } else {
                    router.push(`/factures?doc_id=${scannedDocId}`);
                  }
                  handleClose();
                }}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2.5 text-[12.5px] font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all active:scale-95"
              >
                ✨ Ouvrir & Pré-remplir le Formulaire
              </button>
            )}

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-[12.5px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-[12.5px] font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                Enregistrer Directement
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
