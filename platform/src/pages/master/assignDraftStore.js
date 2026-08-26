const STORAGE_KEY = "mbo.master.assign.draft";

export function emptyAssignDraft() {
  return {
    clientId: "",
    campaignIds: [],
    configs: {},
  };
}

export function loadAssignDraft() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyAssignDraft();
    const parsed = JSON.parse(raw);
    return {
      ...emptyAssignDraft(),
      ...parsed,
      campaignIds: Array.isArray(parsed.campaignIds) ? parsed.campaignIds : [],
      configs: parsed.configs && typeof parsed.configs === "object" ? parsed.configs : {},
    };
  } catch {
    return emptyAssignDraft();
  }
}

export function saveAssignDraft(draft) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearAssignDraft() {
  sessionStorage.removeItem(STORAGE_KEY);
}
