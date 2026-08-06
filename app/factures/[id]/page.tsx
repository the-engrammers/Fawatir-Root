"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil, Download, CheckCircle2, MessageSquare, MoreHorizontal } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import { mad, statusTone } from "@/lib/format";
import { facturesList, clientsFull } from "@/lib/mock-data";
import WhatsAppSendModal from "@/components/WhatsAppSendModal";

export default function FactureDetailPage({ params }: { params: { id: string } }) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const facture = facturesList.find((f) => f.id === params.id);
  if (!facture) notFound();

  const clientInfo = clientsFull.find((c) => c.nom === facture.client || c.id === facture.clientId);

  const sousTotal = facture.lignes.reduce((sum, l) => sum + l.qte * l.prix, 0);
  const remiseAmount = sousTotal * (facture.remise / 100);
  const taxe = (sousTotal - remiseAmount) * (facture.taxePct / 100);
  const total = sousTotal - remiseAmount + taxe;

  return (
    <div className="mx-auto max-w-[1100px] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/factures"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white transition-all"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[22px] font-bold text-white tracking-tight">
                {facture.numero}
              </h1>
              <StatusChip tone={statusTone(facture.statut)}>{facture.statut}</StatusChip>
            </div>
            <p className="text-[12.5px] text-slate-400">Créée le {facture.dateEmission}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowWhatsApp(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-[12.5px] font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
          >
            <MessageSquare size={15} /> Envoyer WhatsApp
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-[12.5px] font-semibold text-slate-200 hover:bg-slate-800 transition-all"
          >
            <Download size={15} /> Télécharger PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="ledger-card">
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400">Client</p>
          <p className="mt-1 text-[15px] font-bold text-white">{facture.client}</p>
          {clientInfo?.telephone && (
            <p className="text-[12px] text-emerald-400 font-mono mt-0.5">📞 {clientInfo.telephone}</p>
          )}
        </div>
        <div className="ledger-card">
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400">Dates</p>
          <div className="mt-1 flex justify-between text-[13px] text-slate-300">
            <span>Émise :</span>
            <span className="font-semibold text-white">{facture.dateEmission}</span>
          </div>
          <div className="flex justify-between text-[13px] text-slate-300">
            <span>Échéance :</span>
            <span className="font-semibold text-white">{facture.dateEcheance}</span>
          </div>
        </div>
        <div className="ledger-card">
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400">Total à payer</p>
          <p className="figure mt-1 text-[22px] font-extrabold text-white">{mad(total)}</p>
        </div>
      </div>

      <div className="ledger-card flex items-center justify-between">
        <p className="text-[12px] font-bold uppercase tracking-wide text-slate-400">
          Coordonnées bancaires
        </p>
        <p className="figure text-[13px] font-mono font-bold text-slate-200">007 780 0001234567890123 45</p>
      </div>

      <div className="ledger-card">
        <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-3">
          <p className="text-[12px] font-bold uppercase tracking-wide text-slate-400">
            Lignes de facture
          </p>
          <span className="text-[12px] text-slate-400">{facture.lignes.length} article(s)</span>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-slate-800 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="pb-2">#</th>
              <th className="pb-2">Article</th>
              <th className="pb-2 text-right">Qté</th>
              <th className="pb-2 text-right">Prix U</th>
              <th className="pb-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {facture.lignes.map((l, idx) => (
              <tr key={idx}>
                <td className="py-2.5 text-slate-500 font-mono">{idx + 1}</td>
                <td className="py-2.5 text-slate-200 font-semibold">{l.article}</td>
                <td className="figure py-2.5 text-right text-slate-300">{l.qte}</td>
                <td className="figure py-2.5 text-right text-slate-300">{mad(l.prix)}</td>
                <td className="figure py-2.5 text-right font-bold text-white">
                  {mad(l.qte * l.prix)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-4 w-full max-w-xs space-y-2 text-[13px] border-t border-slate-800 pt-3">
          <div className="flex justify-between text-slate-400">
            <span>Sous-total</span>
            <span className="figure font-mono">{mad(sousTotal)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>TVA ({facture.taxePct}%)</span>
            <span className="figure font-mono">{mad(taxe)}</span>
          </div>
          {facture.remise > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Remise</span>
              <span className="figure font-mono">-{mad(remiseAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-800 pt-2 text-[16px] font-extrabold text-white">
            <span>Total TTC</span>
            <span className="figure font-mono text-indigo-400">{mad(total)}</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      <WhatsAppSendModal
        isOpen={showWhatsApp}
        onClose={() => setShowWhatsApp(false)}
        documentType={facture.statut === "En retard" ? "relance" : "facture"}
        recipientName={facture.client}
        recipientPhone={clientInfo?.telephone || ""}
        documentNumber={facture.numero}
        amount={total}
        dueDate={facture.dateEcheance}
      />
    </div>
  );
}
