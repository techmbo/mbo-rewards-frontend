"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { NAV_MENUS, NAV_LINKS, NAV_CTAS, SEARCH_ENABLED, NavMenu } from "@/lib/navigation";

// Small inline icon set (16px stroke icons) — no icon library needed.
function Icon({ name, size = 17 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
    boxes: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    workflow: <><circle cx="5" cy="6" r="3" /><path d="M8 6h8" /><circle cx="19" cy="6" r="3" /><path d="M19 9v4a2 2 0 0 1-2 2H7" /><circle cx="5" cy="18" r="3" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></>,
    bank: <><line x1="3" y1="21" x2="21" y2="21" /><line x1="5" y1="21" x2="5" y2="10" /><line x1="9" y1="21" x2="9" y2="10" /><line x1="15" y1="21" x2="15" y2="10" /><line x1="19" y1="21" x2="19" y2="10" /><polygon points="12 2 20 7 4 7" /></>,
    smartphone: <><rect x="7" y="2" width="10" height="20" rx="2" /><line x1="11" y1="18" x2="13" y2="18" /></>,
    wallet: <><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /><path d="M18 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" /><circle cx="17" cy="14" r="1" /></>,
    grid: <><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></>,
    umbrella: <><path d="M22 12a10 10 0 0 0-20 0z" /><path d="M12 12v7a2 2 0 0 0 4 0" /><line x1="12" y1="2" x2="12" y2="3" /></>,
    award: <><circle cx="12" cy="9" r="6" /><polyline points="9 14.5 8 22 12 20 16 22 15 14.5" /></>,
    sparkles: <><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" /><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></>,
    code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
    info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
    help: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    building: <><rect x="4" y="2" width="16" height="20" rx="1" /><line x1="9" y1="7" x2="10" y2="7" /><line x1="14" y1="7" x2="15" y2="7" /><line x1="9" y1="12" x2="10" y2="12" /><line x1="14" y1="12" x2="15" y2="12" /><path d="M10 22v-4h4v4" /></>,
    terminal: <><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></>,
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] ?? paths.layers}
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function menuItems(menu: NavMenu) {
  return menu.groups.flatMap(g => g.items);
}

function isMenuActive(menu: NavMenu, pathname: string): boolean {
  const hrefs = [...menuItems(menu).map(i => i.href), menu.hero?.href].filter(Boolean) as string[];
  return hrefs.some(href => {
    const base = href.split("#")[0] || "/";
    return base === "/" ? pathname === "/" && href !== "/#faq" : pathname === base || pathname.startsWith(`${base}/`);
  });
}

