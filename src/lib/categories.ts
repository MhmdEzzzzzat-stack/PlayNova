export type Locale = "ar" | "en";
export type CategoryDefinition = {
  slug: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
};

export const categories: CategoryDefinition[] = [
  { slug: "action", name: { ar: "أكشن", en: "Action" }, description: { ar: "ألعاب مليئة بالتحدي والحركة والقتال.", en: "Fast-paced games built around challenges, movement, and combat." } },
  { slug: "adventure", name: { ar: "مغامرات", en: "Adventure" }, description: { ar: "استكشف عوالم جديدة وخض تجارب ومهام متنوعة.", en: "Explore new worlds, stories, and exciting quests." } },
  { slug: "racing", name: { ar: "سباق", en: "Racing" }, description: { ar: "تحديات السرعة والقيادة والمنافسة على المركز الأول.", en: "Speed, driving challenges, and races for the top spot." } },
  { slug: "sports", name: { ar: "رياضة", en: "Sports" }, description: { ar: "ألعاب رياضية وتحديات مستوحاة من المنافسات.", en: "Sports games and challenges inspired by competition." } },
  { slug: "football", name: { ar: "كرة القدم", en: "Football" }, description: { ar: "ألعاب كرة القدم والمهارات والتسديد.", en: "Football games, skills, matches, and shooting challenges." } },
  { slug: "puzzle", name: { ar: "ألغاز", en: "Puzzle" }, description: { ar: "اختبر التفكير والمنطق وحل الألغاز.", en: "Test your logic and solve clever puzzles." } },
  { slug: "shooting", name: { ar: "تصويب", en: "Shooting" }, description: { ar: "ألعاب التصويب والدقة وردود الفعل.", en: "Aim, react, and take on shooting challenges." } },
  { slug: "multiplayer", name: { ar: "متعددة اللاعبين", en: "Multiplayer" }, description: { ar: "العب وتنافس مع لاعبين آخرين.", en: "Play and compete with other players." } },
  { slug: "two-player", name: { ar: "لاعبان", en: "Two Player" }, description: { ar: "تحديات ممتعة لشخصين على جهاز واحد.", en: "Fun head-to-head games for two players." } },
  { slug: "simulation", name: { ar: "محاكاة", en: "Simulation" }, description: { ar: "جرّب محاكاة الأنشطة والوظائف والعوالم.", en: "Try simulations of activities, jobs, and worlds." } },
  { slug: "horror", name: { ar: "رعب", en: "Horror" }, description: { ar: "أجواء مشوقة وتجارب مليئة بالتوتر.", en: "Atmospheric experiences full of suspense." } },
  { slug: "casual", name: { ar: "خفيفة", en: "Casual" }, description: { ar: "ألعاب سهلة وسريعة تناسب أوقات الاستراحة.", en: "Easy-to-pick-up games for a quick break." } },
  { slug: "idle", name: { ar: "خمولية", en: "Idle" }, description: { ar: "تقدم تدريجي وتطوير مستمر حتى دون لعب متواصل.", en: "Progress and upgrades that continue with minimal input." } },
  { slug: "platformer", name: { ar: "منصات", en: "Platformer" }, description: { ar: "اقفز وتحرك وتجاوز العقبات بين المراحل.", en: "Jump, move, and overcome obstacles across levels." } },
  { slug: "3d-games", name: { ar: "ألعاب ثلاثية الأبعاد", en: "3D Games" }, description: { ar: "اكتشف ألعابًا بتجارب وعوالم ثلاثية الأبعاد.", en: "Explore games built around 3D worlds and experiences." } }
];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getLocale(value: string | string[] | undefined): Locale {
  return value === "en" ? "en" : "ar";
}

export function normalizeSearchTerm(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[ـ]/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

export function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d{1,4}$/.test(raw)) return 1;
  return Math.max(1, Math.min(1000, Number(raw)));
}
