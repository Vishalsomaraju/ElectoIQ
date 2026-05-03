import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2 } from "lucide-react";
import { useGemini } from "../../hooks/useGemini";
import { cn } from "../../utils/helpers";

export function QuizAIChat({ current }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, streaming, error: aiError, sendMessage } = useGemini();

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    await sendMessage(text, {
      currentPage: "quiz",
      currentStage: current
        ? `Question about ${current.category}: ${current.question}`
        : null,
    });
  }, [input, streaming, sendMessage, current]);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-surface-dark/70 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 w-80 sm:w-96 flex flex-col shadow-2xl overflow-hidden"
            style={{ height: "460px" }}
            role="dialog"
            aria-modal="false"
            aria-label="Quiz AI assistant"
          >
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-blue-400" />
                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                  ElectoIQ AI
                </span>
                <span className="size-2 rounded-full bg-green-400 animate-pulse" />
              </div>
              <button
                onClick={() => setChatOpen(false)}
                aria-label="Close AI assistant"
                className="text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 dark:text-white/40 text-sm pt-8">
                  <Bot
                    size={32}
                    className="mx-auto mb-2 text-slate-300 dark:text-white/20"
                  />
                  Ask me anything about Indian elections!
                </div>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white/90 rounded-bl-sm"
                    )}
                  >
                    {m.content}
                    {m.streaming && (
                      <span className="inline-block w-1.5 h-4 bg-white/60 animate-pulse ml-0.5 align-middle rounded-sm" />
                    )}
                  </div>
                </div>
              ))}
              {aiError && (
                <p className="text-red-400 text-xs text-center">{aiError}</p>
              )}
            </div>

            {/* Input */}
            <form
              className="flex gap-2 px-3 pb-3 pt-2 border-t border-slate-100 dark:border-white/10"
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about elections…"
                aria-label="Message to quiz AI assistant"
                maxLength={1000}
                className="flex-1 bg-slate-100 dark:bg-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 outline-none focus:ring-1 focus:ring-blue-500/50"
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                aria-label={streaming ? "Sending message" : "Send message"}
                className="size-9 rounded-xl bg-primary flex items-center justify-center text-white disabled:opacity-40 hover:bg-primary-dark transition-colors"
              >
                {streaming ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        aria-label={chatOpen ? "Close AI assistant" : "Open AI assistant"}
        onClick={() => setChatOpen((o) => !o)}
        className="size-14 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-blue-900/50 hover:scale-105 transition-transform"
      >
        {chatOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <Bot size={22} className="text-white" />
        )}
      </button>
    </div>
  );
}
