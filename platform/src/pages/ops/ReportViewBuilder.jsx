import { useCallback, useEffect, useMemo, useState } from "react";
import { Drawer } from "../../components/ui/Drawer";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/FormControls";

/**
 * Persist custom report column views (Reporting v20 HTML parity).
 */
export function useSavedReportViews(storageKey, catalogFields, defaultViews) {
  const allKeys = useMemo(() => catalogFields.map((f) => f.key), [catalogFields]);

  const [views, setViews] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch {
      /* ignore */
    }
    return defaultViews || {
      full: { name: "Full", keys: allKeys, filters: {} },
    };
  });

  const [activeId, setActiveId] = useState(() => Object.keys(views)[0] || "full");
  const active = views[activeId] || { name: "Full", keys: allKeys, filters: {} };
  const [activeKeys, setActiveKeys] = useState(() => [...(active.keys || allKeys)]);
  const [activeName, setActiveName] = useState(() => active.name || "Full");

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(views));
    } catch {
      /* ignore */
    }
  }, [storageKey, views]);

  const loadView = useCallback(
    (id) => {
      const v = views[id];
      if (!v) return null;
      setActiveId(id);
      setActiveName(v.name);
      setActiveKeys([...(v.keys || allKeys)]);
      return v;
    },
    [views, allKeys],
  );

  const saveCurrent = useCallback(
    (filters = {}) => {
      setViews((prev) => ({
        ...prev,
        [activeId]: { name: activeName, keys: [...activeKeys], filters },
      }));
    },
    [activeId, activeName, activeKeys],
  );

  const saveAsNew = useCallback(
    (name, keys, filters = {}) => {
      const id = `view_${Date.now()}`;
      const next = { name: name || "Custom View", keys: [...keys], filters };
      setViews((prev) => ({ ...prev, [id]: next }));
      setActiveId(id);
      setActiveName(next.name);
      setActiveKeys([...keys]);
      return id;
    },
    [],
  );

  const viewOptions = useMemo(
    () => Object.entries(views).map(([id, v]) => ({ value: id, label: v.name })),
    [views],
  );

  return {
    views,
    activeId,
    activeName,
    activeKeys,
    setActiveKeys,
    setActiveName,
    viewOptions,
    loadView,
    saveCurrent,
    saveAsNew,
    allKeys,
  };
}

export function ReportViewBuilder({
  open,
  onClose,
  catalogFields,
  viewName,
  onViewNameChange,
  selectedKeys,
  onSelectedKeysChange,
  onApply,
  title = "Custom Report View",
  subtitle = "Choose which fields appear and export.",
}) {
  const selected = new Set(selectedKeys);

  function toggle(key, on) {
    const next = new Set(selected);
    if (on) next.add(key);
    else next.delete(key);
    onSelectedKeysChange([...next]);
  }

  function selectAll(on) {
    onSelectedKeysChange(on ? catalogFields.map((f) => f.key) : []);
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      width="max-w-xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">{selectedKeys.length} columns selected</span>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => onApply(false)}>
              Apply Without Saving
            </Button>
            <Button type="button" variant="primary" onClick={() => onApply(true)}>
              Save View
            </Button>
          </div>
        </div>
      }
    >
      <p className="mb-4 text-xs text-slate-500">{subtitle}</p>
      <Input
        label="Report View Name"
        value={viewName}
        onChange={(e) => onViewNameChange(e.target.value)}
        placeholder="e.g. Daily Coupon Operations"
      />
      <div className="mb-3 mt-4 flex items-center justify-between">
        <b className="text-sm text-slate-800">Select Columns</b>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => selectAll(true)}>
            Select All
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => selectAll(false)}>
            Clear
          </Button>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {catalogFields.map((field) => (
          <label
            key={field.key}
            className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              checked={selected.has(field.key)}
              onChange={(e) => toggle(field.key, e.target.checked)}
            />
            <span>{field.label}</span>
          </label>
        ))}
      </div>
    </Drawer>
  );
}
