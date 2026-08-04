"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Maximize2, Minimize2, CheckCircle2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Bonjour ! Je suis l'Assistant IA de Fatourati. Comment puis-je vous aider aujourd'hui ? (Ex: Crée un devis, Affiche mes clients, Cherche un produit...)" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/ai/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error("Erreur réseau");
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Désolé, je n'ai pas compris." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Désolé, une erreur est survenue lors de la connexion au serveur." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brass text-white shadow-lg shadow-brass/30 transition-transform hover:scale-110 active:scale-95"
        >
          <MessageSquare size={24} />
          {/* Notification dot */}
          <span className="absolute right-3 top-3 h-3 w-3 rounded-full border-2 border-white bg-red-500 animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all duration-300 ${
            isExpanded ? "h-[80vh] w-[800px]" : "h-[500px] w-[380px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-ai px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <span className="font-display font-bold">IA</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Assistant Fatourati</h3>
                <p className="text-[11px] text-white/80">Connecté à votre base de données</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded p-1 hover:bg-white/20 transition-colors"
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded p-1 hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    msg.role === "user" 
                      ? "bg-brass text-white rounded-br-sm" 
                      : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm prose prose-sm prose-p:my-1 prose-a:text-brass prose-a:font-semibold prose-a:underline"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-[13.5px] whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({node, ...props}) => <div className="overflow-x-auto my-2"><table className="min-w-full divide-y divide-gray-200 text-[12px]" {...props} /></div>,
                        th: ({node, ...props}) => <th className="bg-gray-50 px-3 py-2 text-left font-semibold text-gray-900 border-b" {...props} />,
                        td: ({node, ...props}) => <td className="whitespace-nowrap px-3 py-2 text-gray-600 border-b" {...props} />,
                        a: ({node, href, children}) => {
                            if (href?.startsWith('https://wa.me')) {
                                return (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 mb-1 px-3 py-1.5 bg-[#25D366] text-white rounded-full hover:bg-[#20bd5a] no-underline shadow-sm transition-all text-xs font-bold">
                                        {children}
                                    </a>
                                )
                            }
                            return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-brass"></div>
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-brass" style={{ animationDelay: '0.15s' }}></div>
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-brass" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-100 p-3">
            <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 p-1 focus-within:ring-1 focus-within:ring-brass focus-within:border-brass transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Demandez-moi n'importe quoi..."
                className="max-h-32 min-h-[44px] w-full resize-none bg-transparent px-3 py-2.5 text-[13.5px] text-gray-900 outline-none placeholder:text-gray-400"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="mb-1 mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass text-white transition-colors hover:bg-brass-dark disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
