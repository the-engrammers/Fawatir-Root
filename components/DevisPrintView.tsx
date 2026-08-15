"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { mad } from "@/lib/format";

export default function DevisPrintView({ id }: { id: string }) {
  const [devis, setDevis] = useState<any>(null);

  useEffect(() => {
    // Dynamic fetch
    fetch("/api/quotations")
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || []);
        const found = list.find((d: any) => d.id === id || d.quotation_number === id);
        setDevis(found);
        setTimeout(() => window.print(), 500);
      })
      .catch(() => {
        setDevis(null);
        setTimeout(() => window.print(), 500);
      });
  }, [id]);

  if (!devis) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-400" size={32} /></div>;

  const lignes = devis.lignes || [];
  const sousTotal = lignes.reduce((sum: any, l: any) => sum + (l.quantite || l.qte || 1) * (l.prix_unitaire || l.prix || 0), 0);
  const taxe = sousTotal * 0.2;
  const total = sousTotal + taxe;

  return (
    <div className="bg-white text-black min-h-screen p-10 font-sans">
      <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">DEVIS</h1>
          <p className="text-gray-500 mt-1">{devis.quotation_number || devis.id}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-800">Mon Entreprise SARL</p>
          <p className="text-sm text-gray-500">123 Avenue Mohammed V</p>
          <p className="text-sm text-gray-500">Casablanca, Maroc</p>
        </div>
      </div>

      <div className="flex justify-between mb-10">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Pour</p>
          <p className="font-bold text-gray-800 text-lg">{devis.client_name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Détails</p>
          <p><span className="text-gray-500">Date:</span> <span className="font-medium">{devis.date}</span></p>
          <p><span className="text-gray-500">Statut:</span> <span className="font-medium">{devis.status || devis.statut}</span></p>
        </div>
      </div>

      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="border-b-2 border-gray-800 text-gray-800">
            <th className="py-3 font-semibold w-1/2">Description</th>
            <th className="py-3 font-semibold text-right">Qté</th>
            <th className="py-3 font-semibold text-right">Prix Unitaire</th>
            <th className="py-3 font-semibold text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((l: any, i: number) => {
            const q = l.quantite || l.qte || 1;
            const p = l.prix_unitaire || l.prix || 0;
            return (
              <tr key={i} className="border-b border-gray-200">
                <td className="py-4 text-gray-800">{l.description || l.article || "Article"}</td>
                <td className="py-4 text-right text-gray-600">{q}</td>
                <td className="py-4 text-right text-gray-600">{mad(p)}</td>
                <td className="py-4 text-right font-medium text-gray-900">{mad(q * p)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Sous-total</span>
            <span>{mad(sousTotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>TVA (20%)</span>
            <span>{mad(taxe)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 border-gray-800 pt-3 mt-3">
            <span>Total TTC</span>
            <span>{mad(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
