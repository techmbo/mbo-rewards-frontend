import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePagedQuery } from "../../hooks/usePagedQuery";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Select } from "../../components/ui/FormControls";
import { StatusPill } from "../../components/ui/StatusPill";
import { displayDate, displayPercent, displayText } from "../../utils/display";
import { NETWORK_SOURCE_OPTIONS } from "./networkFieldCatalog";

function parseDiscountPercent(text) {
  if (text == null || text === "") return null;
  const m = String(text).match(/(\d+(?:\.\d+)?)\s*%/);
  return m ? Number(m[1]) : null;
}

/**
 * Pointer 10 — every network coupon/voucher is its own row (never concatenated on campaign cells).
 */
export function OffersPromotionsPage() {
  const [filters, setFilters] = useState({ networkSource: "" });
  const queryParams = useMemo(
    () => (filters.networkSource ? { networkSource: filters.networkSource } : {}),
    [filters.networkSource],
  );
  const { rows: rawRows, loading, error, refresh, page, setPage, pagination } = usePagedQuery(
    "/supplier-coupons",
    queryParams,
    { pageSize: 50 },
  );

  const rows = useMemo(
    () =>
      (rawRows || []).map((r) => {
        const desc = r.promotionDescription || r.couponDescription || r.discountValue || null;
        const pct =
          parseDiscountPercent(desc) ??
          parseDiscountPercent(r.discountValue) ??
          (r.discountType === "PERCENT" ? parseDiscountPercent(r.discountValue) : null);
        return {
          networkSource: r.networkSource ?? r.network ?? r.supplier ?? r.supplierCampaign?.supplier,
          brandName: r.brandName || r.supplierCampaign?.merchantNameRaw,
          campaignName: r.campaignName || r.supplierCampaign?.campaignName,
          offerId: r.supplierCouponId || r.id,
          offerTitle: r.title || r.couponCode || desc?.slice?.(0, 80) || "Offer",
          couponCode: r.couponCode,
          promotionType: r.couponType || r.discountType || "COUPON",
          promotionDescription: desc,
          discountPercent: pct,
          validFrom: r.couponStartDate || r.validFrom,
          validUntil: r.couponEndDate || r.validUntil,
          offerStatus: r.couponStatus || r.status || "UNKNOWN",
          sourceObject: r.sourceObject,
          sourcePath: r.sourcePath || r.sourceFieldPath,
          mappingStatus: r.mappingStatus || (r.supplierCampaignId ? "MAPPED" : "UNMAPPED"),
          fieldMappingOutcome: r.fieldMappingOutcome,
        };
      }),
    [rawRows],
  );

  const columns = useMemo(
    () => [
      { key: "networkSource", label: "Network Source", minWidth: 110, render: (r) => displayText(r.networkSource) },
      { key: "brandName", label: "Brand Name", minWidth: 130, render: (r) => displayText(r.brandName) },
      { key: "campaignName", label: "Campaign Name", minWidth: 140, render: (r) => displayText(r.campaignName) },
      { key: "offerId", label: "Offer ID", minWidth: 120, render: (r) => displayText(r.offerId) },
      { key: "couponCode", label: "Coupon Code", minWidth: 120, render: (r) => displayText(r.couponCode) },
      { key: "offerTitle", label: "Title", minWidth: 160, render: (r) => displayText(r.offerTitle) },
      {
        key: "promotionType",
        label: "Promotion Type",
        minWidth: 120,
        render: (r) => displayText(r.promotionType),
      },
      {
        key: "promotionDescription",
        label: "Promotion Description",
        minWidth: 220,
        render: (r) => displayText(r.promotionDescription),
      },
      {
        key: "discountPercent",
        label: "Discount %",
        minWidth: 90,
        className: "tabular-nums",
        render: (r) => (r.discountPercent != null ? displayPercent(r.discountPercent) : "—"),
      },
      { key: "validFrom", label: "Valid From", minWidth: 110, render: (r) => displayDate(r.validFrom) },
      { key: "validUntil", label: "Valid Until", minWidth: 110, render: (r) => displayDate(r.validUntil) },
      {
        key: "offerStatus",
        label: "Offer Status",
        minWidth: 110,
        render: (r) => <StatusPill status={r.offerStatus} />,
      },
      {
        key: "sourceObject",
        label: "Source Object",
        minWidth: 120,
        defaultHidden: true,
        render: (r) => displayText(r.sourceObject),
      },
      {
        key: "sourcePath",
        label: "Source Path",
        minWidth: 140,
        defaultHidden: true,
        render: (r) => displayText(r.sourcePath),
      },
      {
        key: "mappingStatus",
        label: "Mapping Status",
        minWidth: 120,
        render: (r) => <StatusPill status={r.mappingStatus} />,
      },
      {
        key: "fieldMappingOutcome",
        label: "Mapping Outcome",
        minWidth: 140,
        defaultHidden: true,
        render: (r) => (r.fieldMappingOutcome ? <StatusPill status={r.fieldMappingOutcome} /> : "—"),
      },
    ],
    [],
  );

  return (
    <PageLayout
      eyebrow="Network Operations"
      title="Offers / Promotions"
      subtitle="Every network coupon or voucher is stored as its own record — never concatenated on campaign rows."
      actions={
        <Link
          to="/ops/network/coupon-pool"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Coupon Pool
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <Select
          label="Network Source"
          value={filters.networkSource}
          onChange={(e) => setFilters({ networkSource: e.target.value })}
          options={NETWORK_SOURCE_OPTIONS}
        />
      </div>
      <DataTable
        dense
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={refresh}
        onRefresh={refresh}
        page={page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={setPage}
        emptyTitle="No offers / promotions"
        emptyDescription="Rows come from synced supplier coupons — one row per network coupon/voucher."
      />
    </PageLayout>
  );
}
