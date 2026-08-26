/**
 * Delivery method labels and channel requirements (mirrors backend deliveryMethod.js).
 */

export const DELIVERY_METHOD_OPTIONS = [
  {
    value: "API_AND_PORTAL",
    label: "API + Portal",
    description: "Client receives campaigns via partner API and the client portal.",
  },
  {
    value: "API_ONLY",
    label: "API Only",
    description: "Partner API only. Portal administrator is not required for activation.",
  },
  {
    value: "PORTAL_ONLY",
    label: "Portal Only",
    description: "Client portal only. Production API is not required for activation.",
  },
];

export function deliveryChannelRequirements(deliveryMethod = "API_AND_PORTAL") {
  const method = DELIVERY_METHOD_OPTIONS.some((o) => o.value === deliveryMethod)
    ? deliveryMethod
    : "API_AND_PORTAL";
  return {
    needsApi: method !== "PORTAL_ONLY",
    needsPortal: method !== "API_ONLY",
    label: DELIVERY_METHOD_OPTIONS.find((o) => o.value === method)?.label || "API + Portal",
  };
}

export function deliveryMethodLabel(deliveryMethod) {
  return deliveryChannelRequirements(deliveryMethod).label;
}
