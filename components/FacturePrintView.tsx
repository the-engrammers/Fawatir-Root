"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { mad } from "@/lib/format";

export function printFactureWindow(facture: any) {
  if (!facture) return;

  const rawTotal = parseFloat(facture.total_amount || facture.montant) || 0;
  const rawLignes = facture.lignes || facture.items || facture.articles || [];
  
  let lignes = rawLignes;
  let sousTotal = 0;
  let tva = 0;
  let totalTtc = rawTotal;

  if (lignes.length > 0) {
    sousTotal = lignes.reduce((sum: number, l: any) => sum + (l.quantite || l.qte || 1) * (l.prix_unitaire || l.prix || 0), 0);
    tva = sousTotal * 0.2;
    if (totalTtc === 0) totalTtc = sousTotal + tva;
  } else {
    sousTotal = totalTtc / 1.2;
    tva = totalTtc - sousTotal;
    lignes = [{
      description: `Facture ${facture.invoice_number || facture.numero || ''} - Prestation / Vente`,
      quantite: 1,
      prix_unitaire: sousTotal
    }];
  }

  const linesHtml = lignes.map((l: any, idx: number) => {
    const q = l.quantite || l.qte || 1;
    const p = l.prix_unitaire || l.prix || 0;
    return `
      <tr style="border-bottom: 1px solid #e2e8f0; vertical-align: top;">
        <td style="padding: 10px 12px; font-family: monospace; color: #64748b;">${idx + 1}</td>
        <td style="padding: 10px 12px; font-weight: 600; color: #0f172a;">${l.description || l.article || l.nom || "Prestation / Article"}</td>
        <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: 600;">${q}</td>
        <td style="padding: 10px 12px; text-align: right; font-family: monospace;">${p.toFixed(2)} MAD</td>
        <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: bold; color: #0f172a;">${(q * p).toFixed(2)} MAD</td>
      </tr>
    `;
  }).join('');

  const printWindow = window.open('', '_blank', 'width=850,height=1000,top=50,left=100');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Facture #${facture.invoice_number || facture.id}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            font-size: 13px;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
          }
          .flex-between {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .header-title {
            font-size: 32px;
            font-weight: 900;
            letter-spacing: -1px;
            color: #020617;
            margin: 0;
          }
          .badge-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: #e0e7ff;
            color: #3730a3;
          }
          .badge-paid {
            background: #dcfce7;
            color: #166534;
          }
          .card-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            margin-bottom: 25px;
          }
          th {
            background: #f1f5f9;
            color: #475569;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 10px 12px;
            border-bottom: 2px solid #cbd5e1;
            text-align: left;
          }
          .total-box {
            width: 320px;
            margin-left: auto;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            color: #475569;
          }
          .total-ttc {
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 900;
            color: #0f172a;
            border-top: 2px solid #0f172a;
            padding-top: 10px;
            margin-top: 8px;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          
          {/* Header row */}
          <div class="flex-between" style="border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px;">
            <div>
              <h1 class="header-title">FACTURE</h1>
              <p style="font-size: 16px; font-weight: 700; color: #4f46e5; margin: 4px 0 0 0; font-family: monospace;">
                N° ${facture.invoice_number || facture.numero || facture.id}
              </p>
              <div style="margin-top: 8px;">
                <span class="badge-status ${(facture.status || facture.statut) === 'Payée' ? 'badge-paid' : ''}">
                  ${facture.status || facture.statut || 'Brouillon'}
                </span>
              </div>
            </div>

            <div style="text-align: right;">
              <h2 style="font-size: 18px; font-weight: 900; color: #020617; margin: 0;">FATOURATI SARL</h2>
              <p style="margin: 2px 0 0 0; color: #475569;">123 Boulevard Zerktouni</p>
              <p style="margin: 0; color: #475569;">20000 Casablanca, Maroc</p>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b; font-family: monospace;">
                ICE: 002345678000091 · IF: 87654321 · RC: 45892
              </p>
              <p style="margin: 0; font-size: 11px; color: #64748b;">Tél: +212 522 00 11 22 · contact@fatourati.ma</p>
            </div>
          </div>

          {/* Client & Dates Info */}
          <div class="flex-between" style="gap: 20px; margin-bottom: 25px;">
            <div class="card-box" style="flex: 1;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
                FACTURÉ À (CLIENT)
              </span>
              <p style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0;">
                ${facture.client_name || facture.client || "Client Comptoir"}
              </p>
              <p style="margin: 4px 0 0 0; color: #475569; font-size: 12px;">Casablanca, Maroc</p>
            </div>

            <div class="card-box" style="flex: 1;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
                DÉTAILS DE FACTURATION
              </span>
              <div class="total-row" style="font-size: 12px;">
                <span>Date d'Émission :</span>
                <strong style="color: #0f172a;">${facture.date || facture.dateEmission || new Date().toISOString().split("T")[0]}</strong>
              </div>
              <div class="total-row" style="font-size: 12px;">
                <span>Date d'Échéance :</span>
                <strong style="color: #0f172a;">À réception</strong>
              </div>
              <div class="total-row" style="font-size: 12px;">
                <span>Mode de Règlement :</span>
                <strong style="color: #0f172a;">Virement Bancaire / Carte</strong>
              </div>
            </div>
          </div>

          {/* Articles Table */}
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Désignation / Prestation</th>
                <th style="text-align: right; width: 70px;">Qté</th>
                <th style="text-align: right; width: 140px;">Prix U. HT</th>
                <th style="text-align: right; width: 140px;">Total HT</th>
              </tr>
            </thead>
            <tbody>
              ${linesHtml.length > 0 ? linesHtml : `
                <tr>
                  <td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8;">Aucune ligne d'article enregistrée.</td>
                </tr>
              `}
            </tbody>
          </table>

          {/* Totals Summary & Payment Info */}
          <div class="flex-between" style="align-items: flex-start;">
            <div class="card-box" style="width: 420px; font-size: 12px;">
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                COORDONNÉES BANCAIRES POUR RÈGLEMENT
              </span>
              <p style="margin: 0; font-weight: 700; color: #0f172a;">Banque : Attijariwafa Bank Casablanca Main</p>
              <p style="margin: 2px 0 0 0; font-family: monospace; font-weight: 700; color: #3730a3;">RIB : 007 780 0001234567890123 45</p>
              <p style="margin: 2px 0 0 0; color: #475569; font-size: 11px;">IBAN / SWIFT : BCMAMAMCXXXX</p>
            </div>

            <div class="total-box">
              <div class="total-row">
                <span>Sous-total HT :</span>
                <strong style="font-family: monospace; color: #0f172a;">${sousTotal.toFixed(2)} MAD</strong>
              </div>
              <div class="total-row">
                <span>TVA (20%) :</span>
                <strong style="font-family: monospace; color: #4f46e5;">+${tva.toFixed(2)} MAD</strong>
              </div>
              <div class="total-ttc">
                <span>Total TTC :</span>
                <span style="font-family: monospace;">${totalTtc.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          {/* Signature & Stamp placeholder */}
          <div class="flex-between" style="margin-top: 40px; padding: 0 10px;">
            <div style="width: 250px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 15px; background: #fafafa;">
              <span style="font-size: 11px; font-weight: 700; color: #64748b;">Cachet & Signature Client</span>
              <div style="height: 50px;"></div>
            </div>

            <div style="width: 250px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 15px; background: #fafafa;">
              <span style="font-size: 11px; font-weight: 700; color: #64748b;">Pour FATOURATI SARL</span>
              <div style="height: 50px;"></div>
            </div>
          </div>

          {/* Footer */}
          <div class="footer">
            <p style="margin: 0; font-weight: 600;">Facture arrêtée à la somme de ${totalTtc.toFixed(2)} Dirhams TTC.</p>
            <p style="margin: 4px 0 0 0;">Merci pour votre confiance. En cas de retard de paiement, une pénalité au taux légal en vigueur sera appliquée.</p>
            <p style="margin: 2px 0 0 0; font-family: monospace;">www.fatourati.ma</p>
          </div>

        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export default function FacturePrintView({ id }: { id: string }) {
  const [facture, setFacture] = useState<any>(null);

  useEffect(() => {
    fetch("/api/invoices")
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || []);
        const found = list.find((f: any) => f.id === id || f.invoice_number === id);
        setFacture(found);
      });
  }, [id]);

  if (!facture) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-400" size={32} /></div>;

  const lignes = facture.lignes || [];
  const sousTotal = lignes.reduce((sum: any, l: any) => sum + (l.quantite || l.qte || 1) * (l.prix_unitaire || l.prix || 0), 0);
  const taxe = sousTotal * 0.2;
  const total = sousTotal + taxe;

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-6 flex flex-col items-center">
      {/* Top Action Bar */}
      <div className="w-full max-w-[850px] mb-6 flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl">
        <button 
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) window.history.back();
            else window.location.href = "/factures";
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
        >
          ← Retour
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Facture #{facture.invoice_number}</span>
          <button 
            onClick={() => printFactureWindow(facture)} 
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            📄 Imprimer / Exporter PDF (A4)
          </button>
        </div>
      </div>

      {/* A4 Paper Document Preview Container */}
      <div className="w-full max-w-[850px] bg-white text-slate-900 p-10 rounded-2xl shadow-2xl border border-slate-200 font-sans space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
          <div>
            <h1 className="text-4xl font-black text-slate-950 tracking-tight">FACTURE</h1>
            <p className="text-lg font-bold font-mono text-indigo-600 mt-1">{facture.invoice_number}</p>
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                facture.status === 'Payée' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {facture.status || 'Brouillon'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black text-slate-950">FATOURATI SARL</h2>
            <p className="text-xs text-slate-600">123 Boulevard Zerktouni</p>
            <p className="text-xs text-slate-600">20000 Casablanca, Maroc</p>
            <p className="text-[11px] font-mono text-slate-500 mt-1">ICE: 002345678000091 · IF: 87654321 · RC: 45892</p>
            <p className="text-[11px] text-slate-500">Tél: +212 522 00 11 22 · contact@fatourati.ma</p>
          </div>
        </div>

        {/* Client Info & Dates */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">FACTURÉ À (CLIENT)</p>
            <p className="text-base font-bold text-slate-900">{facture.client_name || "Client Comptoir"}</p>
            <p className="text-xs text-slate-600 mt-1">Casablanca, Maroc</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1 text-xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">DÉTAILS</p>
            <div className="flex justify-between">
              <span className="text-slate-500">Date d'Émission :</span>
              <span className="font-bold text-slate-900">{facture.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Échéance :</span>
              <span className="font-bold text-slate-900">À réception</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mode Règlement :</span>
              <span className="font-bold text-slate-900">Virement / Carte</span>
            </div>
          </div>
        </div>

        {/* Lines Table */}
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-700 text-[11px] uppercase font-bold">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Désignation</th>
              <th className="py-2.5 px-3 text-right">Qté</th>
              <th className="py-2.5 px-3 text-right">Prix U. HT</th>
              <th className="py-2.5 px-3 text-right">Total HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {lignes.map((l: any, i: number) => {
              const q = l.quantite || l.qte || 1;
              const p = l.prix_unitaire || l.prix || 0;
              return (
                <tr key={i}>
                  <td className="py-3 px-3 text-slate-400 font-mono">{i + 1}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{l.description || l.article || "Article"}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">{q}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">{mad(p)}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-950">{mad(q * p)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Financial Summary */}
        <div className="flex justify-between items-start pt-4 border-t border-slate-200">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs w-[400px]">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">COORDONNÉES BANCAIRES</p>
            <p className="font-bold text-slate-900">Attijariwafa Bank Casablanca Main</p>
            <p className="font-mono font-bold text-indigo-700 mt-1">RIB : 007 780 0001234567890123 45</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs w-72 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Sous-total HT :</span>
              <span className="font-mono font-bold text-slate-900">{mad(sousTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>TVA (20%) :</span>
              <span className="font-mono text-indigo-600">+{mad(taxe)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-950 border-t-2 border-slate-900 pt-2 mt-2">
              <span>Total TTC :</span>
              <span className="font-mono">{mad(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">Facture arrêtée à la somme de {mad(total)} TTC.</p>
          <p>Merci pour votre confiance · Fatourati Billing Platform</p>
        </div>

      </div>
    </div>
  );
}
