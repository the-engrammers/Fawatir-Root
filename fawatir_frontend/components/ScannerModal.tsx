"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { FileScan, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
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
      formData.append("doc_type", targetType === "devis" ? "other" : "invoice");
      
      const response = await fetch(`${apiUrl}/api/ai/documents/`, {
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
    setStep("upload");
    setExtractedData(null);
    onClose();
  };
  const handleConfirm = async () => {
    if (!extractedData) return;
    setIsSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      let companyId = null;
      const compRes = await fetch(`${apiUrl}/api/companies/`);
      const compData = await compRes.json();
      const compList = Array.isArray(compData) ? compData : (compData.results || []);
      if (compList.length > 0) companyId = compList[0].id;
      else {
        const createRes = await fetch(`${apiUrl}/api/companies/`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Fawatir Demo', email: 'demo@fawatir.ma' })
        });
        const created = await createRes.json();
        companyId = created.id;
      }
      
      let clientId = null;
      const clientName = extractedData.fournisseur || extractedData.client || "Client Inconnu";
      const clientsRes = await fetch(`${apiUrl}/api/clients/?company=${companyId}`);
      const clientsData = await clientsRes.json();
      const clientsList = Array.isArray(clientsData) ? clientsData : (clientsData.results || []);
      const existingClient = clientsList.find((c: any) => c.company_name === clientName);
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const createClientRes = await fetch(`${apiUrl}/api/clients/`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company: companyId, company_name: clientName, customer_code: `CL-${Math.floor(Math.random()*10000)}` })
        });
        const createdClient = await createClientRes.json();
        clientId = createdClient.id;
      }
      
      const endpoint = targetType === "devis" ? "/api/quotations/" : "/api/invoices/";
      const payload: any = {
        company: companyId,
        client: clientId,
        status: "Brouillon",
        total_amount: extractedData.montant_ttc || 0,
      };
      if (targetType === "devis") {
        payload.quotation_number = extractedData.numero_facture || extractedData.numero || `DEV-${Math.floor(Math.random()*10000)}`;
      } else {
        payload.invoice_number = extractedData.numero_facture || extractedData.numero || `FAC-${Math.floor(Math.random()*10000)}`;
      }
      
      const saveRes = await fetch(`${apiUrl}${endpoint}`, {
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
            const prodRes = await fetch(`${apiUrl}/api/products/?search=${encodeURIComponent(desc)}`);
            const prodData = await prodRes.json();
            const prodList = Array.isArray(prodData) ? prodData : (prodData.results || []);
            const existingProd = prodList.find((p: any) => p.name === desc);
            if (existingProd) {
              productId = existingProd.id;
            } else {
              const createProdRes = await fetch(`${apiUrl}/api/products/`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company: companyId, name: desc, selling_price: ligne.prix_unitaire || 0 })
              });
              const createdProd = await createProdRes.json();
              productId = createdProd.id;
            }
            
            const itemEndpoint = targetType === "devis" ? "/api/quotation-items/" : "/api/invoice-items/";
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
            
            await fetch(`${apiUrl}${itemEndpoint}`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(itemPayload)
            });
          } catch (e) {
            console.error("Erreur ajout ligne:", e);
          }
        }
      }
      
      alert(`${targetType === "devis" ? "Devis" : "Facture"} enregistré avec succès !`);
      window.location.reload();
      
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setIsSaving(false);
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity" 
        onClick={handleClose} 
      />
      
      <div className="relative z-10 w-full max-w-md rounded-card bg-paper-card shadow-bento backdrop-blur-3xl border border-white/80 p-8 text-center animate-in zoom-in-95">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-ai text-white shadow-glow">
          <FileScan size={32} />
        </div>
        
        {step === "upload" && (
          <>
            <h3 className="font-display text-[20px] font-semibold text-ink-900 mb-2">Extraction Automatique</h3>
            <p className="text-[13px] text-ink-600 mb-6">
              Déposez un ancien {targetType === "devis" ? "devis" : "document"} (PDF/Image) ici, notre IA extraira automatiquement le client, les articles et les montants.
            </p>
            
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 flex items-start gap-2 text-left">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-[12.5px] text-red-700">{error}</p>
              </div>
            )}
            
            <div 
              onClick={() => !isScanning && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`relative mx-auto h-40 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-colors ${
                file && !isScanning ? 'border-brass bg-brass/10' : 'border-brass/40 bg-brass/5 hover:bg-brass/10'
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
                <>
                  <div className="absolute top-0 w-full h-1 bg-brass animate-scan shadow-[0_0_15px_rgba(156,126,62,0.8)]" />
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-brass-dark" size={24} />
                    <p className="text-[14px] font-semibold text-brass-dark animate-pulse">Analyse du document en cours...</p>
                  </div>
                </>
              ) : file ? (
                <div className="px-4 text-center">
                  <p className="text-[14px] font-semibold text-brass-dark truncate max-w-[250px]">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-ink-500 mt-1">Cliquez pour modifier</p>
                </div>
              ) : (
                <>
                  <p className="text-[13.5px] font-medium text-ink-700">Glissez-déposez votre document ici</p>
                  <p className="text-[11px] text-ink-400 mt-1">ou cliquez pour parcourir</p>
                </>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={handleClose}
                disabled={isScanning}
                className="flex-1 rounded-full bg-ink-100 py-3 text-[13.5px] font-semibold text-ink-700 hover:bg-ink-200 active:scale-95 transition-all disabled:opacity-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleScan}
                disabled={isScanning || !file}
                className="flex-1 rounded-full bg-ink-900 py-3 text-[13.5px] font-semibold text-white hover:bg-ink-800 active:scale-95 transition-all shadow-lg disabled:opacity-50"
              >
                Lancer l'IA
              </button>
            </div>
          </>
        )}

        {step === "verify" && extractedData && (
          <div className="text-left">
            <h3 className="font-display text-[20px] font-semibold text-ink-900 mb-2 text-center">Vérification des données</h3>
            <p className="text-[13px] text-ink-600 mb-6 text-center">
              L'IA a terminé l'extraction. Veuillez vérifier les informations ci-dessous.
            </p>
            
            <div className="space-y-4 rounded-xl border border-ink-200 bg-paper p-4 text-[13.5px]">
              <div>
                <span className="block text-[11px] font-medium uppercase text-ink-400">Fournisseur / Émetteur</span>
                <span className="font-semibold text-ink-900">{extractedData.fournisseur || "Non détecté"}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] font-medium uppercase text-ink-400">Montant HT</span>
                  <span className="font-semibold text-ink-900">{extractedData.montant_ht || "0"} MAD</span>
                </div>
                <div>
                  <span className="block text-[11px] font-medium uppercase text-ink-400">Montant TTC</span>
                  <span className="font-semibold text-ink-900">{extractedData.montant_ttc || "0"} MAD</span>
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-medium uppercase text-ink-400">Articles détectés</span>
                <span className="font-semibold text-ink-900">
                  {extractedData.lignes ? extractedData.lignes.length : (extractedData.line_items ? extractedData.line_items.length : 0)} article(s)
                </span>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="rounded-full px-6 py-2.5 text-[13.5px] font-semibold text-ink-600 hover:bg-ink-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-full bg-brass px-8 py-2.5 text-[13.5px] font-bold text-white hover:bg-brass-dark hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Confirmer l'ajout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
