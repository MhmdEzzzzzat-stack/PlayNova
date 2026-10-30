export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://playnova.mzt112006mzt.workers.dev").replace(/\/$/, "");

export function localizedUrl(path: string, locale: "ar" | "en") {
  const url = new URL(path, SITE_URL);
  url.searchParams.set("lang", locale);
  return url.toString();
}

export function localizedAlternates(path: string, locale: "ar" | "en" = "ar") {
  return {
    canonical: localizedUrl(path, locale),
    languages: {
      ar: localizedUrl(path, "ar"),
      en: localizedUrl(path, "en"),
      "x-default": localizedUrl(path, "ar"),
    },
  };
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
