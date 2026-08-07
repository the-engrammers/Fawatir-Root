"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { FileScan, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import FormAlert from "./FormAlert";

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "devis" | "factures";
}

export default function ScannerModal({ isOpen, onClose, targetType }: ScannerModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "verify">("upload");
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
      setError("Veuillez sélectionner un fichier (PDF ou image).");
      return;
    }
    
    setIsScanning(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      
      let companyId = null;
      const compRes = await fetch(`/api/companies/`);
      const compData = await compRes.json();
      const compList = Array.isArray(compData) ? compData : (compData.results || []);
      if (compList.length > 0) {
        companyId = compList[0].id;
      } else {
        const createRes = await fetch(`/api/companies/`, {
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
      formData.append("doc_type", targetType === "devis" ? "other" : "invoice");
      
      const response = await fetch(`/api/ai/documents/`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors de l'analyse : ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.status === "failed") {
        throw new Error(data.error_message || "Erreur d'extraction OCR.");
      }
      
      setExtractedData(data.extracted_data);
      setStep("verify");
      setIsScanning(false);
      
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    if (isScanning) return;
    setFile(null);
    setError(null);
    setSuccessMessage(null);
    setStep("upload");
    setExtractedData(null);
    onClose();
  };
  const handleConfirm = async () => {
    if (!extractedData) return;
    setIsSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      
      let companyId = null;
      const compRes = await fetch(`/api/companies`);
      const compData = await compRes.json();
      const compList = Array.isArray(compData) ? compData : (compData.results || []);
      if (compList.length > 0) companyId = compList[0].id;
      else {
        const createRes = await fetch(`/api/companies`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Fawatir Demo', email: 'demo@fawatir.ma' })
        });
        const created = await createRes.json();
        companyId = created.id;
      }
      
      let clientId = null;
      const clientName = extractedData.fournisseur || extractedData.client || "Client Inconnu";
      const clientsRes = await fetch(`/api/clients?company=${companyId}`);
      const clientsData = await clientsRes.json();
      const clientsList = Array.isArray(clientsData) ? clientsData : (clientsData.results || []);
      const existingClient = clientsList.find((c: any) => c.company_name === clientName);
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const createClientRes = await fetch(`/api/clients`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company: companyId, company_name: clientName, customer_code: `CL-${Math.floor(Math.random()*10000)}` })
        });
        const createdClient = await createClientRes.json();
        clientId = createdClient.id;
      }
      
      const endpoint = targetType === "devis" ? "/api/quotations" : "/api/invoices";
      const payload: any = {
        company: companyId,
        client: clientId,
        client_name: clientName, // FIX: Pass the actual extracted name to the DB
        status: "Brouillon",
        total_amount: extractedData.montant_ttc || 0,
        date: extractedData.date || new Date().toISOString().split("T")[0],
        lignes: extractedData.lignes || []
      };
      if (targetType === "devis") {
        payload.quotation_number = extractedData.numero_facture || extractedData.numero || `DEV-${Math.floor(Math.random()*10000)}`;
      } else {
        payload.invoice_number = extractedData.numero_facture || extractedData.numero || `FAC-${Math.floor(Math.random()*10000)}`;
      }
      
      const saveRes = await fetch(`${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!saveRes.ok) {
        throw new Error("Erreur lors de la sauvegarde principale.");
      }
      
      const savedDoc = await saveRes.json();
      const savedId = savedDoc.id;
      
      if (extractedData.lignes && Array.isArray(extractedData.lignes)) {
        for (const ligne of extractedData.lignes) {
          const desc = ligne.description || "Article";
          let productId = null;
          try {
            const prodRes = await fetch(`/api/products?search=${encodeURIComponent(desc)}`);
            const prodData = await prodRes.json();
            const prodList = Array.isArray(prodData) ? prodData : (prodData.results || []);
            const existingProd = prodList.find((p: any) => p.name === desc);
            if (existingProd) {
              productId = existingProd.id;
            } else {
              const createProdRes = await fetch(`/api/products`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company: companyId, name: desc, selling_price: ligne.prix_unitaire || 0 })
              });
              const createdProd = await createProdRes.json();
              productId = createdProd.id;
            }
            
            const itemEndpoint = targetType === "devis" ? "/api/quotation-items" : "/api/invoice-items";
            const itemPayload: any = {
              product: productId,
              description: desc,
              quantity: ligne.quantite || 1,
              unit_price: ligne.prix_unitaire || 0,
              line_total: ligne.montant || ((ligne.quantite || 1) * (ligne.prix_unitaire || 0))
            };
            if (targetType === "devis") {
              itemPayload.quotation = savedId;
            } else {
              itemPayload.invoice = savedId;
            }
            
            await fetch(`${itemEndpoint}`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(itemPayload)
            });
          } catch (e) {
            console.error("Erreur ajout ligne:", e);
          }
        }
      }
      
      setSuccessMessage(`${targetType === "devis" ? "Devis" : "Facture"} enregistré avec succès !`);
      setTimeout(() => {
        handleClose();
        window.dispatchEvent(new CustomEvent("dataUpdated"));
      }, 1200);
    } catch (err: any) {
      setError("Erreur de sauvegarde: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Numériser ${targetType === "devis" ? "un devis" : "un document"}`}>
      <FormAlert error={error} onClose={() => setError(null)} title="Erreur lors du traitement" />

      {step === "upload" ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 ring-1 ring-purple-500/30">
              <FileScan size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Numérisation par IA</h4>
              <p className="text-[11.5px] text-slate-400">
                Extraction automatique des clients, articles et montants depuis PDF/Images.
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
                <Loader2 className="animate-spin text-purple-400" size={28} />
                <p className="text-[13px] font-semibold text-purple-300 animate-pulse">Analyse du document en cours...</p>
              </div>
            ) : file ? (
              <div className="text-center">
                <p className="text-[13px] font-bold text-purple-300 truncate max-w-[260px]">
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Cliquez pour modifier le fichier</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-[13px] font-semibold text-slate-200">Glissez-déposez votre document ici</p>
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
              Lancer l'IA
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-left space-y-3">
            <h4 className="text-sm font-bold text-slate-100">Vérification des données extraites</h4>
            
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-[13px]">
              <div>
                <span className="block text-[11px] font-semibold uppercase text-slate-400">Fournisseur / Émetteur</span>
                <span className="font-bold text-slate-100">{extractedData.fournisseur || "Non détecté"}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] font-semibold uppercase text-slate-400">Montant HT</span>
                  <span className="font-bold text-slate-100">{extractedData.montant_ht || "0"} MAD</span>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold uppercase text-slate-400">Montant TTC</span>
                  <span className="font-bold text-emerald-400">{extractedData.montant_ttc || "0"} MAD</span>
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-semibold uppercase text-slate-400">Articles détectés</span>
                <span className="font-bold text-slate-100">
                  {extractedData.lignes ? extractedData.lignes.length : (extractedData.line_items ? extractedData.line_items.length : 0)} article(s)
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
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
              Confirmer l'ajout
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
