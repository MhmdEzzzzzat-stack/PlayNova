"use client";

import { useEffect } from "react";

export default function LocaleDocument({ locale }: { locale: "ar" | "en" }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
