"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  MessageCircle, 
  Plus, 
  FileText, 
  RefreshCcw, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowRight,
  Sparkles,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Send,
  Zap,
  Filter,
  DollarSign,
  Search,
  Copy,
  ShieldCheck,
  Bot,
  Activity,
  Layers,
  Smartphone,
  History,
  ExternalLink,
  X,
  RotateCcw
} from "lucide-react";
import StatusChip from "@/components/StatusChip";
import QuickInvoiceModal from "@/components/QuickInvoiceModal";
import ScannerModal from "@/components/ScannerModal";
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
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chartTab, setChartTab] = useState<"revenu" | "depenses" | "prevision">("revenu");
  const [period, setPeriod] = useState<"30j" | "90j" | "2026">("30j");
  
  // Interactive AI Terminal State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleRunAiCommand = (cmdText: string) => {
    setAiPrompt(cmdText);
    setIsAiLoading(true);
    setAiResponse(null);

    setTimeout(() => {
      setIsAiLoading(false);
      if (cmdText.includes("Relancer") || cmdText.includes("WhatsApp") || cmdText.includes("retard") || cmdText.includes("impayé")) {
        setAiResponse("✅ Ouverture du module de Relance WhatsApp Pro pour les 3 factures impayées (OCP Group, Royal Air Maroc, Inwi Telecom).");
        setIsWhatsAppOpen(true);
      } else if (cmdText.includes("devis") || cmdText.includes("Maroc Telecom")) {
        setAiResponse("📄 Devis #DEV-2026-088 généré : 'Prestation de Conseil IT' pour Maroc Telecom - Montant : 25 000,00 MAD HT (30 000,00 MAD TTC). Prêt à être envoyé.");
      } else if (cmdText.includes("TVA")) {
        setAiResponse("📊 Déclaration TVA T2 (Avril-Juin 2026) : TVA Collectée (20%) = 42 100 MAD, TVA Déductible = 14 300 MAD. Solde net à reverser = 27 800 MAD.");
      } else {
        setAiResponse(`🤖 Analyse terminée pour "${cmdText}" : Votre santé financière globale est optimale avec un flux de trésorerie positif de +142 500 MAD ce mois.`);
      }
    }, 700);
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1400);
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-8 pb-12 text-slate-100">
      
      {/* High-Tech Executive Command Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Financial OS Command Center</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-[11px] font-bold text-indigo-400 ring-1 ring-indigo-500/30">
              <Activity size={12} className="animate-pulse text-indigo-400" />
              Live Telemetry
            </span>
          </div>
          <p className="text-[13.5px] text-slate-400 font-normal">
            Pilotage financier en temps réel • Facturation, prévisions de trésorerie et automatisation par IA.
          </p>
        </div>

        {/* Action Controls & Time Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Selector Pills */}
          <div className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-slate-800/80 text-[12px] font-semibold">
            {(["30j", "90j", "2026"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === p 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p === "30j" ? "30 Jours" : p === "90j" ? "Trimestre" : "Année 2026"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsScannerModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-[12.5px] font-semibold text-slate-200 shadow-sm hover:bg-slate-800 hover:border-slate-700 active:scale-95 transition-all"
          >
            <Zap size={15} className="text-amber-400" />
            <span>Scan Doc IA</span>
          </button>

          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-[12.5px] font-semibold text-slate-200 shadow-sm hover:bg-slate-800 hover:border-slate-700 active:scale-95 transition-all"
          >
            <Download size={15} className="text-slate-400" />
            <span>{isGenerating ? "Export..." : "Rapport PDF"}</span>
          </button>

          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500 active:scale-95 transition-all ring-1 ring-white/20"
          >
            <Plus size={16} />
            <span>Nouvelle Facture</span>
          </button>
        </div>
      </div>

      {/* 4 High-Tech KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Chiffre d'affaires */}
        <div className="bento-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Chiffre d'Affaires</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="font-mono text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
            {mad(kpis.revenuTotal)}
          </p>
          <div className="mt-3 flex items-center justify-between text-[12px]">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <TrendingUp size={12} /> +{kpis.revenuVariation}%
            </span>
            <span className="text-slate-400">vs M-1</span>
          </div>
        </div>

        {/* KPI 2: Taux de Recouvrement */}
        <div className="bento-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Taux de Recouvrement</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
              <RefreshCcw size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              {kpis.tauxRecouvrement}%
            </p>
            <span className="text-[12px] font-medium text-slate-400">
              {kpis.facturesPayeesCount}/{kpis.facturesTotalCount} payées
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 glow-emerald"
              style={{ width: `${kpis.tauxRecouvrement}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Créances en Attente */}
        <div className="bento-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Factures Impayées</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p className="font-mono text-2xl lg:text-3xl font-extrabold tracking-tight text-amber-300">
            {mad(38500)}
          </p>
          <div className="mt-3 flex items-center justify-between text-[12px]">
            <span className="text-amber-400/90 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              3 factures en retard
            </span>
            <button 
              onClick={() => handleRunAiCommand("Relancer les 3 factures impayées")}
              className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
            >
              Relancer IA
            </button>
          </div>
        </div>

        {/* KPI 4: Trésorerie & Marge */}
        <div className="bento-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trésorerie Disponible</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/30">
              <ShieldCheck size={16} />
            </div>
          </div>
          <p className="font-mono text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
            {mad(324100)}
          </p>
          <p className="mt-3 text-[12px] text-slate-400">
            Marge opérationnelle estimée : <strong className="text-purple-300">74.2%</strong>
          </p>
        </div>

      </div>

      {/* Sleek AI Executive Bar & Quick Actions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Assistant IA Fatourati</h2>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                  ACTIF & SYNCHRONISÉ
                </span>
              </div>
              <p className="text-[12px] text-slate-400">Raccourcis intelligents et automatisation financière en temps réel</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsWhatsAppOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/20 px-3.5 py-2 text-[12px] font-semibold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all shrink-0"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Pro (+212 661-XXXXXX)</span>
            </button>
          </div>
        </div>

        {/* Action Shortcut Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles size={13} className="text-indigo-400" /> Actions Rapides :
          </span>
          {[
            "⚡ Relancer les 3 factures impayées par WhatsApp",
            "📄 Créer devis de 25 000 MAD pour Maroc Telecom",
            "📊 Analyser la déclaration de TVA T2"
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleRunAiCommand(chip)}
              className="rounded-lg bg-slate-800/90 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 border border-slate-700/80 px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-all active:scale-95 text-left"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* AI Output Result Display if triggered */}
        {aiResponse && (
          <div className="mt-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 p-4 text-[13px] leading-relaxed text-indigo-200 animate-in fade-in slide-in-from-top-2 flex items-start gap-3">
            <Sparkles size={18} className="text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{aiResponse}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Analytical Grid: Interactive Revenue Chart & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (2 cols): Financial Area Curve */}
        <div className="lg:col-span-2 bento-card flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Trajectoire Financière & Encaissements</h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +24.5% YOY
                </span>
              </div>
              <p className="text-[12.5px] text-slate-400">Évolution mensuelle certifiée en Dirhams Marocains (MAD)</p>
            </div>

            <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 text-[12px] font-semibold">
              <button
                onClick={() => setChartTab("revenu")}
                className={`px-3 py-1.5 rounded-lg transition-all ${chartTab === "revenu" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
              >
                Encaissements
              </button>
              <button
                onClick={() => setChartTab("depenses")}
                className={`px-3 py-1.5 rounded-lg transition-all ${chartTab === "depenses" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
              >
                Dépenses
              </button>
              <button
                onClick={() => setChartTab("prevision")}
                className={`px-3 py-1.5 rounded-lg transition-all ${chartTab === "prevision" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
              >
                Prévisions IA
              </button>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <InteractiveFinancialChart mode={chartTab} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-4 text-[12px] text-slate-400 gap-2">
            <span>Moyenne mensuelle : <strong className="text-white font-mono">142 500 MAD</strong></span>
            <span>Prévision M+1 (Août) : <strong className="text-emerald-400 font-mono">198 400 MAD</strong></span>
          </div>
        </div>

        {/* Right (1 col): Status Distribution & Risk Radar */}
        <div className="bento-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Répartition des Factures</h3>
              <span className="text-[11px] font-semibold text-slate-400">Août 2026</span>
            </div>

            <div className="space-y-3">
              {repartitionStatuts.map((s) => (
                <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-[13px] font-semibold text-slate-200">{s.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[13.5px] font-bold text-white">{s.value}</span>
                    <span className="ml-2 text-[11px] font-medium text-slate-400">({s.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800/80 pt-4">
            <div className="flex items-start gap-3 rounded-xl bg-indigo-950/40 p-3.5 border border-indigo-500/20 text-indigo-200">
              <Sparkles size={18} className="text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-[12px] leading-relaxed">
                <strong className="text-white">Recommandation IA :</strong> 2 relances automatiques programmées pour demain matin à 09:00.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Ultra-Clean Recent Invoices Data Table */}
      <div className="bento-card">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Dernières Factures Émises</h3>
            <p className="text-[12.5px] text-slate-400">Suivi en direct des échéances et statut d'encaissement</p>
          </div>
          <Link
            href="/factures"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>Consulter le registre complet</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 rounded-l-xl">Référence</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Émission</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right pr-4 rounded-r-xl">Montant TTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[13.5px]">
              {facturesRecentes.map((f) => (
                <tr 
                  key={f.numero} 
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className="group hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-300 group-hover:text-indigo-200 transition-colors">
                    {f.numero}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {f.client}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[12.5px]">
                    {f.date}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusChip tone={statusTone(f.statut)}>{f.statut}</StatusChip>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-white pr-4">
                    {mad(f.montant)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Modals */}
      <QuickInvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />
      <ScannerModal isOpen={isScannerModalOpen} onClose={() => setIsScannerModalOpen(false)} targetType="factures" />
      <WhatsAppModal isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} />

    </div>
  );
}

function InteractiveFinancialChart({ mode }: { mode: "revenu" | "depenses" | "prevision" }) {
  const data = revenuMensuel.map((d, i) => {
    let val = d.revenu;
    if (mode === "depenses") val = Math.round(d.revenu * 0.38);
    if (mode === "prevision") val = Math.round(d.revenu * (1 + (i * 0.05)));
    return { ...d, val };
  });

  const max = Math.max(...data.map((d) => d.val));

  return (
    <div className="flex h-full items-end gap-3 w-full">
      {data.map((d) => (
        <div key={d.mois} className="group relative flex flex-1 flex-col items-center gap-2 h-full justify-end">
          <div
            className={`w-full rounded-t-lg transition-all duration-300 ${
              mode === "revenu" 
                ? "bg-gradient-to-t from-indigo-700 to-indigo-500 group-hover:from-indigo-600 group-hover:to-indigo-400 glow-indigo" 
                : mode === "depenses"
                ? "bg-gradient-to-t from-amber-700 to-amber-500 group-hover:from-amber-600 group-hover:to-amber-400"
                : "bg-gradient-to-t from-purple-700 to-purple-500 group-hover:from-purple-600 group-hover:to-purple-400 glow-purple"
            }`}
            style={{ height: `${(d.val / max) * 100}%` }}
          />
          <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors">
            {d.mois}
          </span>
          
          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-20">
            {mad(d.val)}
          </div>
        </div>
      ))}
    </div>
  );
}

function WhatsAppModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"relance" | "config" | "historique">("relance");
  const [phoneNumber, setPhoneNumber] = useState("+212 661-889900");
  const [isConnected, setIsConnected] = useState(true);
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [sendProgress, setSendProgress] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState(false);

  const [invoices, setInvoices] = useState([
    {
      id: "FACT-2026-003",
      client: "OCP Group",
      phone: "+212 661-123456",
      montant: 45000,
      retard: "12 jours",
      date: "14/07/2026",
      selected: true,
      status: "idle",
      message: "Bonjour M. Benjelloun (OCP Group), sauf erreur de notre part, la facture FACT-2026-003 de 45 000 MAD émise le 14/07/2026 est arrivée à échéance. Merci de procéder au virement. Lien de règlement : https://fatourati.ma/pay/FACT-2026-003",
    },
    {
      id: "FACT-2026-004",
      client: "Royal Air Maroc",
      phone: "+212 662-987654",
      montant: 18500,
      retard: "5 jours",
      date: "20/07/2026",
      selected: true,
      status: "idle",
      message: "Bonjour Service Comptabilité RAM, rappel concernant la facture FACT-2026-004 de 18 500 MAD (échéance dépassée de 5j). Merci de régulariser sous 48h. Lien : https://fatourati.ma/pay/FACT-2026-004",
    },
    {
      id: "FACT-2026-007",
      client: "Inwi Telecom",
      phone: "+212 663-554433",
      montant: 32000,
      retard: "18 jours",
      date: "05/07/2026",
      selected: true,
      status: "idle",
      message: "Rappel urgent Fatourati : La facture FACT-2026-007 de 32 000 MAD pour Inwi Telecom présente 18 jours de retard. Merci de nous transmettre la preuve de virement.",
    },
  ]);

  const [history, setHistory] = useState([
    { id: "1", client: "Saham Assurance", phone: "+212 664-001122", date: "Hier à 14:30", type: "Relance N°1", status: "Lu & Payé" },
    { id: "2", client: "Marjane Group", phone: "+212 665-332211", date: "Le 01/08/2026", type: "Envoi Facture", status: "Livré" },
  ]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, selected: !inv.selected } : inv));
  };

  const updateMessage = (id: string, msg: string) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, message: msg } : inv));
  };

  const sendSingleWhatsAppWeb = (inv: typeof invoices[0]) => {
    const cleanPhone = inv.phone.replace(/[^0-9]/g, "");
    const encodedMsg = encodeURIComponent(inv.message);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, "_blank");
    setInvoices(invoices.map(item => item.id === inv.id ? { ...item, status: "sent" } : item));
    setHistory(prev => [
      { id: String(Date.now()), client: inv.client, phone: inv.phone, date: "À l'instant", type: "WhatsApp Direct", status: "Envoyé" },
      ...prev
    ]);
  };

  const sendSingleBot = (inv: typeof invoices[0]) => {
    setInvoices(invoices.map(item => item.id === inv.id ? { ...item, status: "sending" } : item));
    setTimeout(() => {
      setInvoices(invoices.map(item => item.id === inv.id ? { ...item, status: "sent" } : item));
      setHistory(prev => [
        { id: String(Date.now()), client: inv.client, phone: inv.phone, date: "À l'instant", type: "Relance WhatsApp IA", status: "Livré" },
        ...prev
      ]);
    }, 800);
  };

  const sendAllBot = () => {
    const selectedInvoices = invoices.filter(inv => inv.selected);
    if (selectedInvoices.length === 0) return;

    setIsSendingAll(true);
    setGlobalSuccess(false);
    setSendProgress("Initialisation de l'API WhatsApp Business...");

    setTimeout(() => {
      setSendProgress(`Envoi de la relance à ${selectedInvoices[0]?.client} (1/${selectedInvoices.length})...`);
    }, 600);

    setTimeout(() => {
      if (selectedInvoices.length > 1) {
        setSendProgress(`Envoi de la relance à ${selectedInvoices[1]?.client} (2/${selectedInvoices.length})...`);
      }
    }, 1400);

    setTimeout(() => {
      if (selectedInvoices.length > 2) {
        setSendProgress(`Envoi de la relance à ${selectedInvoices[2]?.client} (3/${selectedInvoices.length})...`);
      }
    }, 2200);

    setTimeout(() => {
      setIsSendingAll(false);
      setSendProgress(null);
      setGlobalSuccess(true);
      setInvoices(invoices.map(inv => inv.selected ? { ...inv, status: "sent" } : inv));
      setHistory(prev => [
        ...selectedInvoices.map(inv => ({
          id: String(Math.random()),
          client: inv.client,
          phone: inv.phone,
          date: "À l'instant",
          type: "Relance Groupée WhatsApp",
          status: "Livré",
        })),
        ...prev
      ]);
    }, 2900);
  };

  const selectedCount = invoices.filter(i => i.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30">
              <MessageCircle size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">WhatsApp Business Pro & Relances IA</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isConnected ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                  {isConnected ? "CONNECTÉ" : "DÉCONNECTÉ"}
                </span>
              </div>
              <p className="text-[12px] text-slate-400">Numéro Pro actif : <span className="font-mono text-emerald-300 font-semibold">{phoneNumber}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 bg-slate-950/30 px-6 py-2">
          <button
            onClick={() => setActiveTab("relance")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-semibold transition-all ${
              activeTab === "relance"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Zap size={15} />
            <span>Relance Impayés ({invoices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-semibold transition-all ${
              activeTab === "config"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Smartphone size={15} />
            <span>Configuration & QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab("historique")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-semibold transition-all ${
              activeTab === "historique"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <History size={15} />
            <span>Historique</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[68vh] overflow-y-auto space-y-4">
          
          {activeTab === "relance" && (
            <div className="space-y-4">
              {globalSuccess && (
                <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3.5 text-[13px] text-emerald-300 flex items-center gap-3 animate-in fade-in">
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                  <div>
                    <strong className="font-bold block">Relances transmises !</strong>
                    Les messages WhatsApp ont été envoyés avec succès aux clients sélectionnés.
                  </div>
                </div>
              )}

              {sendProgress && (
                <div className="rounded-xl bg-indigo-500/15 border border-indigo-500/30 p-3.5 text-[13px] text-indigo-300 flex items-center gap-3 animate-pulse">
                  <RotateCcw size={18} className="animate-spin text-indigo-400 shrink-0" />
                  <span className="font-semibold">{sendProgress}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12.5px] text-slate-400 border-b border-slate-800 pb-3">
                <span>{selectedCount} facture(s) sélectionnée(s) pour la relance</span>
                <button
                  onClick={sendAllBot}
                  disabled={isSendingAll || selectedCount === 0}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-[12.5px] font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/25 active:scale-95"
                >
                  <Zap size={15} />
                  <span>Tout relancer en 1-Clic via Bot WhatsApp</span>
                </button>
              </div>

              {/* Invoice Cards */}
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className={`rounded-xl border p-4 transition-all ${inv.selected ? "border-emerald-500/40 bg-slate-950/80" : "border-slate-800 bg-slate-950/40 opacity-70"}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={inv.selected}
                          onChange={() => toggleSelect(inv.id)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-[14px]">{inv.client}</span>
                            <span className="font-mono text-[12px] text-indigo-400">{inv.id}</span>
                          </div>
                          <span className="text-[11.5px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>📞 {inv.phone}</span>
                            <span>•</span>
                            <span className="text-amber-400 font-medium">Retard: {inv.retard}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="font-mono font-extrabold text-emerald-400 text-[15px]">{mad(inv.montant)}</span>
                        {inv.status === "sent" ? (
                          <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 size={13} /> Envoyé
                          </span>
                        ) : inv.status === "sending" ? (
                          <span className="rounded-full bg-indigo-500/20 px-2.5 py-1 text-[11px] font-bold text-indigo-300 border border-indigo-500/30 flex items-center gap-1 animate-pulse">
                            Envoi...
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Editable Message Box */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Message WhatsApp pré-rempli :</label>
                      <textarea
                        rows={2}
                        value={inv.message}
                        onChange={(e) => updateMessage(inv.id, e.target.value)}
                        className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-[12.5px] text-slate-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Action Buttons for Single Invoice */}
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => sendSingleWhatsAppWeb(inv)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
                      >
                        <ExternalLink size={14} className="text-emerald-400" />
                        <span>Ouvrir WhatsApp Web</span>
                      </button>

                      <button
                        onClick={() => sendSingleBot(inv)}
                        disabled={inv.status === "sending" || inv.status === "sent"}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all"
                      >
                        <Send size={13} />
                        <span>{inv.status === "sent" ? "Renvoyer via Bot" : "Envoyer via Bot"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "config" && (
            <div className="space-y-6 text-slate-200">
              {/* Security Banner */}
              <div className="rounded-xl bg-indigo-950/60 border border-indigo-500/40 p-4 text-[12.5px] text-indigo-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-indigo-300">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <span>🔐 Sécurité & Anti-Usurpation WhatsApp</span>
                </div>
                <p className="text-slate-300 text-[12px] leading-relaxed">
                  Pour votre sécurité et celle de vos clients, un numéro de téléphone ne peut <strong>jamais</strong> envoyer de messages sans vérification explicite.
                  L'envoi automatique nécessite un <strong>QR Code 2FA (WhatsApp Web)</strong> ou des <strong>Identifiants Meta Business API vérifiés (OTP SMS)</strong>.
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-[14px]">Statut du Compte WhatsApp Business Pro</h4>
                    <p className="text-[12px] text-slate-400">Authentification Meta Cloud API ou Session Web</p>
                  </div>
                  <button
                    onClick={() => setIsConnected(!isConnected)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                      isConnected ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                    }`}
                  >
                    {isConnected ? "Révoker l'accès" : "Authentifier le numéro"}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold text-slate-300 block">Numéro Expéditeur Vérifié :</label>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Vérifié par SMS OTP
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-[13px] text-white focus:border-emerald-500 focus:outline-none font-mono"
                  />
                  <button
                    onClick={() => alert("Un code SMS OTP de vérification a été envoyé à ce numéro. Veuillez valider la possession de la ligne.")}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-indigo-500 transition-all"
                  >
                    Demander Code SMS
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 p-5 border border-slate-800 text-center space-y-3">
                <h4 className="font-bold text-white text-[14px]">Appairage Sécurisé par QR Code (2FA)</h4>
                <p className="text-[12.5px] text-slate-400 max-w-md mx-auto">
                  Scannez ce QR code chiffré depuis l'application WhatsApp de votre smartphone (Appareils connectés &gt; Connecter un appareil) pour autoriser la session.
                </p>
                <div className="mx-auto h-40 w-40 rounded-xl bg-white p-3 border border-slate-800 flex items-center justify-center shadow-lg relative group">
                  <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full p-2">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`rounded-xs ${i % 2 === 0 || i % 3 === 0 ? "bg-slate-950" : "bg-transparent"} ${i === 0 || i === 3 || i === 12 ? "bg-emerald-600" : ""}`} 
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsConnected(true);
                    alert("✅ Appareil WhatsApp vérifié et connecté en toute sécurité !");
                  }}
                  className="rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-4 py-2 text-[12.5px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition-all"
                >
                  ⚡ Valider la connexion 2FA (Scan QR Code)
                </button>
              </div>
            </div>
          )}

          {activeTab === "historique" && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-[14px]">Historique des Envois WhatsApp</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase text-[10.5px]">
                      <th className="p-3">Client</th>
                      <th className="p-3">Téléphone</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {history.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-semibold text-white">{h.client}</td>
                        <td className="p-3 font-mono text-slate-400">{h.phone}</td>
                        <td className="p-3 text-indigo-300 font-medium">{h.type}</td>
                        <td className="p-3 text-slate-400">{h.date}</td>
                        <td className="p-3 text-right">
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10.5px] font-bold text-emerald-300 border border-emerald-500/30">
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-3.5 bg-slate-950/60">
          <span className="text-[12px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> API WhatsApp Business Chiffrée (SSL)
          </span>
          <button 
            onClick={onClose} 
            className="rounded-xl bg-slate-800 px-4 py-2 text-[12.5px] font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