// Mega menu panel for one top-level section.
function MegaMenu({ menu, onNavigate }: { menu: NavMenu; onNavigate: () => void }) {
  const twoCol = menu.groups.length > 1 || menuItems(menu).length > 5;
  return (
    <div
      className="mega-panel"
      role="menu"
      aria-label={menu.label}
      style={{
        position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
        paddingTop: 10, zIndex: 60,
      }}
    >
      <div style={{
        width: menu.hero ? 640 : twoCol ? 580 : 400,
        borderRadius: 14,
        border: "1px solid rgba(168,207,240,0.16)",
        background: "rgba(9,18,42,0.97)",
        backdropFilter: "blur(20px) saturate(1.3)",
        boxShadow: "0 24px 64px rgba(6,13,31,0.7), inset 0 1px 0 rgba(168,207,240,0.08)",
        padding: 10,
        overflow: "hidden",
      }}>
        <p style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(201,162,39,0.75)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "8px 12px 10px" }}>
          {menu.tagline}
        </p>

        {/* Hero card — the visual centrepiece of the menu, with its own CTA */}
        {menu.hero && (
          <a href={menu.hero.href} role="menuitem" onClick={onNavigate} className="mega-item"
            style={{
              display: "flex", gap: 16, alignItems: "center", textDecoration: "none",
              padding: "22px 22px", borderRadius: 12, marginBottom: 12,
              border: "1px solid rgba(201,162,39,0.45)",
              background: "linear-gradient(135deg, rgba(232,197,90,0.16), rgba(41,82,168,0.12))",
            }}>
            <span style={{
              width: 58, height: 58, borderRadius: 14, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, rgba(232,197,90,0.25), rgba(201,162,39,0.15))",
              border: "1px solid rgba(201,162,39,0.4)", color: "#e8c55a",
            }}>
              <Icon name={menu.hero.icon} size={28} />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontFamily: "var(--font-jakarta)", fontSize: 17, fontWeight: 800, color: "#e8c55a", marginBottom: 5 }}>
                {menu.hero.label}
                {menu.hero.badge && (
                  <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", padding: "2px 7px", borderRadius: 99, background: "rgba(201,162,39,0.25)", color: "#f0d47a", verticalAlign: "1px" }}>{menu.hero.badge}</span>
                )}
              </span>
              <span style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 12 }}>{menu.hero.description}</span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: "var(--font-jakarta)", fontSize: 12.5, fontWeight: 700,
                padding: "9px 20px", borderRadius: 8,
                background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e",
              }}>
                {menu.hero.cta} →
              </span>
            </span>
          </a>
        )}

        {/* Grouped items */}
        <div style={{ display: "grid", gridTemplateColumns: menu.groups.length > 1 ? "1fr 1fr" : "1fr", gap: 10 }}>
          {menu.groups.map((group, gi) => (
            <div key={group.label ?? gi}>
              {group.label && (
                <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(168,207,240,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "6px 12px 6px" }}>
                  {group.label}
                </p>
              )}
              <div style={{ display: "grid", gridTemplateColumns: menu.groups.length === 1 && twoCol ? "1fr 1fr" : "1fr", gap: 2 }}>
                {group.items.map(item => (
                  <a key={item.label} href={item.href} role="menuitem" onClick={onNavigate} className="mega-item"
                    style={{ display: "flex", gap: 13, alignItems: "flex-start", textDecoration: "none", padding: "11px 12px", borderRadius: 9 }}>
                    <span style={{ color: "rgba(168,207,240,0.75)", flexShrink: 0, marginTop: 1 }}><Icon name={item.icon} /></span>
                    <span>
                      <span style={{ display: "block", fontFamily: "var(--font-jakarta)", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.88)", marginBottom: 2 }}>{item.label}</span>
                      <span style={{ display: "block", fontSize: 11.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{item.description}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust note */}
        {menu.trustNote && (
          <p style={{ margin: "10px 4px 2px", padding: "10px 12px 4px", borderTop: "1px solid rgba(168,207,240,0.1)", fontSize: 11, color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "rgba(201,162,39,0.7)" }}><Icon name="shield" size={13} /></span>
            {menu.trustNote}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const pathname = usePathname() ?? "/";
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Hover intent: small delay before closing so diagonal mouse paths survive.
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  }, []);
  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  // Escape closes any open menu; useful for keyboard users.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpenMenu(null); setMobileOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

    const topLinkStyle = (active: boolean, open: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" as const,
    fontFamily: "var(--font-inter)", fontSize: 15, fontWeight: 500,
    color: active || open ? "#ffffff" : "rgba(255,255,255,0.55)",
    background: open ? "rgba(168,207,240,0.08)" : active ? "rgba(168,207,240,0.06)" : "transparent",
    border: "none", cursor: "pointer", textDecoration: "none",
    padding: "9px 14px", borderRadius: 8, transition: "color 0.15s, background 0.15s",
  });

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        transition: "background 0.35s cubic-bezier(0.22,1,0.36,1), backdrop-filter 0.35s cubic-bezier(0.22,1,0.36,1), border-color 0.35s ease, box-shadow 0.35s cubic-bezier(0.22,1,0.36,1)",
        background: scrolled ? "rgba(6,13,31,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(16px) saturate(1.4)" : "none",
        borderBottom: scrolled ? "1px solid rgba(107,168,216,0.15)" : "1px solid transparent",
        boxShadow: scrolled ? "0 1px 0 rgba(168,207,240,0.06), 0 8px 32px rgba(6,13,31,0.5)" : "none",
      }}
      onMouseLeave={scheduleClose}
    >
      <div className="nav-row" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: scrolled ? 56 : 64, transition: "height 0.35s cubic-bezier(0.22,1,0.36,1)" }}>
        {/* Column 1: logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/logos/mbo-logo.webp" alt="MBO Rewards" width={393} height={152} fetchPriority="high" style={{ height: scrolled ? 36 : 40, width: "auto", transition: "height 0.35s cubic-bezier(0.22,1,0.36,1)" }} />
        </a>
        {/* Column 2: navigation */}
        <nav aria-label="Main" className="nav-desktop" style={{ gap: 4 }}>
          {NAV_MENUS.map(menu => {
            const open = openMenu === menu.label;
            const active = isMenuActive(menu, pathname);
            return (
              <div key={menu.label} style={{ position: "relative" }}
                onMouseEnter={() => { cancelClose(); setOpenMenu(menu.label); }}
                onMouseLeave={scheduleClose}
              >
                <button
                  aria-expanded={open}
                  aria-haspopup="true"
                  onClick={() => setOpenMenu(open ? null : menu.label)}
                  style={topLinkStyle(active, open)}
                >
                  {menu.label}
                  <Chevron open={open} />
                </button>
                {open && <MegaMenu menu={menu} onNavigate={() => setOpenMenu(null)} />}
              </div>
            );
          })}
        </nav>

        {/* Column 3: Pricing + primary CTA */}
        <div className="nav-actions" style={{ gap: 22, flexShrink: 0 }}>
          {NAV_LINKS.map(link => (
            <a key={link.label} href={link.href}
              style={{ fontFamily: "var(--font-inter)", fontSize: 14, fontWeight: pathname === link.href ? 600 : 500, lineHeight: 1, color: pathname === link.href ? "#e8c55a" : "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.15s", padding: "8px 0" }}>
              {link.label}
            </a>
          ))}
          {/* Site search slot — flip SEARCH_ENABLED in navigation.ts when search ships */}
          {SEARCH_ENABLED && (
            <button aria-label="Search" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.55)", padding: 6, display: "flex" }}>
              <Icon name="search" size={16} />
            </button>
          )}
          <a href={NAV_CTAS.primary.href} className="btn-cta"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", alignSelf: "center",
              fontFamily: "var(--font-jakarta)", fontSize: 14, fontWeight: 700, lineHeight: 1,
              padding: "0 22px", height: 40, margin: 0, borderRadius: 8,
              background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e",
              textDecoration: "none", letterSpacing: "0.01em",
              boxShadow: "0 0 0 1px rgba(168,207,240,0.3), 0 4px 16px rgba(201,162,39,0.3)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            {NAV_CTAS.primary.label}
          </a>
        </div>

        {/* Mobile hamburger */}
        <button className="nav-burger" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-label="Menu"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "white" }}>
          <div style={{ width: 20, height: 1.5, background: "currentColor", marginBottom: 5, transition: "transform 0.2s", transform: mobileOpen ? "translateY(6.5px) rotate(45deg)" : "none" }} />
          <div style={{ width: 20, height: 1.5, background: "currentColor", marginBottom: 5, opacity: mobileOpen ? 0 : 1, transition: "opacity 0.2s" }} />
          <div style={{ width: 20, height: 1.5, background: "currentColor", transition: "transform 0.2s", transform: mobileOpen ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
        </button>
      </div>

      {/* Mobile accordion */}
      {mobileOpen && (
        <div style={{ background: "#060d1f", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px 32px 24px", maxHeight: "calc(100vh - 72px)", overflowY: "auto" }}>
          {NAV_MENUS.map(menu => {
            const expanded = mobileSection === menu.label;
            return (
              <div key={menu.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <button
                  onClick={() => setMobileSection(expanded ? null : menu.label)}
                  aria-expanded={expanded}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.8)", fontSize: 14.5, fontWeight: 600, fontFamily: "var(--font-jakarta)" }}
                >
                  {menu.label}
                  <Chevron open={expanded} />
                </button>
                {expanded && (
                  <div style={{ paddingBottom: 10 }}>
                    {menu.hero && (
                      <a href={menu.hero.href} onClick={() => setMobileOpen(false)}
                        style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 8px", margin: "4px 0 6px", borderRadius: 9, border: "1px solid rgba(201,162,39,0.35)", background: "rgba(201,162,39,0.08)", textDecoration: "none" }}>
                        <span style={{ color: "#e8c55a" }}><Icon name={menu.hero.icon} size={16} /></span>
                        <span style={{ fontSize: 13.5, color: "#e8c55a", fontWeight: 700 }}>{menu.hero.label}</span>
                      </a>
                    )}
                    {menu.groups.map((group, gi) => (
                      <div key={group.label ?? gi}>
                        {group.label && (
                          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(168,207,240,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "10px 0 4px 8px" }}>{group.label}</p>
                        )}
                        {group.items.map(item => (
                          <a key={item.label} href={item.href} onClick={() => setMobileOpen(false)}
                            style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0 10px 8px", textDecoration: "none" }}>
                            <span style={{ color: "rgba(168,207,240,0.6)" }}><Icon name={item.icon} size={15} /></span>
                            <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>{item.label}</span>
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {NAV_LINKS.map(link => (
            <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
              style={{ display: "block", padding: "14px 0", color: "rgba(255,255,255,0.8)", textDecoration: "none", fontSize: 14.5, fontWeight: 600, fontFamily: "var(--font-jakarta)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {link.label}
            </a>
          ))}
          <a href={NAV_CTAS.primary.href} onClick={() => setMobileOpen(false)}
            style={{ display: "block", marginTop: 18, padding: "13px 0", borderRadius: 8, background: "linear-gradient(135deg, #e8c55a 0%, #c9a227 100%)", color: "#0d1b3e", textAlign: "center", fontWeight: 700, fontSize: 13.5, textDecoration: "none", fontFamily: "var(--font-jakarta)" }}>
            {NAV_CTAS.primary.label}
          </a>
        </div>
      )}
    </header>
  );
}
