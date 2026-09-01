import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../../api";
import { Icon } from "../ui/Icon";

const TYPE_ICONS = {
  client: "clients",
  brand: "brands",
  campaign: "campaigns",
  network: "networks",
  network_record: "data",
  exception: "issues",
};

function useDebouncedValue(value, delayMs = 280) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function GlobalSearch() {
  const navigate = useNavigate();
  const listboxId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [total, setTotal] = useState(0);
  const [minQueryLength, setMinQueryLength] = useState(2);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebouncedValue(query.trim());

  const flatResults = groups.flatMap((group) => group.items);

  const runSearch = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setGroups([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchApi("/ops/global-search", { q: term, limit: 5 }, { skipCache: true });
      const payload = res?.data ?? res;
      setGroups(Array.isArray(payload?.groups) ? payload.groups : []);
      setTotal(Number(payload?.total) || 0);
      setMinQueryLength(Number(payload?.minQueryLength) || 2);
      setActiveIndex(-1);
    } catch {
      setGroups([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    runSearch(debouncedQuery);
  }, [debouncedQuery, open, runSearch]);

  useEffect(() => {
    function onDocClick(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const goTo = useCallback(
    (item) => {
      if (!item?.href) return;
      setOpen(false);
      setQuery("");
      navigate(item.href);
    },
    [navigate],
  );

  function onKeyDown(event) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!flatResults.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((idx) => (idx + 1) % flatResults.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((idx) => (idx <= 0 ? flatResults.length - 1 : idx - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      goTo(flatResults[activeIndex]);
    }
  }

  const showPanel = open && query.trim().length > 0;
  const tooShort = debouncedQuery.length > 0 && debouncedQuery.length < minQueryLength;

  return (
    <div ref={rootRef} className="relative hidden max-w-md flex-1 md:block">
      <Icon
        name="search"
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
      />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listboxId}
        aria-autocomplete="list"
        placeholder="Search clients, brands, campaigns, networks…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />

      {showPanel && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(24rem,70vh)] overflow-y-auto rounded-lg border border-slate-200 bg-white py-2 shadow-lg"
        >
          {loading && (
            <p className="px-3 py-2 text-sm text-slate-500">Searching…</p>
          )}
          {!loading && tooShort && (
            <p className="px-3 py-2 text-sm text-slate-500">
              Type at least {minQueryLength} characters
            </p>
          )}
          {!loading && !tooShort && total === 0 && (
            <p className="px-3 py-2 text-sm text-slate-500">No results for &ldquo;{debouncedQuery}&rdquo;</p>
          )}
          {!loading &&
            groups.map((group) => (
              <div key={group.key} className="px-1">
                <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {group.label}
                </p>
                <ul>
                  {group.items.map((item) => {
                    const flatIdx = flatResults.indexOf(item);
                    const active = flatIdx === activeIndex;
                    return (
                      <li key={`${item.type}-${item.id}`}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-slate-50 ${active ? "bg-brand-50" : ""}`}
                          onMouseEnter={() => setActiveIndex(flatIdx)}
                          onClick={() => goTo(item)}
                        >
                          <Icon
                            name={TYPE_ICONS[item.type] || "search"}
                            size={18}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-slate-900">{item.label}</span>
                            {item.subtitle ? (
                              <span className="block truncate text-xs text-slate-500">{item.subtitle}</span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
