/** Default reporting window: calendar year start → today (data often lags current month). */
export function yearStartIso(ref = new Date()) {
  return `${ref.getFullYear()}-01-01`;
}

export function todayIso(ref = new Date()) {
  return ref.toISOString().slice(0, 10);
}
