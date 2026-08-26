import { Link } from "react-router-dom";
import { PageLayout } from "../../components/layout/PageLayout";
import { CouponPoolPanel } from "../../components/coupons/CouponPoolPanel";

/**
 * Network Operation Portal — Coupon Pool (14D).
 * Network → MBO coupon inventory only. Assigned = MBO allocation usage, not network redemption.
 */
export function NetworkCouponPoolPage() {
  return (
    <PageLayout
      eyebrow="Network Operation Portal"
      title="Network Coupon Pool"
      subtitle="Coupon inventory and refresh alerts for network campaign sources."
      actions={
        <>
          <Link
            to="/admin/coupons"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Import Excel
          </Link>
          <Link
            to="/admin/coupons"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Add Manual Codes
          </Link>
          <Link
            to="/admin/coupons"
            className="inline-flex items-center justify-center rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Refresh Network Codes
          </Link>
        </>
      }
    >
      <p className="mb-1 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        14D_Network_Coupon_Pool_View
      </p>
      <CouponPoolPanel />
    </PageLayout>
  );
}
