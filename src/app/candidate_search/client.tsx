"use client";

/**
 * Candidate Search Client Component
 *
 * Implements a chat-centric search interface with:
 * - Natural language input
 * - Real-time entity extraction with visual feedback
 * - Context tags showing detected entities
 *
 * @since 2026-01-17
 * @see Issue #72: US-007
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowUp, Briefcase, MapPin, Clock, Cpu, Building2, Factory } from "lucide-react";
import type { ExtractedIntent } from "@/lib/entity-extraction";
import type { RoleArchetype } from "@/lib/archetype-weights";
import type { SeniorityLevel } from "@/lib/seniority-thresholds";

// ============================================================================
// Types
// ============================================================================

interface ExtractionResult {
  intent: ExtractedIntent;
  archetype: RoleArchetype | null;
  seniority: SeniorityLevel | null;
  processingTimeMs: number;
}

interface ContextTag {
  label: string;
  value: string | null;
  icon: React.ReactNode;
  isActive: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const EXAMPLE_QUERY =
  "Software Engineers in NYC with 3+ years of experience, skilled in React and Node, has experience with ML / LLMs and working at an early stage VC backed startup";

const DEBOUNCE_MS = 300;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Formats seniority level for display
 */
function formatSeniority(seniority: SeniorityLevel | null): string | null {
  if (!seniority) return null;
  const map: Record<SeniorityLevel, string> = {
    JUNIOR: "Junior (0-2 yrs)",
    MID: "Mid-level (3-5 yrs)",
    SENIOR: "Senior (6+ yrs)",
  };
  return map[seniority] || seniority;
}

/**
 * Formats archetype for display
 */
function formatArchetype(archetype: RoleArchetype | null): string | null {
  if (!archetype) return null;
  const map: Record<RoleArchetype, string> = {
    SENIOR_FRONTEND_ENGINEER: "Frontend Engineer",
    SENIOR_BACKEND_ENGINEER: "Backend Engineer",
    FULLSTACK_ENGINEER: "Fullstack Engineer",
    ENGINEERING_MANAGER: "Engineering Manager",
    TECH_LEAD: "Tech Lead",
    DEVOPS_ENGINEER: "DevOps Engineer",
    DATA_ENGINEER: "Data Engineer",
    GENERAL_SOFTWARE_ENGINEER: "Software Engineer",
  };
  return map[archetype] || archetype;
}

// ============================================================================
// Main Component
// ============================================================================

export function CandidateSearchClient() {
  const [query, setQuery] = useState("");
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced entity extraction
  const extractEntities = useCallback(async (text: string) => {
    if (!text.trim()) {
      setExtraction(null);
      return;
    }

    setIsExtracting(true);
    try {
      const response = await fetch("/api/search/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });

      if (response.ok) {
        const data: ExtractionResult = await response.json();
        setExtraction(data);
      }
    } catch (error) {
      console.error("Entity extraction failed:", error);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  // Handle input change with debounced extraction
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timer for entity extraction
    debounceRef.current = setTimeout(() => {
      extractEntities(value);
    }, DEBOUNCE_MS);
  };

  // Handle search submission
  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    // TODO: Implement actual search functionality when candidate search service is integrated
    // For now, we'll just simulate a search
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSearching(false);

    // In a real implementation, this would navigate to search results or display them
    console.log("Search query:", query);
    console.log("Extracted entities:", extraction);
  };

  // Handle Enter key to search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  // Build context tags from extraction
  const contextTags: ContextTag[] = [
    {
      label: "Job Title",
      value: extraction?.archetype
        ? formatArchetype(extraction.archetype)
        : extraction?.intent.job_title ?? null,
      icon: <Briefcase size={14} />,
      isActive: !!(extraction?.intent.job_title || extraction?.archetype),
    },
    {
      label: "Location",
      value: extraction?.intent.location ?? null,
      icon: <MapPin size={14} />,
      isActive: !!extraction?.intent.location,
    },
    {
      label: "Experience",
      value: extraction?.seniority
        ? formatSeniority(extraction.seniority)
        : extraction?.intent.years_experience
          ? `${extraction.intent.years_experience}+ years`
          : null,
      icon: <Clock size={14} />,
      isActive: !!(extraction?.intent.years_experience || extraction?.seniority),
    },
    {
      label: "Skills",
      value:
        extraction?.intent.skills && extraction.intent.skills.length > 0
          ? extraction.intent.skills.join(", ")
          : null,
      icon: <Cpu size={14} />,
      isActive: !!(extraction?.intent.skills && extraction.intent.skills.length > 0),
    },
    {
      label: "Industry",
      value:
        extraction?.intent.industry && extraction.intent.industry.length > 0
          ? extraction.intent.industry.join(", ")
          : null,
      icon: <Factory size={14} />,
      isActive: !!(extraction?.intent.industry && extraction.intent.industry.length > 0),
    },
    {
      label: "Company Type",
      value:
        extraction?.intent.company_type && extraction.intent.company_type.length > 0
          ? extraction.intent.company_type.join(", ")
          : null,
      icon: <Building2 size={14} />,
      isActive: !!(
        extraction?.intent.company_type && extraction.intent.company_type.length > 0
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-foreground px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Candidate Search</h1>
          <span className="text-sm text-muted-foreground font-mono">BETA</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">
          {/* Greeting */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-3">
              Hi there, please describe the profile you&apos;re looking for.
            </h2>
            <p className="text-muted-foreground">
              Type a natural language description of your ideal candidate
            </p>
          </div>

          {/* Search input */}
          <div className="relative mb-6">
            <textarea
              ref={inputRef}
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={EXAMPLE_QUERY}
              rows={4}
              className="w-full px-4 py-4 pr-16 border-2 border-foreground bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary resize-none font-sans"
              disabled={isSearching}
            />
            {/* Send button - positioned inside the textarea */}
            <button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="absolute bottom-4 right-4 w-10 h-10 flex items-center justify-center bg-purple-600 text-white border-2 border-foreground hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Search"
            >
              {isSearching ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <ArrowUp size={20} />
              )}
            </button>
          </div>

          {/* Context tags */}
          <div className="border-2 border-foreground bg-background p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Detected Entities
              </span>
              {isExtracting && (
                <span className="w-2 h-2 bg-secondary animate-pulse" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {contextTags.map((tag) => (
                <ContextTagBadge key={tag.label} tag={tag} />
              ))}
            </div>
          </div>

          {/* Processing time indicator */}
          {extraction && (
            <div className="mt-4 text-center">
              <span className="text-xs font-mono text-muted-foreground">
                Extracted in {extraction.processingTimeMs}ms
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-foreground px-6 py-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <span className="font-mono">Powered by AI entity extraction</span>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// Context Tag Component
// ============================================================================

interface ContextTagBadgeProps {
  tag: ContextTag;
}

function ContextTagBadge({ tag }: ContextTagBadgeProps) {
  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 border-2 transition-colors
        ${
          tag.isActive
            ? "border-foreground bg-secondary text-secondary-foreground"
            : "border-muted-foreground/30 bg-muted/20 text-muted-foreground"
        }
      `}
    >
      <span className={tag.isActive ? "text-secondary-foreground" : "text-muted-foreground"}>
        {tag.icon}
      </span>
      <div className="flex flex-col">
        <span className="text-xs font-mono uppercase tracking-wider opacity-70">
          {tag.label}
        </span>
        <span className={`text-sm font-medium ${tag.isActive ? "" : "opacity-50"}`}>
          {tag.value || "Not detected"}
        </span>
      </div>
    </div>
  );
}
