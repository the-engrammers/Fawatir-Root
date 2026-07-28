"use client";

import { useState } from "react";
import { Sparkles, X, Send, FileText, Users, Boxes, BarChart3 } from "lucide-react";

type Message = { from: "assistant" | "user"; text: string };

const shortcuts = [
  { label: "Créer votre première facture", icon: FileText },
  { label: "Gestion des clients", icon: Users },
  { label: "Produits & Stock", icon: Boxes },
  { label: "Rapports & Analyses", icon: BarChart3 },
];

function fakeAssistantReply(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("facture pour") || (lower.includes("facture") && lower.includes(":"))) {
    return "Je crée le client et ensuite la facture.\n✓ Facture créée · Voir la facture →\n✓ Client ajouté · Voir les clients →";
  }
  if (lower.includes("whatsapp")) {
    return "C'est envoyé sur WhatsApp ✓";
  }
  if (lower.includes("client")) {
    return "Je peux créer, rechercher ou mettre à jour une fiche client. Donnez-moi un nom pour commencer.";
  }
  return "Compris — dites-moi le client, les articles et le montant, et je prépare le document.";
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  function send(text: string) {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "assistant", text: fakeAssistantReply(text) }]);
    }, 500);
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 text-white shadow-bento hover:bg-ink-800 hover:-translate-y-1 transition-all"
      >
        {open ? <X size={20} /> : <Sparkles size={20} className="text-brass" />}
      </button>

      {open && (
        <div className="fixed bottom-[92px] right-6 z-40 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-card border border-white/80 bg-paper-card backdrop-blur-3xl shadow-bento transition-all">
          <div className="flex items-center justify-between border-b border-ink-200/60 bg-ink-900 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-brass" />
              <div>
                <p className="text-[13px] font-medium text-white">Fatourati — Assistant IA</p>
                <p className="text-[11px] text-ink-200/50">En ligne</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-ink-200/60 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <>
                <p className="text-[13px] text-ink-700">
                  Je peux créer vos factures, devis, clients et plus. Demandez-moi !
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {shortcuts.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => send(s.label)}
                      className="flex flex-col items-start gap-2 rounded-xl border border-ink-200/60 bg-paper px-3 py-3 text-left hover:border-brass hover:bg-brass/5 hover:shadow-sm active:scale-95 transition-all duration-300"
                    >
                      <s.icon size={15} className="text-brass" />
                      <span className="text-[11.5px] font-medium text-ink-700">{s.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-md px-3 py-2 text-[12.5px] ${
                    m.from === "user"
                      ? "bg-ink-900 text-white"
                      : "border border-ink-200 bg-paper text-ink-700"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-ink-200/60 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Message Fatourati AI..."
              className="flex-1 rounded-md border border-ink-200 bg-paper px-3 py-2 text-[12.5px] focus:border-brass/60 focus:outline-none"
            />
            <button
              onClick={() => send(input)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-white hover:bg-ink-800 hover:shadow-md active:scale-95 transition-all duration-300"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
