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
    <div className="mx-auto max-w-[1000px] space-y-6 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Tickets de Support Client</h1>
          <p className="text-[13px] text-slate-400">Contactez directement notre équipe d'assistance technique</p>
        </div>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
        >
          <Plus size={16} /> Nouveau ticket
        </button>
      </div>

      {formOpen && (
        <div className="bento-card space-y-4 animate-in fade-in zoom-in-95">
          <input
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            placeholder="Sujet de votre demande..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez précisément votre problème ou votre question..."
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <div className="flex justify-end gap-3 pt-1 border-t border-slate-800/80">
            <button
              onClick={() => setFormOpen(false)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-slate-300 hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              onClick={envoyer}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
            >
              <MessageSquare size={15} /> Envoyer le ticket
            </button>
          </div>
        </div>
      )}

      <div className="bento-card">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 mb-1">
              <MessageSquare size={24} />
            </div>
            <p className="text-[14px] font-bold text-white">Aucun ticket en cours</p>
            <p className="text-[12.5px] text-slate-400">Vos tickets d'assistance et demandes récentes apparaîtront ici</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {tickets.map((t) => (
              <div key={t.id} className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[13.5px] font-bold text-white">{t.sujet}</p>
                  <span className="text-[11.5px] font-mono text-slate-400">{t.date}</span>
                </div>
                <p className="text-[13px] text-slate-300 leading-relaxed">{t.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
