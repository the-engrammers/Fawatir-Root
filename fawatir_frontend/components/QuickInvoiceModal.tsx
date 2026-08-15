"use client";

import { useState, useRef } from "react";
import Modal from "./Modal";
import { FileText, Send, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface QuickInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickInvoiceModal({ isOpen, onClose }: QuickInvoiceModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !description) return;

    setIsLoading(true);
    setError(null);

    try {
      if (file) {
        // OCR Path
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
        formData.append("company", companyId); 

        const response = await fetch(`${apiUrl}/api/ai/documents/`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur d'analyse: ${errorText}`);
        }

        const data = await response.json();
        setResult(data);
      } else {
        // NLP Path (Future Text to Invoice)
        console.log("Creating invoice for:", description);
        setTimeout(() => {
          setResult({ success: true, message: "Facture générée à partir du texte !" });
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setDescription("");
    setResult(null);
    setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { handleReset(); onClose(); }} title="Créer une Nouvelle Facture">
      <div className="flex flex-col gap-4">
        
        {/* State: Success/Result */}
        {result ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-4 shadow-sm ring-4 ring-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-sm font-semibold text-ink-900 mb-2">Facture extraite avec succès !</h4>
            <p className="text-xs text-ink-500 mb-6 max-w-[250px]">
              {result.extracted_data 
                ? `Fournisseur: ${result.fournisseur || "Inconnu"} - Montant: ${result.montant_ttc || 0} MAD`
                : result.message}
            </p>
            <button
              onClick={() => { handleReset(); onClose(); }}
              className="rounded-full bg-ink-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-ink-800 transition-all shadow-sm active:scale-95"
            >
              Voir la facture
            </button>
          </div>
        ) : (
          /* State: Form */
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-ai text-white shadow-glow">
              <FileText size={20} />
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-ink-900 mb-1">Que voulez-vous facturer ?</h4>
              <p className="text-[11px] text-ink-500 mb-4 leading-relaxed">
                Décrivez la transaction ou <strong>uploadez une image (Reçu/Facture)</strong> pour que notre IA OCR l'extraie automatiquement.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-[11px] text-red-600 font-medium">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Image Upload Zone */}
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
                  accept="image/jpeg, image/png, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                      setDescription("");
                    }
                  }}
                />
                <div className={`flex h-10 w-10 items-center justify-center rounded-full mb-3 shadow-sm ${file ? 'bg-brass text-white' : 'bg-white text-ink-400 border border-ink-100'}`}>
                  {file ? <CheckCircle2 size={18} /> : <Upload size={18} />}
                </div>
                <p className="text-[12px] font-medium text-ink-700">
                  {file ? file.name : "Scanner un document (Image)"}
                </p>
                {!file && <p className="text-[10px] text-ink-400 mt-1">PNG, JPG, WEBP acceptés</p>}
              </div>

              <div className="flex items-center gap-4 py-1">
                <div className="h-px flex-1 bg-ink-200/60"></div>
                <span className="text-[10px] font-bold text-ink-300 uppercase tracking-wider">OU</span>
                <div className="h-px flex-1 bg-ink-200/60"></div>
              </div>

              {/* Text Area */}
              <textarea
                className="w-full rounded-xl border border-ink-200 bg-paper py-3 px-4 text-[12px] text-ink-800 placeholder-ink-400 focus:border-brass focus:ring-4 focus:ring-brass/10 focus:outline-none transition-all shadow-sm"
                rows={3}
                placeholder="Ex: 5 ordinateurs portables HP à 4500 MAD chacun..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setFile(null);
                }}
              />
              
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="rounded-full px-5 py-2 text-[12px] font-semibold text-ink-600 hover:text-ink-900 hover:bg-ink-100 active:scale-95 transition-all duration-300 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading || (!file && !description)}
                  className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-ink-900 px-6 py-2.5 text-[12px] font-semibold text-white hover:bg-ink-800 hover:shadow-lg active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Analyse en cours (~30s)...
                    </>
                  ) : (
                    <>
                      <Send size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> 
                      Générer avec l'IA
                    </>
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
