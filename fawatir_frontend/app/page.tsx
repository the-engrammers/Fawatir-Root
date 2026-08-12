"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Plus, FileText, RefreshCcw, TrendingUp, ArrowRight } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import QuickInvoiceModal from "@/components/QuickInvoiceModal";
import { mad, statusTone } from "@/lib/format";
import {
  kpis,
  revenuMensuel,
  repartitionStatuts,
  facturesRecentes,
  meilleurClient,
  activiteRecente,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    const timer = setTimeout(() => setIsGenerating(false), 2000);
    return () => clearTimeout(timer);
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-[32px] font-semibold tracking-tight text-ink-900 leading-none">
            Aperçu financier
          </h1>
          <p className="mt-2 text-[14px] text-ink-600 max-w-lg">
            Bienvenue sur votre espace de facturation intelligent. Une vue claire et dégagée sur la santé de votre entreprise.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-[14px] font-semibold text-white shadow-spatial hover:bg-ink-800 hover:-translate-y-1 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] active:scale-95 transition-all duration-500"
        >
          <Plus size={16} /> Créer une facture
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-5 auto-rows-min">
        {/* Bento: WhatsApp Hero (col-span-4) */}
        <div className="rounded-super bg-gradient-ai col-span-1 md:col-span-4 lg:col-span-4 p-1 shadow-spatial group flex flex-col sm:flex-row overflow-hidden relative transition-transform duration-500 hover:-translate-y-2">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10 p-8 flex flex-col justify-center flex-1 bg-white/10 backdrop-blur-3xl rounded-[28px] border border-white/20 m-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md mb-5 shadow-xl border border-white/30">
              <MessageCircle size={24} />
            </div>
            <h2 className="font-display text-[26px] font-semibold text-white mb-2 leading-tight">
              Facturez depuis WhatsApp.
            </h2>
            <p className="text-[14px] text-white/80 max-w-sm mb-6 leading-relaxed">
              Envoyez un simple message vocal, notre IA génère un PDF professionnel et l'envoie à votre client instantanément.
            </p>
            <button
              type="button"
              onClick={() => setIsWhatsAppOpen(true)}
              className="self-start rounded-full bg-white/90 backdrop-blur-md px-6 py-2.5 text-[14px] font-bold text-brass-dark shadow-xl hover:bg-white hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300"
            >
              Connecter WhatsApp
            </button>
          </div>
        </div>

        {/* Bento: Total Revenue (col-span-2) */}
        <div className="rounded-super bg-white/50 backdrop-blur-2xl border border-white/60 p-6 shadow-spatial col-span-1 md:col-span-2 lg:col-span-2 flex flex-col justify-between group transition-transform duration-500 hover:-translate-y-2">
          <div>
            <p className="text-[13px] font-bold text-ink-400 uppercase tracking-widest">Revenu total</p>
            <p className="font-display mt-3 text-[42px] font-medium tracking-tight text-ink-900 leading-none group-hover:scale-105 transition-transform origin-left duration-500">
              {mad(kpis?.revenuTotal ?? 0)}
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span className="flex items-center gap-1 rounded-full bg-status-successBg px-2.5 py-1 text-[13px] font-semibold text-status-success border border-status-success/20">
              <TrendingUp size={14} /> +{kpis?.revenuVariation ?? 0}%
            </span>
            <span className="text-[12px] font-medium text-ink-400">vs mois dernier</span>
          </div>
        </div>

        {/* Bento: Recovery Rate (col-span-2) */}
        <div className="rounded-super bg-white/50 backdrop-blur-2xl border border-white/60 p-6 shadow-spatial col-span-1 md:col-span-2 lg:col-span-2 transition-transform duration-500 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-5">
            <p className="text-[13px] font-bold text-ink-400 uppercase tracking-widest">Recouvrement</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-brass border border-white/80">
              <RefreshCcw size={18} />
            </div>
          </div>
          <p className="font-display text-[32px] font-medium tracking-tight text-ink-900 mb-4">
            {kpis?.tauxRecouvrement ?? 0}%
          </p>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/60 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-ai shadow-glow"
              style={{ width: `${Math.min(Math.max(kpis?.tauxRecouvrement ?? 0, 0), 100)}%` }}
            />
          </div>
          <p className="mt-3 text-[13px] text-ink-500 font-medium">
            <strong className="font-semibold text-ink-900">{kpis?.facturesPayeesCount ?? 0}</strong> payées sur {kpis?.facturesTotalCount ?? 0}
          </p>
        </div>

        {/* Bento: Average Invoice (col-span-1) */}
        <div className="rounded-super bg-white/50 backdrop-blur-2xl border border-white/60 p-6 shadow-spatial col-span-1 md:col-span-1 lg:col-span-1 flex flex-col justify-center transition-transform duration-500 hover:-translate-y-1">
          <p className="text-[12px] font-bold text-ink-400 uppercase tracking-widest mb-2">Panier Moyen</p>
          <p className="font-display text-[26px] font-medium tracking-tight text-ink-900">
            {mad(kpis?.factureMoyenne ?? 0).replace(".00", "")}
          </p>
        </div>

        {/* Bento: Best Client (col-span-1) */}
        <div className="rounded-super bg-white/50 backdrop-blur-2xl border border-white/60 p-5 shadow-spatial col-span-1 md:col-span-1 lg:col-span-1 flex flex-col justify-center items-center text-center transition-transform duration-500 hover:-translate-y-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-brass to-pink-500 text-[16px] font-bold text-white mb-3 shadow-xl border-2 border-white">
            {meilleurClient?.nom?.charAt(0) ?? "?"}
          </div>
          <p className="text-[14px] font-bold text-ink-900 line-clamp-1">{meilleurClient?.nom ?? "N/A"}</p>
          <p className="text-[12px] font-medium text-ink-500 mt-1">{mad(meilleurClient?.montant ?? 0)}</p>
        </div>

        {/* Bento: Recent Activity (col-span-2) */}
        <div className="rounded-super bg-gradient-to-br from-white/80 to-status-infoBg/50 backdrop-blur-2xl border border-white/60 p-6 shadow-spatial col-span-1 md:col-span-2 lg:col-span-2 flex flex-col justify-center transition-transform duration-500 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl text-status-info border border-white/80">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-[12px] font-bold text-ink-400 uppercase tracking-widest">Activité Récente</p>
              <p className="font-display text-[26px] font-semibold text-ink-900 mt-1 leading-none">
                {activiteRecente?.count ?? 0} actions
              </p>
              <p className="text-[13px] font-medium text-ink-500 mt-1.5">{activiteRecente?.periode ?? ""}</p>
            </div>
          </div>
        </div>

        {/* Bento: Revenue Chart (col-span-4) */}
        <div className="rounded-super bg-white/50 backdrop-blur-2xl border border-white/60 p-6 shadow-spatial col-span-1 md:col-span-4 lg:col-span-4 flex flex-col transition-transform duration-500 hover:-translate-y-1">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-[18px] font-semibold text-ink-900">Croissance Mensuelle</p>
              <p className="text-[13px] font-medium text-ink-500 mt-1">Évolution des encaissements sur 6 mois</p>
            </div>
            <button
              type="button"
              onClick={handleGenerateReport}
              className="rounded-full bg-white border border-white/80 px-5 py-2 text-[13px] font-bold text-ink-800 hover:bg-ink-900 hover:text-white shadow-sm hover:shadow-xl active:scale-95 transition-all duration-300 w-[140px] flex justify-center"
            >
              {isGenerating ? (
                <div className="h-4 w-4 rounded-full border-2 border-ink-400 border-t-white animate-spin" />
              ) : (
                "Voir le rapport"
              )}
            </button>
          </div>
          <div className="flex-1 mt-auto px-2">
            <RevenueSparkline />
          </div>
        </div>

        {/* Bento: Status Breakdown (col-span-2) */}
        <div className="rounded-super bg-white/50 backdrop-blur-2xl border border-white/60 p-6 shadow-spatial col-span-1 md:col-span-2 lg:col-span-2 transition-transform duration-500 hover:-translate-y-1">
          <p className="mb-6 text-[18px] font-semibold text-ink-900">Répartition</p>
          <div className="space-y-4">
            {(repartitionStatuts ?? []).map((s) => (
              <div key={s.label} className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/60 hover:shadow-sm transition-all duration-300 cursor-default">
                <div className="flex items-center gap-3">
                  <div
                    className="h-3.5 w-3.5 rounded-full shadow-inner ring-2 ring-white"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-[14px] font-semibold text-ink-700 group-hover:text-ink-900 transition-colors">
                    {s.label}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[14px] font-semibold text-ink-900">{s.value}</p>
                  <p className="text-[11px] font-medium text-ink-500">{s.pct}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bento: Recent Invoices Table (col-span-6) */}
        <div className="rounded-super bg-white/50 backdrop-blur-2xl border border-white/60 p-6 shadow-spatial col-span-1 md:col-span-4 lg:col-span-6 overflow-hidden">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-[18px] font-semibold text-ink-900">Dernières Factures</p>
            <Link href="/factures" className="group flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[13px] font-bold text-brass shadow-sm hover:bg-brass hover:text-white transition-all duration-300">
              Voir tout <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-ink-200/40">
                  <th className="pb-3 pt-2 text-[11px] font-bold uppercase tracking-widest text-ink-400">N°</th>
                  <th className="pb-3 pt-2 text-[11px] font-bold uppercase tracking-widest text-ink-400">Client</th>
                  <th className="pb-3 pt-2 text-[11px] font-bold uppercase tracking-widest text-ink-400">Date</th>
                  <th className="pb-3 pt-2 text-[11px] font-bold uppercase tracking-widest text-ink-400">Statut</th>
                  <th className="pb-3 pt-2 text-[11px] font-bold uppercase tracking-widest text-ink-400 text-right pr-4">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200/20">
                {(facturesRecentes ?? []).map((f) => (
                  <tr
                    key={f.numero}
                    onClick={() => setIsModalOpen(true)}
                    className="group hover:bg-white/80 transition-colors cursor-pointer"
                  >
                    <td className="py-4 text-[14px] font-bold text-ink-900 rounded-l-2xl pl-3">{f.numero}</td>
                    <td className="py-4 text-[14px] font-semibold text-ink-700">{f.client}</td>
                    <td className="py-4 text-[13px] font-medium text-ink-500">{f.date}</td>
                    <td className="py-4">
                      <StatusChip tone={statusTone(f.statut)}>{f.statut}</StatusChip>
                    </td>
                    <td className="font-mono py-4 text-right text-[15px] font-bold text-ink-900 pr-3 rounded-r-2xl">
                      {mad(f.montant)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <QuickInvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <WhatsAppModal isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} />
    </div>
  );
}

function RevenueSparkline() {
  const data = revenuMensuel ?? [];
  const max = data.length > 0 ? Math.max(...data.map((d) => d.revenu)) : 1;

  return (
    <div className="flex h-48 items-end gap-4 w-full">
      {data.map((d) => (
        <div key={d.mois} className="group relative flex flex-1 flex-col items-center gap-3">
          <div
            className="w-full rounded-t-xl bg-gradient-ai opacity-70 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:shadow-glow group-hover:-translate-y-1"
            style={{ height: `${(d.revenu / max) * 100}%` }}
          />
          <span className="text-[12px] font-medium text-ink-400 group-hover:text-ink-900 transition-colors">{d.mois}</span>

          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-ink-900 text-white text-[12px] font-semibold px-2 py-1 rounded pointer-events-none whitespace-nowrap shadow-xl">
            {mad(d.revenu)}
          </div>
        </div>
      ))}
    </div>
  );
}

function WhatsAppModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-card bg-paper-card shadow-bento backdrop-blur-2xl border border-white/80 p-6 text-center animate-in zoom-in-95">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-lg shadow-[#25D366]/30">
          <MessageCircle size={32} />
        </div>
        <h3 className="font-display text-[20px] font-semibold text-ink-900 mb-2">Connecter WhatsApp</h3>
        <p className="text-[13px] text-ink-600 mb-6">
          Scannez le code QR ci-dessous avec votre application WhatsApp pour lier votre compte professionnel.
        </p>
        <div className="mx-auto h-48 w-48 rounded-xl bg-white p-2 shadow-inner border border-ink-200 flex items-center justify-center" aria-label="Code QR de connexion WhatsApp">
          <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full p-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className={`rounded-sm ${i % 2 === 0 || i % 3 === 0 ? "bg-ink-900" : "bg-transparent"} ${i === 0 || i === 3 || i === 12 ? "bg-ink-900 ring-2 ring-ink-900 ring-offset-2" : ""}`} />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-ink-100 py-2.5 text-[13.5px] font-semibold text-ink-900 hover:bg-ink-200 active:scale-95 transition-all"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
