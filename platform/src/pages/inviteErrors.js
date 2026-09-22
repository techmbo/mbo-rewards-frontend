/**
 * One message per failure the invite endpoints can actually produce.
 *
 * `invalid` deliberately covers BOTH an unknown token and an already-accepted one. The backend
 * answers 404 for each, because accepting an invite clears its hash — which is also what makes a
 * replay fail structurally rather than by a conditional, and what lets the account log in at all
 * (loginUser refuses any user still holding an invite hash). Splitting these two apart needs a
 * schema change, not a copy change; until then, saying "invalid or already used" is the honest
 * wording. It also avoids confirming to a stranger that a token once existed.
 */
export const INVITE_ERRORS = {
  missing: "This link is missing its invitation token. Use the full link from your invitation email.",
  invalid:
    "This invitation is not valid. It may have already been used, or the link may be incomplete. If you have already set a password, sign in instead.",
  expired: "This invitation has expired. Ask your MBO contact to send a new invitation.",
  password: "Please choose a password with at least 8 characters.",
  network: "We could not reach MBO Rewards. Check your connection and try again.",
  unknown: "Something went wrong on our side. Please try again, or contact your MBO contact.",
};

/** Map the API failure onto one of the states above, by status rather than by message text. */
export function classifyInviteError(err) {
  const status = err?.status;
  if (status === 410) return "expired";
  if (status === 404) return "invalid";
  if (status === 400) return "password";
  if (!status || status === 0) return "network";
  if (status >= 500) return "unknown";
  return "unknown";
}
