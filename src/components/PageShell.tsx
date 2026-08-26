import Nav from "./Nav";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";
import PromoWidget from "./PromoWidget";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {/* Dark background so the transparent fixed header never sits over a white strip */}
      <main style={{ paddingTop: 64, background: "#060d1f" }}>{children}</main>
      <Footer />
      <CookieConsent />
      <PromoWidget />
    </>
  );
}
