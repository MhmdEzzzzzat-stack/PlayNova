import type { Metadata } from "next";
import "./globals.css";
import AnalyticsConsent from "./analytics-consent";
import SiteVitals from "./site-vitals";

export const metadata: Metadata = {
  title: {
    default: "PlayNova — العب واكتشف",
    template: "%s | PlayNova",
  },
  description:
    "اكتشف عالمًا من ألعاب المتصفح. منصة PlayNova قيد التطوير.",
  applicationName: "PlayNova",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}<AnalyticsConsent /><SiteVitals /></body>
    </html>
  );
}
