"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { RecipeCard } from "@/components/ui/recipe-card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Substitution {
  ingredient: string;
  suggestion: string;
}

interface PantryMatch {
  recipeId: string;
  title: string;
  imageUrl: string;
  shortDescription: string;
  calories: number;
  matchPercentage: number;
  missingIngredients: string[];
  substitutions: Substitution[];
  reasoning: string;
  category: string;
  cuisine: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  rating: number;
}

interface ConversationTurn {
  id: number;
  ingredients: string[];
  openingMessage: string;
  bestPickRecipeId?: string;
  comparisonSummary: string;
  matches: PantryMatch[];
  /** Animation phase: 'typing-indicator' → 'opening' → 'cards' → 'comparison' → 'done' */
  phase: "typing-indicator" | "opening" | "cards" | "comparison" | "done";
  /** how many chars of openingMessage are revealed so far */
  revealedChars: number;
  /** how many top-3 cards have started revealing their reasoning */
  cardsRevealed: number;
  /** per-card reasoning char reveal counts (index 0-2 for top 3) */
  cardReasoningChars: [number, number, number];
  /** how many chars of comparisonSummary are revealed */
  comparisonChars: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUGGESTIONS = [
  "Chicken",
  "Rice",
  "Eggs",
  "Onion",
  "Garlic",
  "Tomato",
  "Butter",
  "Flour",
  "Olive oil",
  "Pasta",
];

const TYPING_DELAY_MS = 800; // How long to show the typing indicator
const CHAR_INTERVAL_MS = 18;  // Typewriter speed (ms per char for opening)
const REASONING_CHAR_INTERVAL_MS = 14; // Speed for per-card reasoning
const CARD_STAGGER_MS = 200; // Delay between each top-3 card appearing

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Animated bouncing dots — exactly the chat widget's typing indicator */
function TypingIndicator() {
  return (
    <div className="flex items-start">
      <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center h-10">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
      </div>
    </div>
  );
}

/** Match badge — colour intensity scales with match percentage */
function MatchBadge({ pct }: { pct: number }) {
  const cls =
    pct >= 80
      ? "bg-accent/20 text-accent border-accent/40 font-bold"
      : pct >= 50
      ? "bg-accent/10 text-accent border-accent/20 font-semibold"
      : "bg-border text-foreground-muted border-border font-medium";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${cls}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      {pct}% match
    </span>
  );
}

