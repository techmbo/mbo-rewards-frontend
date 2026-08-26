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
 * v13 Offers / Promotions — promotion data remains separate from coupon codes & campaign master.
 * Live rows from supplier coupons (real offer/description evidence).
 */
export function OffersPromotionsPage() {
  const [filters, setFilters] = useState({ supplier: "" });
  // client-side network filter — coupon list API is not supplier-scoped
  const { rows: rawRows, loading, error, refresh, page, setPage, pagination } = usePagedQuery(
    "/supplier-coupons",
    {},
    { pageSize: 50 },
  );

  const rows = useMemo(() => {
    const mapped = (rawRows || []).map((r) => {
      const desc = r.couponDescription || r.discountValue || r.description || null;
      const pct = parseDiscountPercent(desc) ?? parseDiscountPercent(r.discountValue);
      const networkSource = r.supplier || r.networkSource || r.supplierCampaign?.supplier;
      return {
        networkSource,
        brandName: r.brandName || r.merchantName || r.supplierCampaign?.merchantNameRaw,
        campaignName: r.campaignName || r.supplierCampaign?.campaignName,
        offerId: r.supplierCouponId || r.id,
        offerTitle: r.couponCode || r.title || r.couponDescription?.slice?.(0, 80) || "Offer",
        promotionType: r.couponType || r.promotionType || "COUPON",
        promotionDescription: desc,
        discountPercent: pct,
        validFrom: r.couponStartDate || r.validFrom,
        validUntil: r.couponEndDate || r.validUntil,
        offerStatus: r.couponStatus || r.status || "UNKNOWN",
        sourceFieldPath: "supplier_coupon.couponDescription / discountValue",
        mappingStatus: r.supplierCampaignId || r.supplierCampaign ? "MAPPED" : "UNMAPPED",
      };
    });
    if (!filters.supplier) return mapped;
    const needle = String(filters.supplier).toLowerCase();
    return mapped.filter((r) => String(r.networkSource || "").toLowerCase().includes(needle));
  }, [rawRows, filters.supplier]);

  const columns = useMemo(
    () => [
      { key: "networkSource", label: "Network Source", minWidth: 110, render: (r) => displayText(r.networkSource) },
      { key: "brandName", label: "Brand Name", minWidth: 130, render: (r) => displayText(r.brandName) },
      { key: "campaignName", label: "Campaign Name", minWidth: 140, render: (r) => displayText(r.campaignName) },
      { key: "offerId", label: "Offer ID", minWidth: 120, render: (r) => displayText(r.offerId) },
      { key: "offerTitle", label: "Offer Title", minWidth: 160, render: (r) => displayText(r.offerTitle) },
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
        key: "sourceFieldPath",
        label: "Source Field / Path",
        minWidth: 180,
        defaultHidden: true,
        render: (r) => displayText(r.sourceFieldPath),
      },
      {
        key: "mappingStatus",
        label: "Mapping Status",
        minWidth: 120,
        render: (r) => <StatusPill status={r.mappingStatus} />,
      },
    ],
    [],
  );

  return (
    <PageLayout
      eyebrow="Network Operations"
      title="Offers / Promotions"
      subtitle="Promotion data remains a separate record from coupon codes and campaign master data."
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
          value={filters.supplier}
          onChange={(e) => setFilters({ supplier: e.target.value })}
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
        emptyDescription="Rows come from synced supplier coupons with promotion descriptions."
      />
    </PageLayout>
  );
}
