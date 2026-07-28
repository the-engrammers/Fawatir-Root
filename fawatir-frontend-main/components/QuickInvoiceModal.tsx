"use client";

import { useState } from "react";
import Modal from "./Modal";
import { FileText, Send } from "lucide-react";

interface QuickInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickInvoiceModal({ isOpen, onClose }: QuickInvoiceModalProps) {
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for actual AI processing or routing logic
    console.log("Creating invoice for:", description);
    onClose();
    setDescription("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une Nouvelle Facture">
      <div className="flex flex-col gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-ai text-white shadow-glow">
          <FileText size={24} />
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-ink-900 mb-1">Que voulez-vous facturer ?</h4>
          <p className="text-xs text-ink-400 mb-4">
            Décrivez simplement ce que vous avez vendu. Notre IA s'occupe de formater la facture pour vous.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            className="w-full rounded-md border border-ink-200 bg-paper py-3 px-3 text-sm text-ink-800 placeholder-ink-400 focus:border-brass focus:outline-none transition-colors"
            rows={4}
            placeholder="Ex: 5 ordinateurs portables HP à 4500 MAD chacun pour le client Atlas Corp..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-ink-600 hover:text-ink-900 hover:bg-ink-100 active:scale-95 transition-all duration-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full bg-ink-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-ink-800 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all duration-300"
            >
              <Send size={16} /> Générer avec l'IA
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
