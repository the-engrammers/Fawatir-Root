"use client";

import { useState } from "react";
import {
  UploadCloud,
  Info,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Search,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { mad } from "@/lib/format";

type BankTransaction = {
  id: string;
  date: string;
  libelle: string;
  montant: number; // positive for credit (deposit), negative for debit (withdrawal)
  type: "Crédit" | "Débit";
  statut: "Rapproché" | "À rapprocher" | "Écart";
  pieceAssociee?: string;
};

export default function RapprochementPage() {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("Tous");
  const [selectedTxn, setSelectedTxn] = useState<BankTransaction | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [pieceInput, setPieceInput] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Parse CSV File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split(/\r?\n/);
      const newItems: BankTransaction[] = [];

      lines.forEach((line, index) => {
        if (index === 0 || !line.trim()) return; // skip header
        const parts = line.split(/[;,]/);
        if (parts.length >= 3) {
          const date = parts[0]?.trim() || new Date().toISOString().split("T")[0];
          const libelle = parts[1]?.trim() || "Transaction importée";
          const montantRaw = parseFloat(parts[2]?.replace(/\s/g, "").replace(",", ".")) || 0;
          
          newItems.push({
            id: `CSV-${Date.now()}-${index}`,
            date,
            libelle,
            montant: montantRaw,
            type: montantRaw >= 0 ? "Crédit" : "Débit",
            statut: "À rapprocher",
          });
        }
      });

      if (newItems.length > 0) {
        setTransactions((prev) => [...newItems, ...prev]);
      }
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  const downloadSampleCSV = () => {
    const csvContent =
      "Date;Libelle;Montant\n" +
      "2026-04-14;VIREMENT REGLEMENT CLIENT FAC-0046;41400\n" +
      "2026-04-13;PRELEVEMENT REDAL ELECTRICITE;-2340\n" +
      "2026-04-12;VIREMENT REGLEMENT CLIENT FAC-0047;15000\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "modele_releve_bancaire.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMatch = () => {
    if (!selectedTxn || !pieceInput.trim()) return;
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === selectedTxn.id
          ? { ...t, statut: "Rapproché", pieceAssociee: pieceInput.toUpperCase() }
          : t
      )
    );
    setIsMatchModalOpen(false);
    setSelectedTxn(null);
    setPieceInput("");
  };

  const autoMatchAll = () => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.statut === "À rapprocher") {
          const match = t.libelle.match(/(FAC-\d+|DEP-\d+|ABO-\d+)/i);
          if (match) {
            return { ...t, statut: "Rapproché", pieceAssociee: match[0].toUpperCase() };
          }
        }
        return t;
      })
    );
  };

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.libelle.toLowerCase().includes(search.toLowerCase()) ||
      (t.pieceAssociee || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatut = statutFilter === "Tous" || t.statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  const totalCredit = transactions.filter((t) => t.montant > 0).reduce((s, t) => s + t.montant, 0);
  const totalDebit = transactions.filter((t) => t.montant < 0).reduce((s, t) => s + Math.abs(t.montant), 0);
  const percentRapproche = Math.round(
    (transactions.filter((t) => t.statut === "Rapproché").length / (transactions.length || 1)) * 100
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">
            Rapprochement bancaire
          </h1>
          <p className="text-[13px] text-ink-400">
            Importez votre relevé bancaire et rapprochez vos opérations comptables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadSampleCSV}
            className="flex items-center gap-2 rounded-md border border-ink-200 px-3.5 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50 bg-paper"
          >
            <Download size={15} /> Modèle CSV
          </button>
          <button
            onClick={autoMatchAll}
            className="flex items-center gap-2 rounded-md bg-brass/10 text-brass border border-brass/30 px-3.5 py-2 text-[13px] font-medium hover:bg-brass/20"
          >
            <RefreshCw size={15} /> Rapprochement Auto (IA)
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <label className="ledger-card flex cursor-pointer flex-col items-center justify-center gap-2 border-dashed !border-l-4 py-8 text-center hover:border-brass/50 transition-colors">
        <UploadCloud size={30} className="text-brass" />
        <p className="text-[14px] font-medium text-ink-800">
          {isImporting ? "Importation en cours..." : "Téléversez votre relevé bancaire au format CSV"}
        </p>
        <p className="text-[12px] text-ink-400">Formats supportés: CIH, Attijariwafa, BMCE, SG, CSV standard</p>
        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
      </label>

      {/* KPI Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="ledger-card">
          <p className="text-[12px] text-ink-400">Total Crédits (Encaissements)</p>
          <p className="figure mt-1 text-[18px] font-semibold text-status-success">{mad(totalCredit)}</p>
        </div>
        <div className="ledger-card">
          <p className="text-[12px] text-ink-400">Total Débits (Décaissements)</p>
          <p className="figure mt-1 text-[18px] font-semibold text-status-danger">{mad(totalDebit)}</p>
        </div>
        <div className="ledger-card">
          <p className="text-[12px] text-ink-400">Taux de rapprochement</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="figure text-[18px] font-semibold text-ink-900">{percentRapproche}%</span>
            <span className="text-[12px] text-ink-500">
              {transactions.filter((t) => t.statut === "Rapproché").length} / {transactions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Table Card */}
      <div className="ledger-card !p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200/60 pb-3">
          <div className="flex gap-1.5">
            {["Tous", "À rapprocher", "Rapproché"].map((st) => (
              <button
                key={st}
                onClick={() => setStatutFilter(st)}
                className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                  statutFilter === st
                    ? "bg-ink-900 text-white"
                    : "bg-paper border border-ink-200 text-ink-600 hover:bg-ink-50"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher libellé ou pièce..."
              className="w-64 rounded-md border border-ink-200 bg-paper py-1.5 pl-8 pr-3 text-[13px] placeholder:text-ink-400 focus:border-brass/60 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
                <th className="pb-2.5 font-medium">Date</th>
                <th className="pb-2.5 font-medium">Libellé bancaire</th>
                <th className="pb-2.5 font-medium">Montant</th>
                <th className="pb-2.5 font-medium">Pièce associée</th>
                <th className="pb-2.5 font-medium">Statut</th>
                <th className="pb-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-400">
                    Aucune transaction trouvée.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="group">
                    <td className="py-3 text-ink-500 font-mono text-[12px]">{t.date}</td>
                    <td className="py-3 font-medium text-ink-900 max-w-md truncate">{t.libelle}</td>
                    <td className={`figure py-3 font-semibold ${t.montant >= 0 ? "text-status-success" : "text-ink-900"}`}>
                      {t.montant >= 0 ? `+${mad(t.montant)}` : `-${mad(Math.abs(t.montant))}`}
                    </td>
                    <td className="py-3">
                      {t.pieceAssociee ? (
                        <span className="font-mono text-[12px] bg-brass/10 text-brass px-2 py-0.5 rounded font-medium">
                          {t.pieceAssociee}
                        </span>
                      ) : (
                        <span className="text-ink-300 italic text-[12px]">Aucune</span>
                      )}
                    </td>
                    <td className="py-3">
                      {t.statut === "Rapproché" ? (
                        <span className="inline-flex items-center gap-1 text-status-success bg-status-successBg px-2 py-0.5 rounded-full text-[11px] font-medium">
                          <CheckCircle2 size={12} /> Rapproché
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-status-warning bg-status-warningBg px-2 py-0.5 rounded-full text-[11px] font-medium">
                          <Clock size={12} /> À rapprocher
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {t.statut === "À rapprocher" ? (
                        <button
                          onClick={() => {
                            setSelectedTxn(t);
                            const match = t.libelle.match(/(FAC-\d+|DEP-\d+|ABO-\d+)/i);
                            setPieceInput(match ? match[0].toUpperCase() : "FAC-0045");
                            setIsMatchModalOpen(true);
                          }}
                          className="rounded bg-ink-900 px-3 py-1 text-[12px] font-medium text-white hover:bg-ink-800"
                        >
                          Rapprocher
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setTransactions((prev) =>
                              prev.map((item) =>
                                item.id === t.id ? { ...item, statut: "À rapprocher", pieceAssociee: undefined } : item
                              )
                            );
                          }}
                          className="text-[12px] text-ink-400 hover:text-ink-700"
                        >
                          Délier
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Match Modal */}
      {isMatchModalOpen && selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg bg-paper-card p-5 shadow-panel border border-ink-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-ink-200/60 pb-3">
              <h3 className="font-display text-[16px] font-semibold text-ink-900">
                Rapprocher la transaction
              </h3>
              <button onClick={() => setIsMatchModalOpen(false)} className="text-ink-400 hover:text-ink-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 rounded-md bg-paper p-3 text-[12.5px] border border-ink-200">
              <p className="text-ink-500">Date : <span className="text-ink-900 font-medium">{selectedTxn.date}</span></p>
              <p className="text-ink-500">Libellé : <span className="text-ink-900 font-medium">{selectedTxn.libelle}</span></p>
              <p className="text-ink-500">Montant : <span className="figure text-ink-900 font-semibold">{mad(Math.abs(selectedTxn.montant))}</span></p>
            </div>

            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-ink-700">
                Numéro de facture ou pièce comptable liée
              </label>
              <input
                type="text"
                value={pieceInput}
                onChange={(e) => setPieceInput(e.target.value)}
                placeholder="Ex: FAC-0045, DEP-012"
                className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsMatchModalOpen(false)}
                className="rounded-md border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:bg-ink-50"
              >
                Annuler
              </button>
              <button
                onClick={handleMatch}
                className="rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
              >
                Confirmer le rapprochement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
