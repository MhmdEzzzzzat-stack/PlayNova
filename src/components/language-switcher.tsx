"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function LanguageSwitcher({ locale }: { locale: "ar" | "en" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nextLocale = locale === "ar" ? "en" : "ar";
  const params = new URLSearchParams(searchParams.toString());
  params.set("lang", nextLocale);
  return (
    <Link
      href={`${pathname}?${params.toString()}`}
      hrefLang={nextLocale}
      lang={nextLocale}
      aria-label={locale === "ar" ? "Switch language to English" : "تغيير اللغة إلى العربية"}
      className="language-button"
    >
      {locale === "ar" ? "EN" : "عربي"}
    </Link>
  );
}
