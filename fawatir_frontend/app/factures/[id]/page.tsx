"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Download, CheckCircle2, Loader2 } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import { mad, statusTone } from "@/lib/format";
import { fetchAPI } from "@/lib/api";

export default function FactureDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [facture, setFacture] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [clientName, setClientName] = useState("—");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setError("");
    try {
      const [facRes, itemsRes, prodRes] = await Promise.all([
        fetchAPI(`api/invoices/${id}/`),
        fetchAPI("api/invoice-items/"),
        fetchAPI("api/products/"),
      ]);

      if (!facRes.ok) {
        setError("Facture introuvable");
        setLoading(false);
        return;
      }

      const facData = await facRes.json();
      const itemsData = await itemsRes.json();
      const prodData = await prodRes.json();

      const itemsList = (Array.isArray(itemsData) ? itemsData : itemsData.results || []).filter(
        (it: any) => it.invoice === id
      );
      const prodList = Array.isArray(prodData) ? prodData : prodData.results || [];
      const prodMap: Record<string, string> = {};
      prodList.forEach((p: any) => (prodMap[p.id] = p.name));

      setFacture(facData);
      setItems(itemsList.map((it: any) => ({ ...it, articleName: prodMap[it.product] || "Article" })));

      if (facData.client) {
        const cliRes = await fetchAPI(`api/clients/${facData.client}/`);
        if (cliRes.ok) {
          const cli = await cliRes.json();
          setClientName(cli.company_name || cli.contact_name || "—");
        }
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    setUpdating(true);
    try {
      await fetchAPI(`api/invoices/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Payée", balance_due: "0.00" }),
      });
      fetchData();
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-ink-300" size={24} />
      </div>
    );
  }

  if (error || !facture) {
    return (
      <div className="mx-auto max-w-[1100px] space-y-5">
        <Link href="/factures" className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-500 hover:text-ink-800">
          <ChevronLeft size={14} /> Factures
        </Link>
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-[13px] text-red-600">
          {error || "Facture introuvable"}
        </div>
      </div>
    );
  }

  const sousTotal = parseFloat(facture.subtotal || 0);
  const remiseAmount = parseFloat(facture.discount_amount || 0);
  const taxe = parseFloat(facture.tax_amount || 0);
  const total = parseFloat(facture.total_amount || 0);

  return (
    <div className="mx-auto max-w-[1100px] space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/factures"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-ink-500 hover:border-brass/50 hover:text-ink-800"
          >
            <ChevronLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-[20px] font-semibold text-ink-900">
                {facture.invoice_number}
              </h1>
              <StatusChip tone={statusTone(facture.status)}>{facture.status}</StatusChip>
            </div>
            <p className="text-[12.5px] text-ink-400">Créée le {facture.issue_date}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-md border border-ink-200 px-3 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50"
          >
            <Download size={14} /> PDF
          </button>
          {facture.status !== "Payée" && (
            <button
              onClick={markAsPaid}
              disabled={updating}
              className="flex items-center gap-1.5 rounded-md bg-status-success px-3 py-2 text-[13px] font-medium text-white hover:bg-status-success/90 disabled:opacity-50"
            >
              <CheckCircle2 size={14} /> {updating ? "..." : "Marquer comme payée"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="ledger-card">
          <p className="text-[11.5px] uppercase tracking-wide text-ink-400">Client</p>
          <p className="mt-1 text-[15px] font-medium text-ink-900">{clientName}</p>
        </div>
        <div className="ledger-card">
          <p className="text-[11.5px] uppercase tracking-wide text-ink-400">Dates</p>
          <div className="mt-1 flex justify-between text-[13px] text-ink-700">
            <span>Émise</span>
            <span>{facture.issue_date}</span>
          </div>
          <div className="flex justify-between text-[13px] text-ink-700">
            <span>Échéance</span>
            <span>{facture.due_date}</span>
          </div>
        </div>
        <div className="ledger-card">
          <p className="text-[11.5px] uppercase tracking-wide text-ink-400">Total</p>
          <p className="figure mt-1 text-[20px] font-semibold text-ink-900">{mad(total)}</p>
        </div>
      </div>

      <div className="ledger-card">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12px] font-medium uppercase tracking-wide text-ink-400">
            Lignes de facture
          </p>
          <span className="text-[12px] text-ink-400">{items.length} article(s)</span>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink-200/60 text-left text-[11px] uppercase tracking-wide text-ink-400">
              <th className="pb-2 font-medium">#</th>
              <th className="pb-2 font-medium">Article</th>
              <th className="pb-2 font-medium text-right">Qté</th>
              <th className="pb-2 font-medium text-right">Prix</th>
              <th className="pb-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200/60">
            {items.map((l, idx) => (
              <tr key={l.id}>
                <td className="py-2.5 text-ink-400">{idx + 1}</td>
                <td className="py-2.5 text-ink-700">{l.articleName}</td>
                <td className="figure py-2.5 text-right text-ink-700">{l.quantity}</td>
                <td className="figure py-2.5 text-right text-ink-700">{mad(l.unit_price)}</td>
                <td className="figure py-2.5 text-right font-medium text-ink-900">
                  {mad(l.line_total)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ink-400">
                  Aucun article
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="ml-auto mt-3 w-full max-w-xs space-y-1.5 text-[13px]">
          <div className="flex justify-between text-ink-500">
            <span>Sous-total</span>
            <span className="figure">{mad(sousTotal)}</span>
          </div>
          <div className="flex justify-between text-ink-500">
            <span>Taxe</span>
            <span className="figure">{mad(taxe)}</span>
          </div>
          {remiseAmount > 0 && (
            <div className="flex justify-between text-ink-500">
              <span>Remise</span>
              <span className="figure">-{mad(remiseAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-ink-200/60 pt-2 text-[15px] font-semibold text-ink-900">
            <span>Total</span>
            <span className="figure">{mad(total)}</span>
          </div>
        </div>
      </div>

      {facture.notes && (
        <div className="ledger-card">
          <p className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-ink-400">Notes</p>
          <p className="text-[13px] text-ink-700">{facture.notes}</p>
        </div>
      )}
    </div>
  );
}
