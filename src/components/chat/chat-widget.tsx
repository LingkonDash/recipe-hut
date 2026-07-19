"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, ChefHat, Trash2 } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  shortDescription: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  recipes?: Recipe[];
  followups?: string[];
  isStreaming?: boolean;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [restoredCount, setRestoredCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem("recipehut_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setMessages(parsed);
          setRestoredCount(parsed.length);
          setHasOpened(true);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      setMessages([
        {
          role: "assistant",
          content: "Hi! Ask me about recipes, ingredients, or what to cook tonight.",
        }
      ]);
    }
  }, [isOpen, hasOpened]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg.isStreaming) {
        localStorage.setItem("recipehut_chat_history", JSON.stringify(messages));
      }
    }
  }, [messages]);

  const clearHistory = () => {
    localStorage.removeItem("recipehut_chat_history");
    setMessages([
      {
        role: "assistant",
        content: "Hi! Ask me about recipes, ingredients, or what to cook tonight.",
      }
    ]);
    setRestoredCount(0);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const assistantMessageIndex = newMessages.length;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", isStreaming: true }
      ]);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      let fullContent = "";
      let recipesText = "";
      let followupsText = "";
      
      setIsTyping(false); // First token arrived

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        
        let displayContent = fullContent;
        let parsedRecipes: Recipe[] | undefined = undefined;
        let parsedFollowups: string[] | undefined = undefined;
        
        const recipesIndex = fullContent.indexOf("\n__RECIPES__:");
        const followupsIndex = fullContent.indexOf("\n__FOLLOWUPS__:");
        
        if (recipesIndex !== -1) {
          displayContent = fullContent.substring(0, recipesIndex);
          const endOfRecipes = followupsIndex !== -1 ? followupsIndex : fullContent.length;
          const rText = fullContent.substring(recipesIndex + "\n__RECIPES__:".length, endOfRecipes);
          try {
            if (rText) parsedRecipes = JSON.parse(rText);
          } catch(e) {}
        }
        
        if (followupsIndex !== -1) {
          if (recipesIndex === -1) {
            displayContent = fullContent.substring(0, followupsIndex);
          }
          const fText = fullContent.substring(followupsIndex + "\n__FOLLOWUPS__:".length);
          try {
            if (fText) parsedFollowups = JSON.parse(fText);
          } catch(e) {}
        }

        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantMessageIndex] = {
            role: "assistant",
            content: displayContent,
            isStreaming: true,
            recipes: parsedRecipes,
            followups: parsedFollowups
          };
          return updated;
        });
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantMessageIndex] = {
          ...updated[assistantMessageIndex],
          isStreaming: false
        };
        return updated;
      });

    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-all z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 w-full h-[100dvh] sm:w-[70vw] sm:h-[70vh] sm:max-w-4xl bg-background sm:rounded-2xl sm:shadow-2xl flex flex-col z-50 transition-all duration-300 transform sm:-translate-x-1/2 sm:-translate-y-1/2 border-0 sm:border border-border ${isOpen ? 'translate-y-0 sm:scale-100 opacity-100' : 'translate-y-full sm:translate-y-0 sm:scale-95 opacity-0 pointer-events-none'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface sm:rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg text-foreground">Recipe Assistant</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearHistory}
              className="p-1.5 text-foreground-muted hover:text-primary hover:bg-background rounded-full transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-foreground-muted hover:text-primary hover:bg-background rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <Fragment key={idx}>
              {idx === restoredCount && restoredCount > 0 && (
                <div className="flex items-center gap-4 my-6 w-full opacity-60">
                  <div className="h-px bg-border flex-1"></div>
                  <span className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest">Previous messages</span>
                  <div className="h-px bg-border flex-1"></div>
                </div>
              )}
              <div className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-sm'
                  : 'bg-surface text-foreground border border-border rounded-tl-sm'
                  }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-sm">
                  {msg.content}
                </div>
              </div>
              
              {msg.recipes && msg.recipes.length > 0 && (
                <div className="mt-2 w-full space-y-2 max-w-[90%]">
                  {msg.recipes.map((recipe) => (
                    <div key={recipe.id} className="p-3 bg-surface border border-border rounded-xl flex flex-col gap-1 shadow-sm">
                      <h4 className="font-semibold text-sm text-foreground line-clamp-1">{recipe.title}</h4>
                      <p className="text-xs text-foreground-muted line-clamp-2">{recipe.shortDescription}</p>
                      <Link
                        href={`/recipes/${recipe.id}`}
                        onClick={() => setIsOpen(false)}
                        className="text-[11px] font-semibold bg-primary text-white px-3 py-1 rounded-full mt-2 hover:bg-primary/90 transition-all duration-200 w-fit inline-flex items-center gap-1 shadow-sm"
                      >
                        View Recipe &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {!msg.isStreaming && msg.followups && msg.followups.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 max-w-[90%]">
                  {msg.followups.map((followup, fIdx) => (
                    <button
                      key={fIdx}
                      onClick={() => sendMessage(followup)}
                      className="text-xs px-3 py-1.5 bg-surface text-foreground-muted rounded-full hover:bg-primary hover:text-white transition-colors border border-border hover:border-primary text-left shadow-sm"
                    >
                      {followup}
                    </button>
                  ))}
                </div>
              )}
            </div>
            </Fragment>
          ))}

          {isTyping && (
            <div className="flex items-start">
              <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center h-10">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-border bg-background sm:rounded-b-2xl shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a recipe..."
              disabled={isTyping || messages[messages.length - 1]?.isStreaming}
              className="flex-1 px-4 py-2 bg-surface border border-border text-foreground placeholder:text-foreground-muted rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping || messages[messages.length - 1]?.isStreaming}
              className="p-2 rounded-full bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--border); border-radius: 9999px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: var(--foreground-muted); }
          .custom-scrollbar { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
        }
      `}} />
    </>
  );
}
