"use client";

import { useState } from "react";
import { MessageSquare, Plus } from "lucide-react";

type Ticket = { id: string; sujet: string; message: string; date: string };

export default function SupportPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);

  function envoyer() {
    if (!message.trim()) return;
    setTickets((prev) => [
      { id: `T-${prev.length + 1}`, sujet: sujet || "(Sans sujet)", message, date: "Aujourd'hui" },
      ...prev,
    ]);
    setSujet("");
    setMessage("");
    setFormOpen(false);
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-semibold text-ink-900">Tickets de support</h1>
          <p className="text-[13px] text-ink-400">Contactez notre équipe support</p>
        </div>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
        >
          <Plus size={15} /> Nouveau ticket
        </button>
      </div>

      {formOpen && (
        <div className="ledger-card space-y-3">
          <input
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            placeholder="Sujet (optionnel)"
            className="w-full rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez votre problème..."
            rows={4}
            className="w-full resize-none rounded-md border border-ink-200 bg-paper px-3 py-2 text-[13px] focus:border-brass/60 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setFormOpen(false)}
              className="rounded-md border border-ink-200 px-4 py-2 text-[13px] font-medium text-ink-700 hover:border-brass/50"
            >
              Annuler
            </button>
            <button
              onClick={envoyer}
              className="flex items-center gap-1.5 rounded-md bg-ink-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-ink-800"
            >
              <MessageSquare size={14} /> Envoyer
            </button>
          </div>
        </div>
      )}

      <div className="ledger-card">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <MessageSquare size={22} className="text-ink-300" />
            <p className="text-[13.5px] font-medium text-ink-700">Aucun ticket</p>
            <p className="text-[12px] text-ink-400">Les tickets de support apparaîtront ici</p>
          </div>
        ) : (
          <div className="divide-y divide-ink-200/60">
            {tickets.map((t) => (
              <div key={t.id} className="py-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-ink-900">{t.sujet}</p>
                  <span className="text-[11.5px] text-ink-400">{t.date}</span>
                </div>
                <p className="mt-0.5 text-[12.5px] text-ink-500">{t.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