/** Individual recipe card for top-3 (with animated reasoning + substitutions) */
function Top3Card({
  match,
  rank,
  reasoningChars,
  cardVisible,
  isBestPick,
}: {
  match: PantryMatch;
  rank: number;
  reasoningChars: number;
  cardVisible: boolean;
  isBestPick: boolean;
}) {
  const [subOpen, setSubOpen] = useState(false);
  const visibleReasoning = match.reasoning.slice(0, reasoningChars);
  const reasoningDone = reasoningChars >= match.reasoning.length;

  const recipeObj = {
    _id: match.recipeId,
    title: match.title,
    shortDescription: match.shortDescription,
    imageUrl: match.imageUrl,
    calories: match.calories,
    category: match.category,
    cuisine: match.cuisine,
    prepTimeMinutes: match.prepTimeMinutes,
    cookTimeMinutes: match.cookTimeMinutes,
    rating: match.rating,
    fullDescription: "",
    ingredients: [],
    steps: [],
    servings: 4,
    protein: 0,
    carbs: 0,
    fat: 0,
    priority: 0,
    createdBy: "",
    createdAt: new Date(),
  };

  return (
    <div
      className={`transition-all duration-500 flex flex-col h-full ${
        cardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="group flex flex-col h-full bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 p-4">
        <div className="relative flex-grow">
          {isBestPick && (
            <div className="absolute top-3 left-3 z-10 bg-accent text-white px-2 py-1 rounded text-xs font-bold shadow flex items-center gap-1 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Best Pick
            </div>
          )}
          <RecipeCard recipe={recipeObj} />
        </div>

        {/* Extra pantry additions BELOW the standard card */}
        <div className="space-y-3 pt-4 mt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <MatchBadge pct={match.matchPercentage} />
            <span className="text-xs font-bold text-primary">#{rank}</span>
          </div>

          {match.reasoning && (
            <div className="bg-background border border-border/50 rounded-lg p-2.5 text-xs text-foreground leading-relaxed">
              <span className="font-semibold text-primary block mb-1">AI Reasoning:</span>
              {visibleReasoning}
              {!reasoningDone && (
                <span className="inline-block w-0.5 h-3 bg-primary ml-0.5 animate-pulse align-middle" />
              )}
            </div>
          )}

          {/* Missing ingredients */}
          {match.missingIngredients.length > 0 && (
            <div>
              <p className="text-xs text-foreground-muted font-medium mb-1">Missing:</p>
              <div className="flex flex-wrap gap-1">
                {match.missingIngredients.map((ing) => (
                  <span
                    key={ing}
                    className="inline-block px-2 py-0.5 bg-background border border-border rounded-full text-xs text-foreground-muted"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Substitution accordion — only shown after reasoning finishes */}
          {reasoningDone && match.substitutions.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setSubOpen((o) => !o)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-foreground bg-background hover:bg-surface transition-colors"
                aria-expanded={subOpen}
              >
                <span className="flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  </svg>
                  Substitution ideas
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${subOpen ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {subOpen && (
                <ul className="divide-y divide-border">
                  {match.substitutions.map((sub) => (
                    <li key={sub.ingredient} className="px-3 py-2 bg-surface">
                      <p className="text-xs font-medium text-foreground">{sub.ingredient}</p>
                      <p className="text-xs text-foreground-muted mt-0.5">{sub.suggestion}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conversation turn renderer
// ---------------------------------------------------------------------------

function ConversationTurnView({ turn }: { turn: ConversationTurn }) {
  const top3 = turn.matches.slice(0, 3);

  const openingVisible = turn.openingMessage.slice(0, turn.revealedChars);
  const openingDone = turn.revealedChars >= turn.openingMessage.length;

  const comparisonVisible = turn.comparisonSummary.slice(0, turn.comparisonChars);
  const comparisonDone = turn.comparisonChars >= turn.comparisonSummary.length;
  const showComparison = (turn.phase === "comparison" || turn.phase === "done") && turn.comparisonSummary;

  return (
    <div className="space-y-4">
      {/* User bubble — right-aligned, bg-primary */}
      <div className="flex flex-col items-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-2.5 bg-primary text-white text-sm leading-relaxed">
          <span className="font-semibold">I have: </span>
          {turn.ingredients.join(", ")}
        </div>
      </div>

      {/* Typing indicator */}
      {turn.phase === "typing-indicator" && <TypingIndicator />}

      {/* Opening message bubble */}
      {(turn.phase === "opening" || turn.phase === "cards" || turn.phase === "comparison" || turn.phase === "done") &&
        (turn.openingMessage || turn.error) && (
          <div className="flex flex-col items-start">
            <div className="max-w-[85%] bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-foreground leading-relaxed">
              {turn.error ? (
                <span className="text-foreground-muted">{turn.error}</span>
              ) : (
                <>
                  {openingVisible}
                  {!openingDone && (
                    <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
                  )}
                </>
              )}
            </div>
          </div>
        )}

      {/* Recipe cards + comparison summary — revealed after opening message */}
      {(turn.phase === "cards" || turn.phase === "comparison" || turn.phase === "done") && !turn.error && (
        <div className="space-y-6 pt-2">
          {top3.length > 0 && (
            <div className="flex flex-col gap-6">
              {/* Comparison summary — order-first on mobile (above cards), order-last on desktop (below) */}
              {showComparison && (
                <div className="order-first md:order-last">
                  <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-foreground leading-relaxed">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                      </svg>
                      AI Overview
                    </span>
                    {comparisonVisible}
                    {!comparisonDone && (
                      <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
                    )}
                  </div>
                </div>
              )}

              {/* Cards grid — order-last on mobile (below summary), order-first on desktop */}
              <div className="order-last md:order-first grid grid-cols-1 md:grid-cols-3 gap-6">
                {top3.map((match, i) => (
                  <Top3Card
                    key={match.recipeId}
                    match={match}
                    rank={i + 1}
                    reasoningChars={turn.cardReasoningChars[i] ?? 0}
                    cardVisible={turn.cardsRevealed > i}
                    isBestPick={turn.bestPickRecipeId === match.recipeId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {turn.matches.length === 0 && (
            <div className="text-center py-12 bg-surface border border-border rounded-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-3 text-foreground-muted opacity-50"
              >
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                <line x1="6" x2="18" y1="17" y2="17" />
                <line x1="6" x2="18" y1="13" y2="13" />
              </svg>
              <h3 className="text-base font-bold text-foreground mb-1">No matches found</h3>
              <p className="text-sm text-foreground-muted max-w-xs mx-auto">
                Try adding more common items like{" "}
                <span className="text-foreground font-medium">garlic, onion, eggs, or butter</span>{" "}
                to get results.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function PantryPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const isLoggedIn = !sessionPending && !!session?.user;

  const [inputValue, setInputValue] = useState("");
  const [currentIngredients, setCurrentIngredients] = useState<string[]>([]);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const turnIdRef = useRef(0);

  // Scroll to bottom whenever turns update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  // ---------------------------------------------------------------------------
  // Animation driver: walks a turn through phases using setInterval/setTimeout
  // ---------------------------------------------------------------------------

  const animateTurn = useCallback((turnId: number, data: { openingMessage: string; comparisonSummary: string; matches: PantryMatch[] }) => {
    const { openingMessage, comparisonSummary, matches } = data;
    const top3 = matches.slice(0, 3);

    // Phase 1: show typing indicator for TYPING_DELAY_MS
    setTimeout(() => {
      // Phase 2: switch to opening message typewriter
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turnId ? { ...t, phase: "opening" as const } : t
        )
      );

      if (!openingMessage) {
        // Skip straight to cards
        setTurns((prev) =>
          prev.map((t) =>
            t.id === turnId
              ? { ...t, phase: "cards" as const, revealedChars: 0, cardsRevealed: 1 }
              : t
          )
        );
        startCardsAnimation(turnId, top3, comparisonSummary, 0);
        return;
      }

      // Typewriter for opening message
      let charIdx = 0;
      const openingInterval = setInterval(() => {
        charIdx++;
        setTurns((prev) =>
          prev.map((t) =>
            t.id === turnId ? { ...t, revealedChars: charIdx } : t
          )
        );
        if (charIdx >= openingMessage.length) {
          clearInterval(openingInterval);
          // Move to cards phase
          setTimeout(() => {
            setTurns((prev) =>
              prev.map((t) =>
                t.id === turnId
                  ? { ...t, phase: "cards" as const, cardsRevealed: 1 }
                  : t
              )
            );
            startCardsAnimation(turnId, top3, comparisonSummary, 0);
          }, 300);
        }
      }, CHAR_INTERVAL_MS);
    }, TYPING_DELAY_MS);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function startCardsAnimation(
    turnId: number,
    top3: PantryMatch[],
    comparisonSummary: string,
    cardIndex: number
  ) {
    if (cardIndex >= top3.length) {
      // All top-3 done → start comparison typewriter, then phase done
      if (!comparisonSummary) {
        setTurns((prev) =>
          prev.map((t) =>
            t.id === turnId ? { ...t, phase: "done" as const } : t
          )
        );
        return;
      }
      // Switch to comparison phase and start typewriter
      setTimeout(() => {
        setTurns((prev) =>
          prev.map((t) =>
            t.id === turnId ? { ...t, phase: "comparison" as const } : t
          )
        );
        let charIdx = 0;
        const compInterval = setInterval(() => {
          charIdx++;
          setTurns((prev) =>
            prev.map((t) =>
              t.id === turnId ? { ...t, comparisonChars: charIdx } : t
            )
          );
          if (charIdx >= comparisonSummary.length) {
            clearInterval(compInterval);
            setTurns((prev) =>
              prev.map((t) =>
                t.id === turnId ? { ...t, phase: "done" as const } : t
              )
            );
          }
        }, CHAR_INTERVAL_MS);
      }, 400);
      return;
    }

    const reasoning = top3[cardIndex]?.reasoning ?? "";

    // Reveal this card
    setTurns((prev) =>
      prev.map((t) =>
        t.id === turnId
          ? { ...t, cardsRevealed: cardIndex + 1 }
          : t
      )
    );

    // After stagger, start reasoning typewriter for this card
    setTimeout(() => {
      if (!reasoning) {
        // No reasoning → go straight to next card
        setTimeout(() => startCardsAnimation(turnId, top3, comparisonSummary, cardIndex + 1), CARD_STAGGER_MS);
        return;
      }

      let charIdx = 0;
      const reasoningInterval = setInterval(() => {
        charIdx++;
        setTurns((prev) =>
          prev.map((t) => {
            if (t.id !== turnId) return t;
            const updated: [number, number, number] = [...t.cardReasoningChars] as [number, number, number];
            updated[cardIndex] = charIdx;
            return { ...t, cardReasoningChars: updated };
          })
        );
        if (charIdx >= reasoning.length) {
          clearInterval(reasoningInterval);
          // Move to next card after stagger
          setTimeout(
            () => startCardsAnimation(turnId, top3, comparisonSummary, cardIndex + 1),
            CARD_STAGGER_MS
          );
        }
      }, REASONING_CHAR_INTERVAL_MS);
    }, CARD_STAGGER_MS);
  }

  // ---------------------------------------------------------------------------
  // Ingredient helpers
  // ---------------------------------------------------------------------------

  const addIngredient = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (currentIngredients.some((i) => i.toLowerCase() === lower)) return;
    setCurrentIngredients((prev) => [...prev, trimmed]);
  };

  const removeIngredient = (index: number) => {
    setCurrentIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addIngredient(inputValue);
      setInputValue("");
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      currentIngredients.length > 0
    ) {
      removeIngredient(currentIngredients.length - 1);
    }
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = async () => {
    if (currentIngredients.length === 0 || isLoading) return;

    const ingredientsSnapshot = [...currentIngredients];
    const id = ++turnIdRef.current;

    const newTurn: ConversationTurn = {
      id,
      ingredients: ingredientsSnapshot,
      openingMessage: "",
      comparisonSummary: "",
      matches: [],
      phase: "typing-indicator",
      revealedChars: 0,
      cardsRevealed: 0,
      cardReasoningChars: [0, 0, 0],
      comparisonChars: 0,
    };

    setTurns((prev) => [...prev, newTurn]);
    setIsLoading(true);
    // Clear the input area (keep suggestions available for next round)
    setCurrentIngredients([]);
    setInputValue("");

    try {
      const res = await fetch("/api/pantry-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredientsSnapshot }),
      });

      if (res.status === 401) {
        // Should not happen if the UI gatekeeps, but handle gracefully
        setTurns((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  phase: "opening" as const,
                  openingMessage: "",
                  error: "Please log in to use this feature.",
                  revealedChars: 99999,
                }
              : t
          )
        );
        return;
      }

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();
      const openingMessage: string = data.openingMessage ?? "";
      const bestPickRecipeId: string = data.bestPickRecipeId ?? "";
      const comparisonSummary: string = data.comparisonSummary ?? "";
      const matches: PantryMatch[] = data.matches ?? [];

      // Inject data into the turn
      setTurns((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, openingMessage, bestPickRecipeId, comparisonSummary, matches } : t
        )
      );

      // Kick off animations
      animateTurn(id, { openingMessage, comparisonSummary, matches });
    } catch (err) {
      console.error("Pantry agent error:", err);
      setTurns((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                phase: "opening" as const,
                error: "Something went wrong. Please try again.",
                revealedChars: 99999,
              }
            : t
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const hasConversation = turns.length > 0;

  return (
    <main className="min-h-[80vh] bg-background flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-10 md:py-14 max-w-4xl flex flex-col">

        {/* ── Static page header (hidden once conversation starts) ── */}
        {!hasConversation && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface border border-border mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                <line x1="6" x2="18" y1="17" y2="17" />
                <line x1="6" x2="18" y1="13" y2="13" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              What Can I Cook?
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto leading-relaxed">
              Tell me what&apos;s in your pantry and I&apos;ll reason through the best
              recipes for you — with AI-powered substitution tips for anything you&apos;re
              missing.
            </p>

            {/* Intro placeholder */}
            <div className="mt-10 text-center py-14 border border-dashed border-border rounded-2xl text-foreground-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-3 opacity-40"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <path d="M11 8v6" />
                <path d="M8 11h6" />
              </svg>
              <p className="text-sm">
                Add your ingredients below and press{" "}
                <span className="font-semibold text-foreground">Send</span>
              </p>
            </div>
          </div>
        )}

        {/* ── Conversation history ── */}
        {hasConversation && (
          <div className="flex-1 space-y-10 mb-6">
            {/* Small header persists */}
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                <line x1="6" x2="18" y1="17" y2="17" />
                <line x1="6" x2="18" y1="13" y2="13" />
              </svg>
              <h1 className="font-bold text-lg text-foreground">What Can I Cook?</h1>
            </div>

            {turns.map((turn) => (
              <ConversationTurnView key={turn.id} turn={turn} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {/* ── Input panel (chat-style, always visible) ── */}
        <div
          className={`${hasConversation ? "sticky bottom-4 z-10" : ""}`}
        >
          <div className="bg-surface border border-border rounded-2xl p-4 shadow-lg">
            {/* Quick-add suggestions */}
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTIONS.map((s) => {
                const alreadyAdded = currentIngredients.some(
                  (i) => i.toLowerCase() === s.toLowerCase()
                );
                return (
                  <button
                    key={s}
                    onClick={() => {
                      addIngredient(s);
                      inputRef.current?.focus();
                    }}
                    disabled={alreadyAdded}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      alreadyAdded
                        ? "bg-primary/10 border-primary/30 text-primary/50 cursor-not-allowed"
                        : "bg-background border-border text-foreground-muted hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {alreadyAdded ? "✓ " : "+ "}
                    {s}
                  </button>
                );
              })}
            </div>

            {/* Tag input + send */}
            <div className="flex gap-2 items-end">
              <div
                className="flex-1 flex flex-wrap gap-1.5 p-2.5 bg-background border border-border rounded-xl min-h-[42px] cursor-text focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all"
                onClick={() => inputRef.current?.focus()}
                id="pantry-tag-input"
              >
                {currentIngredients.map((ing, idx) => (
                  <span
                    key={`${ing}-${idx}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/30 text-primary rounded-full text-xs font-medium"
                  >
                    {ing}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeIngredient(idx);
                      }}
                      className="hover:text-primary/60 transition-colors"
                      aria-label={`Remove ${ing}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}
                <input
                  ref={inputRef}
                  id="pantry-ingredient-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder={
                    currentIngredients.length === 0
                      ? "Type an ingredient and press Enter…"
                      : "Add another…"
                  }
                  className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-foreground placeholder:text-foreground-muted disabled:opacity-50"
                />
              </div>

              {/* Send / Login button */}
              {isLoggedIn || sessionPending ? (
                <button
                  id="find-recipes-btn"
                  onClick={handleSubmit}
                  disabled={currentIngredients.length === 0 || isLoading}
                  className="flex-shrink-0 p-2.5 rounded-xl bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-colors"
                  aria-label="Find recipes"
                >
                  {isLoading ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                    </svg>
                  )}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
                  id="find-recipes-btn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Log in to search
                </Link>
              )}
            </div>

            <p className="text-xs text-foreground-muted mt-2">
              Press{" "}
              <kbd className="px-1 py-0.5 rounded border border-border bg-background font-mono">
                Enter
              </kbd>{" "}
              or{" "}
              <kbd className="px-1 py-0.5 rounded border border-border bg-background font-mono">
                ,
              </kbd>{" "}
              to add a tag · Backspace removes the last one
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
