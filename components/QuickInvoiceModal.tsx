"use client";

import { useState, useRef } from "react";
import Modal from "./Modal";
import FormAlert from "./FormAlert";
import { FileText, Send, Upload, Loader2, CheckCircle2 } from "lucide-react";

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
      setError(err.message || "Une erreur est survenue lors du traitement");
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
    <Modal isOpen={isOpen} onClose={() => { handleReset(); onClose(); }} title="Créer une Facture Rapide">
      <div className="flex flex-col gap-4">
        
        {/* State: Success/Result */}
        {result ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-4 shadow-sm ring-4 ring-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-base font-bold text-slate-100 mb-2">Facture extraite avec succès !</h4>
            <p className="text-xs text-slate-400 mb-6 max-w-[280px]">
              {result.extracted_data 
                ? `Fournisseur: ${result.fournisseur || "Inconnu"} - Montant: ${result.montant_ttc || 0} MAD`
                : result.message}
            </p>
            <button
              onClick={() => { handleReset(); onClose(); }}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
            >
              Fermer et consulter
            </button>
          </div>
        ) : (
          /* State: Form */
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Nouvelle Facture Intelligente</h4>
                <p className="text-[11.5px] text-slate-400">
                  Importez un reçu/facture ou saisissez une description rapide.
                </p>
              </div>
            </div>

            <FormAlert error={error} onClose={() => setError(null)} title="Erreur lors de l'analyse" />

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Image Upload Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 cursor-pointer transition-all duration-300 ${
                  file ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-900/60 hover:border-indigo-500/50 hover:bg-slate-900"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg, image/png, image/webp, application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]);
                      setDescription("");
                      setError(null);
                    }
                  }}
                />
                <div className={`flex h-10 w-10 items-center justify-center rounded-full mb-3 shadow-sm ${file ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {file ? <CheckCircle2 size={18} /> : <Upload size={18} />}
                </div>
                <p className="text-[12.5px] font-semibold text-slate-200">
                  {file ? file.name : "Scanner un document (Image/PDF)"}
                </p>
                {!file && <p className="text-[10.5px] text-slate-400 mt-1">PNG, JPG, PDF acceptés</p>}
              </div>

              <div className="flex items-center gap-4 py-1">
                <div className="h-px flex-1 bg-slate-800"></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">OU</span>
                <div className="h-px flex-1 bg-slate-800"></div>
              </div>

              {/* Text Area */}
              <textarea
                className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 px-4 text-[12.5px] text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-sm"
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
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-[12.5px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading || (!file && !description)}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-[12.5px] font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> 
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
