import { useState, useEffect } from "react";
import { Search, Plus, X, Loader2, Sparkles, SlidersHorizontal } from "lucide-react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Header from "../components/Header";
import { storage } from "../utils/storage";
import { Tattoo } from "../types/tattoo";
import { fetchAllArenaTattoos } from "../utils/arena";
import { projectId, publicAnonKey } from "/utils/supabase/info";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTattoo, setSelectedTattoo] = useState<Tattoo | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"new" | "titleAsc" | "titleDesc">("new");
  const [tattoos, setTattoos] = useState<Tattoo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelTitle, setChannelTitle] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState("");
  const [communityTattoos, setCommunityTattoos] = useState<Tattoo[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTattoos();
    loadCommunityPosts();
  }, []);

  const loadCommunityPosts = () => {
    const posts = storage.getCommunityPosts();
    const communityAsTattoos: Tattoo[] = posts.map((p) => ({
      id: p.id,
      imageUrl: p.tattooImageUrl,
      title: p.title,
      style: "Community",
      description: p.description,
      keywords: ["Community"],
      labels: [],
      colors: [],
      sizes: [],
    }));
    setCommunityTattoos(communityAsTattoos);
  };

  const loadTattoos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllArenaTattoos();
      setTattoos(data.tattoos);
      setChannelTitle(data.channelTitle);
      // Auto-analyze after loading
      analyzeTattoos(data.tattoos);
    } catch (err) {
      console.error("Failed to fetch Are.na channel:", err);
      setError("Failed to load tattoos from Are.na. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeTattoos = async (tattoosToAnalyze: Tattoo[]) => {
    // Filter out community posts (already tagged) and tattoos with base64 data URLs (too large for API)
    const filterable = tattoosToAnalyze.filter(
      (t) => !t.id.startsWith("community-") && !t.imageUrl.startsWith("data:")
    );
    if (filterable.length === 0) return;

    setAnalyzing(true);
    setAnalyzeProgress(`Analyzing ${filterable.length} tattoos with AI...`);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e9727658/analyze-tattoos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            tattoos: filterable.map((t) => ({
              id: t.id,
              imageUrl: t.imageUrl,
              title: t.title,
            })),
          }),
        }
      );
      const data = await res.json();
      console.log("Analyze tattoos response:", JSON.stringify(data).slice(0, 500));
      if (!res.ok) {
        console.error("Analyze tattoos error:", data);
        setAnalyzeProgress(`AI analysis failed: ${data.error || 'unknown error'}`);
        return;
      }

      // Merge AI tags into tattoo objects
      const results = data.results as Record<string, {
        title: string;
        description: string;
        keywords: string[];
        labels: string[];
        colors: string[];
        sizes: string[];
      }>;

      setTattoos((prev) =>
        prev.map((t) => {
          const ai = results[t.id];
          if (!ai) return t;
          return {
            ...t,
            title: ai.title || t.title,
            description: ai.description || t.description,
            keywords: ai.keywords || [],
            labels: ai.labels || [],
            colors: ai.colors || [],
            sizes: ai.sizes || [],
          };
        })
      );

      const count = Object.keys(results).length;
      setAnalyzeProgress(`AI analyzed ${count} tattoos`);
    } catch (err) {
      console.error("Analyze tattoos fetch error:", err);
      setAnalyzeProgress("AI analysis failed - network error");
    } finally {
      setAnalyzing(false);
      // Clear progress message after 4 seconds
      setTimeout(() => setAnalyzeProgress(""), 4000);
    }
  };

  const handleSaveTattoo = (tattoo: Tattoo) => {
    storage.saveLibraryItem({
      ...tattoo,
      savedAt: new Date().toISOString(),
    });
    setSelectedTattoo(null);
  };

  const filters = {
    keywords: ["Fine Line", "Neo Traditional", "American Traditional", "Blackwork", "Japanese", "Realism"],
    labels: ["Skull", "Heart", "Snake", "Flower", "Animal", "Bird", "Dragon", "Butterfly", "Eye"],
    colors: ["Black and White", "Colored"],
    sizes: ["Small", "Medium", "Large"],
  };

  const normalizeColorTag = (value: string) => {
    const normalized = value.toLowerCase().trim();
    if (
      normalized === "black & grey" ||
      normalized === "black and grey" ||
      normalized === "black and white" ||
      normalized === "black & white" ||
      normalized === "blackwork"
    ) {
      return "black and white";
    }
    if (
      normalized === "color" ||
      normalized === "full color" ||
      normalized === "colored" ||
      normalized === "colour" ||
      normalized === "coloured"
    ) {
      return "colored";
    }
    return normalized;
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const filteredTattoos = [...tattoos, ...communityTattoos]
    .filter((tattoo) => {
      // Build searchable text from all AI-generated tags
      const allTags = [
        tattoo.title,
        tattoo.description || "",
        ...(tattoo.keywords || []),
        ...(tattoo.labels || []),
        ...(tattoo.colors || []),
        ...(tattoo.sizes || []),
      ].join(" ").toLowerCase();

      // Search query filter
      if (searchQuery && !allTags.includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Selected tag filters - match against structured AI tags
      if (selectedFilters.length > 0) {
        const tattooTags = [
          ...(tattoo.keywords || []),
          ...(tattoo.labels || []),
          ...(tattoo.colors || []),
          ...(tattoo.sizes || []),
        ];

        const normalizedTattooTags = tattooTags.map((tag) => normalizeColorTag(tag));
        const matchesAny = selectedFilters.some(
          (filter) => {
            const normalizedFilter = normalizeColorTag(filter);
            return (
              normalizedTattooTags.some((tag) => tag === normalizedFilter) ||
              allTags.includes(normalizedFilter)
            );
          }
        );
        if (!matchesAny) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "titleAsc") return a.title.localeCompare(b.title);
      if (sortBy === "titleDesc") return b.title.localeCompare(a.title);
      return 0;
    });

  // Derive the latest version of the selected tattoo from the tattoos array
  const currentSelectedTattoo = selectedTattoo
    ? [...tattoos, ...communityTattoos].find((t) => t.id === selectedTattoo.id) || selectedTattoo
    : null;

  return (
    <div className="min-h-screen bg-black pb-28 text-white md:pb-12 md:pl-[7.25rem]">
      <Header title="Explore Tattoos" />

      <div className="mx-auto max-w-7xl px-4 mt-6">
        {/* Channel info */}
        {channelTitle && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="rounded-full border border-white/40 bg-white px-3 py-1 text-xs font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)]">
              Are.na
            </span>
            <span className="celestial-muted text-sm font-sans font-semibold text-white/70">
              Channel: <strong>{channelTitle}</strong>
            </span>
            {(analyzing || analyzeProgress) && (
              <span className="celestial-chip flex items-center gap-1 rounded-full border border-white/25 bg-neutral-950 px-3 py-1 text-xs font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]">
                {analyzing && <Loader2 className="h-3 w-3 animate-spin" />}
                {!analyzing && <Sparkles className="h-3 w-3" />}
                {analyzeProgress}
              </span>
            )}
          </div>
        )}

        {/* Search, Filter, and Sort */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
              <input
                type="text"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/25 bg-neutral-950 py-2 pl-10 pr-4 font-['Fugaz_One:Regular',sans-serif] text-white placeholder-white/45 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-lg border border-white/25 px-4 py-2 font-['Fugaz_One:Regular',sans-serif] text-sm shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)] ${
                showFilters || selectedFilters.length > 0
                  ? "bg-white text-black"
                  : "bg-neutral-950 text-white"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters {selectedFilters.length > 0 ? `(${selectedFilters.length})` : ""}
            </button>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSortBy("new")}
                className={`rounded-lg border border-white/25 px-4 py-2 font-['Fugaz_One:Regular',sans-serif] text-sm shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)] ${
                  sortBy === "new" ? "bg-white text-black" : "bg-neutral-950 text-white"
                }`}
              >
                Default
              </button>
              <button
                onClick={() => setSortBy("titleAsc")}
                className={`rounded-lg border border-white/25 px-4 py-2 font-['Fugaz_One:Regular',sans-serif] text-sm shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)] ${
                  sortBy === "titleAsc" ? "bg-white text-black" : "bg-neutral-950 text-white"
                }`}
              >
                A-Z
              </button>
              <button
                onClick={() => setSortBy("titleDesc")}
                className={`rounded-lg border border-white/25 px-4 py-2 font-['Fugaz_One:Regular',sans-serif] text-sm shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)] ${
                  sortBy === "titleDesc" ? "bg-white text-black" : "bg-neutral-950 text-white"
                }`}
              >
                Z-A
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="rounded-lg border border-white/20 bg-neutral-950 p-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]">
              <h3 className="celestial-label mb-3 font-['Fugaz_One:Regular',sans-serif] text-lg">Keywords</h3>
              <div className="mb-4 flex flex-wrap gap-2">
                {filters.keywords.map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => toggleFilter(keyword)}
                    className={`rounded-full border border-white/25 px-3 py-1 text-sm font-['Fugaz_One:Regular',sans-serif] ${
                      selectedFilters.includes(keyword)
                        ? "celestial-chip--active bg-white text-black"
                        : "celestial-chip bg-black text-white"
                    }`}
                  >
                    {keyword} {selectedFilters.includes(keyword) && "\u00d7"}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h3 className="celestial-label mb-2 font-['Fugaz_One:Regular',sans-serif] text-lg">Label</h3>
                  <div className="space-y-2">
                    {filters.labels.map((label) => (
                      <label key={label} className="flex items-center gap-2 font-sans">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(label)}
                          onChange={() => toggleFilter(label)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm font-semibold leading-tight tracking-normal">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="celestial-label mb-2 font-['Fugaz_One:Regular',sans-serif] text-lg">Color</h3>
                  <div className="space-y-2">
                    {filters.colors.map((color) => (
                      <label key={color} className="flex items-center gap-2 font-sans">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(color)}
                          onChange={() => toggleFilter(color)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm font-semibold leading-tight tracking-normal">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="celestial-label mb-2 font-['Fugaz_One:Regular',sans-serif] text-lg">Size</h3>
                  <div className="space-y-2">
                    {filters.sizes.map((size) => (
                      <label key={size} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(size)}
                          onChange={() => toggleFilter(size)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {selectedFilters.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="celestial-label text-sm font-['Fugaz_One:Regular',sans-serif] text-white/80">Active:</span>
            {selectedFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => toggleFilter(filter)}
                className="celestial-chip--active rounded-full border border-white/30 bg-white px-3 py-1 text-xs font-['Fugaz_One:Regular',sans-serif] text-black"
              >
                {filter} &times;
              </button>
            ))}
            <button
              onClick={() => setSelectedFilters([])}
              className="text-xs underline text-white/60"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/60 bg-red-950 p-4">
            <p className="font-['Fugaz_One:Regular',sans-serif] text-sm text-red-100">{error}</p>
            <button
              onClick={() => loadTattoos()}
              className="mt-2 rounded-lg border border-white/30 bg-white px-4 py-2 text-sm font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.15)]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <>
            <ResponsiveMasonry key={`${searchQuery}-${selectedFilters.join(",")}-${sortBy}`} columnsCountBreakPoints={{ 350: 2, 750: 3, 900: 4 }}>
              <Masonry gutter="16px">
                {filteredTattoos.map((tattoo) => (
                  <div
                    key={tattoo.id}
                    className="group relative cursor-pointer overflow-hidden rounded-lg border border-white/25 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.12)]"
                    onClick={() => setSelectedTattoo(tattoo)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={tattoo.imageUrl}
                        alt={tattoo.title}
                        className="w-full object-cover"
                        style={{ minHeight: "140px", maxHeight: "320px" }}
                        loading="lazy"
                      />
                      {tattoo.style === "Community" && (
                        <span className="absolute top-2 left-2 rounded-full border border-white/30 bg-black px-2 py-0.5 text-xs font-['Fugaz_One:Regular',sans-serif] text-white shadow-[1px_1px_0px_0px_rgba(255,255,255,0.15)]">
                          Community
                        </span>
                      )}
                    </div>
                    <div className="border-t border-white/15 bg-black p-2">
                <p className="celestial-body font-['Fugaz_One:Regular',sans-serif] text-sm text-white truncate">
                        {tattoo.title}
                      </p>
                    </div>
                    <button className="absolute bottom-12 right-2 rounded-full bg-white p-2 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      <Plus className="h-5 w-5 text-black" />
                    </button>
                  </div>
                ))}
              </Masonry>
            </ResponsiveMasonry>

            {/* Empty state */}
            {filteredTattoos.length === 0 && !loading && (
              <div className="flex h-48 items-center justify-center">
                <p className="font-['Fugaz_One:Regular',sans-serif] text-white/50">
                  {selectedFilters.length > 0 && analyzing
                    ? "Tag analysis is still running. Results will appear shortly."
                    : searchQuery || selectedFilters.length > 0
                    ? "No designs match your filters."
                    : "No images found in this channel."}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {currentSelectedTattoo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-white/20 bg-neutral-950 p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.12)]">
            <button
              onClick={() => setSelectedTattoo(null)}
              className="absolute right-4 top-4 z-10"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <div className="mb-4 overflow-hidden rounded-lg border border-white/20">
              <img
                src={currentSelectedTattoo.imageUrl}
                alt={currentSelectedTattoo.title}
                className="w-full max-h-96 object-contain bg-black"
              />
            </div>
            <h2 className="mb-2 font-['Fugaz_One:Regular',sans-serif] text-2xl text-white">
              {currentSelectedTattoo.title}
            </h2>

            {/* AI Description */}
            {currentSelectedTattoo.description && (
              <div className="mb-4 rounded-lg border border-white/15 bg-black p-3">
                <p className="text-xs font-['Fugaz_One:Regular',sans-serif] text-white/70 mb-1">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  AI Description
                </p>
                <p className="celestial-muted text-sm text-white/80">{currentSelectedTattoo.description}</p>
              </div>
            )}

            {/* AI Tags */}
            {(currentSelectedTattoo.keywords?.length || currentSelectedTattoo.labels?.length || currentSelectedTattoo.colors?.length || currentSelectedTattoo.sizes?.length) ? (
              <div className="mb-4 flex flex-wrap gap-1">
                {currentSelectedTattoo.keywords?.map((k) => (
                  <span key={k} className="rounded-full border border-white/20 bg-white px-2 py-0.5 text-xs text-black">{k}</span>
                ))}
                {currentSelectedTattoo.labels?.map((l) => (
                  <span key={l} className="rounded-full border border-white/20 bg-neutral-950 px-2 py-0.5 text-xs text-white">{l}</span>
                ))}
                {currentSelectedTattoo.colors?.map((c) => (
                  <span key={c} className="rounded-full border border-white/20 bg-black px-2 py-0.5 text-xs text-white">{c}</span>
                ))}
                {currentSelectedTattoo.sizes?.map((s) => (
                  <span key={s} className="rounded-full border border-white/20 bg-white px-2 py-0.5 text-xs text-black">{s}</span>
                ))}
              </div>
            ) : null}

            <div className="flex gap-4">
              <button
                onClick={() => setSelectedTattoo(null)}
                className="flex-1 rounded-lg border border-white/25 bg-black py-3 font-['Fugaz_One:Regular',sans-serif] text-white shadow-[2px_4px_0px_0px_rgba(255,255,255,0.12)]"
              >
                Close
              </button>
              <button
                onClick={() => handleSaveTattoo(currentSelectedTattoo)}
                className="flex-1 rounded-lg border border-white/25 bg-white py-3 font-['Fugaz_One:Regular',sans-serif] text-black shadow-[2px_4px_0px_0px_rgba(255,255,255,0.15)]"
              >
                Add to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}