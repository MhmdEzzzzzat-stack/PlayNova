import type { Metadata } from "next";
import "./globals.css";
import AnalyticsConsent from "./analytics-consent";
import SiteVitals from "./site-vitals";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "PlayNova — العب واكتشف", template: "%s | PlayNova" },
  description: "اكتشف ألعاب متصفح متنوعة على PlayNova. تصفح الألعاب والتصنيفات بالعربية والإنجليزية.",
  applicationName: "PlayNova",
  openGraph: {
    type: "website",
    siteName: "PlayNova",
    title: "PlayNova — العب واكتشف",
    description: "اكتشف ألعاب متصفح متنوعة بالعربية والإنجليزية.",
    url: SITE_URL,
    locale: "ar_EG",
    alternateLocale: ["en_US"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}<AnalyticsConsent /><SiteVitals /></body>
    </html>
  );
}
