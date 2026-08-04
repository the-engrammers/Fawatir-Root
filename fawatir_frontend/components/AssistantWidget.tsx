"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, FileText, Users, Boxes, BarChart3, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = { from: "assistant" | "user"; text: string };

const shortcuts = [
  { label: "Créer un devis pour Hassan avec un Clavier", icon: FileText },
  { label: "Affiche mes 10 derniers clients", icon: Users },
  { label: "Le clavier est-il en stock ?", icon: Boxes },
  { label: "Prépare un WhatsApp pour Hassan", icon: Sparkles },
];

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, open]);

  async function send(text: string) {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setIsLoading(true);

    try {
      // The API endpoint on the Django backend
      const res = await fetch("http://127.0.0.1:8000/api/ai/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      setMessages((prev) => [...prev, { from: "assistant", text: data.reply || "Aucune réponse reçue." }]);
    } catch (e) {
      setMessages((prev) => [...prev, { from: "assistant", text: "Désolé, je n'arrive pas à me connecter au serveur d'IA (backend Django)." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-white shadow-bento hover:bg-ink-800 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ring-4 ring-ink-900/10"
      >
        {open ? <X size={24} /> : <Sparkles size={24} className="text-brass" />}
        {!open && <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-red-500 animate-pulse"></span>}
      </button>

      {open && (
        <div className="fixed bottom-[96px] right-6 z-50 flex h-[600px] w-[420px] flex-col overflow-hidden rounded-[24px] border border-white/80 bg-paper-card backdrop-blur-3xl shadow-bento animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-ink-900 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brass/20 text-brass shadow-glow">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white">Fatourati AI</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[11px] text-ink-200/70 font-medium">Assistant DB Connecté</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all">
              <X size={16} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5 scrollbar-hide bg-gradient-to-b from-paper to-white">
            {messages.length === 0 && (
              <div className="mb-6">
                <div className="inline-block bg-white border border-ink-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm mb-4">
                  <p className="text-[13px] text-ink-800 leading-relaxed font-medium">
                    Bonjour ! 👋 Je suis l'IA de Fatourati connectée en temps réel à votre base de données. 
                    <br/><br/>
                    Je peux vérifier vos stocks, trouver des clients, générer des devis et préparer des liens WhatsApp. Que voulez-vous faire ?
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {shortcuts.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => send(s.label)}
                      className="group flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3 text-left hover:border-brass/40 hover:bg-brass/5 hover:shadow-sm active:scale-95 transition-all duration-300"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-50 text-ink-500 group-hover:bg-brass/10 group-hover:text-brass transition-colors">
                        <s.icon size={15} />
                      </div>
                      <span className="text-[12px] font-semibold text-ink-700 group-hover:text-ink-900">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                {m.from === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass/10 text-brass mr-2 mt-1">
                    <Sparkles size={12} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                    m.from === "user"
                      ? "bg-ink-900 text-white rounded-tr-sm"
                      : "border border-ink-100 bg-white text-ink-800 rounded-tl-sm prose prose-sm prose-p:my-1 prose-a:text-brass prose-a:font-semibold prose-a:underline"
                  }`}
                >
                  {m.from === "user" ? (
                    <span className="whitespace-pre-wrap">{m.text}</span>
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({node, ...props}) => <div className="overflow-x-auto my-3 rounded-lg border border-ink-100 shadow-sm"><table className="min-w-full divide-y divide-ink-100 text-[12px] text-left" {...props} /></div>,
                        th: ({node, ...props}) => <th className="bg-ink-50 px-3 py-2 font-semibold text-ink-900 border-b border-ink-100" {...props} />,
                        td: ({node, ...props}) => <td className="whitespace-nowrap px-3 py-2 text-ink-700 border-b border-ink-50" {...props} />,
                        a: ({node, href, children}) => {
                            if (href?.startsWith('https://wa.me')) {
                                return (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 mb-1 px-4 py-2 bg-[#25D366] text-white rounded-full hover:bg-[#20bd5a] no-underline shadow-md hover:shadow-lg transition-all text-[13px] font-bold">
                                        <svg xmlns="http://www.000webhost.com/" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                        {children}
                                    </a>
                                )
                            }
                            return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                        }
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start items-center">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass/10 text-brass mr-2">
                  <Sparkles size={12} />
                </div>
                <div className="flex items-center gap-1 bg-white border border-ink-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="h-1.5 w-1.5 bg-ink-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-1.5 w-1.5 bg-ink-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-1.5 w-1.5 bg-ink-300 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-ink-100 bg-white p-4">
            <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-paper px-3 py-2 focus-within:border-brass/60 focus-within:ring-4 focus-within:ring-brass/10 transition-all shadow-inner">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Ex: Prépare un Devis pour Hassan..."
                className="flex-1 bg-transparent px-2 py-1.5 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass text-white hover:bg-brass-dark hover:shadow-md active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300"
              >
                <Send size={15} className="ml-0.5" />
              </button>
            </div>
          </div>
          
        </div>
      )}
    </>
  );
}
