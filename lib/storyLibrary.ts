// lib/storyLibrary.ts
"use client";

import storyData from "@/data/hikaye-kutuphanesi.json";
import type { Scene } from "./sceneDirector";
import { SCENE_BG } from "./sceneDirector";

/**
 * PİKSEL HİKAYELERİ — el yazımı, kalite kontrollü bölüm kütüphanesi.
 * Ders üretiminden (YZ, anlık) AYRI kategori: öğretmen seçer → "Yayınla" der
 * → öğrenci canlı sahneli/sesli "çizgi film" olarak izler (Seviye 1 motoru,
 * ama kalite kontrollü sabit senaryo — otomatik üretim değil).
 *
 * Ödül token DEĞİL: itibar sistemine bağlı rozet/yıldız (cüzdansız mimari).
 */

export interface StoryBeat {
  text: string;
  object: string;
  note?: string; // yönetmen notu — profesyonel prodüksiyon (Seviye 3) için sahne yönergesi
}
export interface StoryEpisode {
  id: string;
  title: string;
  stage: string;
  level?: string; // ya\u015f/s\u0131n\u0131f aral\u0131\u011f\u0131 \u2014 kademe i\u00e7inde daha ince yerle\u015ftirme
  theme: string;
  badge: string;
  beats: StoryBeat[];
}

interface StoryFile {
  version: string;
  episodes: StoryEpisode[];
}

const DATA = storyData as unknown as StoryFile;

export const STORY_EPISODES: StoryEpisode[] = DATA.episodes;

/** Bölümleri kademeye göre grupla (öğretmen panelinde net yerleştirme için). */
export function groupByStage(
  episodes: StoryEpisode[],
): { stage: string; episodes: StoryEpisode[] }[] {
  const map = new Map<string, StoryEpisode[]>();
  for (const ep of episodes) {
    const arr = map.get(ep.stage) ?? [];
    arr.push(ep);
    map.set(ep.stage, arr);
  }
  return Array.from(map.entries()).map(([stage, episodes]) => ({ stage, episodes }));
}

export function getStory(id: string): StoryEpisode | undefined {
  return STORY_EPISODES.find((e) => e.id === id);
}

/** Bölümü LessonPlayer'ın anladığı sahne dizisine çevirir (intro/teach/outro). */
export function episodeToScenes(ep: StoryEpisode): Scene[] {
  const scenes: Scene[] = [
    { kind: "intro", text: ep.title, object: ep.beats[0]?.object ?? "star", bg: 0 },
  ];
  ep.beats.forEach((b, idx) => {
    scenes.push({
      kind: "teach",
      text: b.text,
      object: b.object,
      bg: (idx + 1) % SCENE_BG.length,
    });
  });
  scenes.push({
    kind: "outro",
    text: "Harika! Bu hikayeyi birlikte bitirdik. Piksel seninle gurur duyuyor!",
    object: "heart",
    bg: 2,
  });
  return scenes;
}

// ---------------------------------------------------------------------------
// YAYIN DURUMU — öğretmenin yayınladığı bölümler (cihazda yerel, cüzdansız)
// ---------------------------------------------------------------------------
const PUBLISH_KEY = "piksel-umut.stories.published.v1";

function readPublished(): string[] {
  try {
    const raw = localStorage.getItem(PUBLISH_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
function writePublished(ids: string[]) {
  try {
    localStorage.setItem(PUBLISH_KEY, JSON.stringify(ids));
  } catch {
    /* yoksay */
  }
}

export function getPublishedStoryIds(): string[] {
  return readPublished();
}

export function isStoryPublished(id: string): boolean {
  return readPublished().includes(id);
}

export function toggleStoryPublish(id: string): boolean {
  const cur = readPublished();
  const on = cur.includes(id);
  const next = on ? cur.filter((x) => x !== id) : [...cur, id];
  writePublished(next);
  return !on;
}

export function getPublishedStories(): StoryEpisode[] {
  const ids = new Set(readPublished());
  return STORY_EPISODES.filter((e) => ids.has(e.id));
}
