import { Tattoo } from "../types/tattoo";

const CHANNEL_SLUG = "tattoos-for-site-3fa53kdbswk";
const PER_PAGE = 40;

interface ArenaBlock {
  id: number;
  title: string | null;
  description: string | null;
  image?: {
    original?: { url: string };
    large?: { url: string };
    display?: { url: string };
    thumb?: { url: string };
  };
  class: string;
  content?: string;
  source?: { url: string };
  created_at: string;
}

interface ArenaChannelResponse {
  title: string;
  length: number;
  contents: ArenaBlock[];
}

export async function fetchArenaChannel(page: number = 1): Promise<{
  tattoos: Tattoo[];
  totalPages: number;
  totalItems: number;
  channelTitle: string;
}> {
  // Are.na public API — no auth needed for public channels
  const url = `https://api.are.na/v2/channels/${CHANNEL_SLUG}?per=${PER_PAGE}&page=${page}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Are.na API response:", res.status, errText);
    throw new Error(`Are.na API error: ${res.status}`);
  }

  const data: ArenaChannelResponse = await res.json();

  const tattoos: Tattoo[] = (data.contents || [])
    .filter((block) => block.class === "Image" && block.image)
    .map((block) => ({
      id: String(block.id),
      imageUrl:
        block.image!.original?.url ||
        block.image!.large?.url ||
        block.image!.display?.url ||
        "",
      title: block.title || "Untitled",
      style: "",
      description: block.description || undefined,
    }));

  const totalPages = Math.ceil(data.length / PER_PAGE);

  return {
    tattoos,
    totalPages,
    totalItems: data.length,
    channelTitle: data.title,
  };
}

export async function fetchAllArenaTattoos(): Promise<{
  tattoos: Tattoo[];
  totalItems: number;
  channelTitle: string;
}> {
  const firstPage = await fetchArenaChannel(1);

  if (firstPage.totalPages <= 1) {
    return {
      tattoos: firstPage.tattoos,
      totalItems: firstPage.totalItems,
      channelTitle: firstPage.channelTitle,
    };
  }

  const remainingPageNumbers = Array.from(
    { length: firstPage.totalPages - 1 },
    (_, index) => index + 2
  );

  const remainingPages = await Promise.all(
    remainingPageNumbers.map((pageNumber) => fetchArenaChannel(pageNumber))
  );

  return {
    tattoos: [firstPage.tattoos, ...remainingPages.map((p) => p.tattoos)].flat(),
    totalItems: firstPage.totalItems,
    channelTitle: firstPage.channelTitle,
  };
}