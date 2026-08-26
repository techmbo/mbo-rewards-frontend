const STORAGE_KEY = "mbo.master.facing.overrides";

export function loadMasterFacingOverrides() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveMasterFacingOverride(campaignId, clientFacing) {
  if (!campaignId) return;
  const all = loadMasterFacingOverrides();
  all[campaignId] = clientFacing && typeof clientFacing === "object" ? clientFacing : {};
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getMasterFacingOverride(campaignId) {
  if (!campaignId) return {};
  return loadMasterFacingOverrides()[campaignId] || {};
}
