import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | PlayNova",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="directory-page" dir="rtl">
      <div className="directory-container">
        <p className="directory-kicker">PlayNova · 404</p>
        <h1>الصفحة غير موجودة</h1>
        <p className="directory-intro">قد يكون الرابط قديمًا أو أن اللعبة لم تعد منشورة. يمكنك العودة للرئيسية أو تصفح التصنيفات المتاحة.</p>
        <div className="related-categories">
          <Link href="/?lang=ar">الرئيسية</Link>
          <Link href="/categories?lang=ar">التصنيفات</Link>
          <Link href="/search?lang=ar">البحث عن لعبة</Link>
        </div>
        <div dir="ltr" lang="en">
          <h2>Page not found</h2>
          <p>This page may have moved or the game may no longer be published. Try the homepage or browse available categories.</p>
          <div className="related-categories">
            <Link href="/?lang=en">Home</Link>
            <Link href="/categories?lang=en">Categories</Link>
            <Link href="/search?lang=en">Search games</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
