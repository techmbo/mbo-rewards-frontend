import { useCallback, useEffect, useMemo, useState } from "react";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/FormControls";
import { Button } from "../../components/ui/Button";
import { ApiError, fetchApi } from "../../api";
import { PORTAL_API } from "../../apiUrl";
import { useToast } from "../../context/ToastContext";
import { copyText, unwrap } from "./portalUtils";
import {
  brandName,
  campaignName,
  channelLabel,
  classifyProductLoadError,
  commissionLabel,
  commercialModelLabel,
  csvRowsFromProducts,
  formatProductMoney,
  isProductsEmpty,
  na,
  productImageUrl,
  productItems,
  productName,
  productPagination,
  PRODUCT_CSV_HEADERS,
  trackingUrl,
  displayPrice,
} from "./portalProductHelpers";

function downloadCsv(filename, headers, rows) {
  const escape = (v) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };
  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function PortalProductsPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, pageSize: 25 };
      if (search.trim()) params.search = search.trim();
      const res = await fetchApi(PORTAL_API.products, params);
      setPayload(unwrap(res) || {});
    } catch (err) {
      setPayload(null);
      setError(classifyProductLoadError(err, ApiError, PORTAL_API.products));
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => productItems(payload), [payload]);
  const pagination = useMemo(() => productPagination(payload), [payload]);
  const empty = !loading && !error && isProductsEmpty(payload);

  const columns = [
    { key: "brandName", label: "Brand", render: (r) => na(brandName(r)) },
    { key: "campaignName", label: "Campaign", render: (r) => na(campaignName(r)) },
    {
      key: "productName",
      label: "Product",
      minWidth: 180,
      render: (r) => {
        const img = productImageUrl(r);
        return (
          <div className="flex items-center gap-2">
            {img ? (
              <img alt="" src={img} className="h-8 w-8 rounded object-cover" />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-500"
                aria-hidden
              >
                —
              </div>
            )}
            <span className="line-clamp-2">{na(productName(r))}</span>
          </div>
        );
      },
    },
    {
      key: "price",
      label: "Price",
      className: "tabular-nums",
      render: (row) => formatProductMoney(displayPrice(row), row.currency),
    },
    { key: "availability", label: "Availability", render: (r) => na(r.availability) },
    {
      key: "commercialModel",
      label: "Commercial",
      render: (r) => commercialModelLabel(r),
    },
    { key: "channel", label: "Channel", render: (r) => channelLabel(r) },
    { key: "commission", label: "Commission", render: (r) => commissionLabel(r) },
    {
      key: "actions",
      label: "Tracking",
      render: (row) => {
        const url = trackingUrl(row);
        if (!url) return "Not available";
        return (
          <div className="flex flex-wrap gap-2">
            <a
              className="text-sm font-semibold text-brand-700 hover:underline"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              Open
            </a>
            <button
              type="button"
              className="text-sm font-semibold text-slate-600 hover:underline"
              onClick={() => copyText(url, (msg) => toast.success(msg))}
            >
              Copy link
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <PageLayout
      title="Products"
      subtitle="Assigned product offers for your live campaigns — MBO tracking links only."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            disabled={!rows.length}
            onClick={() =>
              downloadCsv("client-products.csv", PRODUCT_CSV_HEADERS, csvRowsFromProducts(rows))
            }
          >
            Export CSV
          </Button>
          <Button variant="secondary" onClick={load}>
            Refresh
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <Input
          label="Search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Brand, product, or SKU"
        />
        <Button
          onClick={() => {
            setPage(1);
            setSearch(draft);
          }}
        >
          Search
        </Button>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <p className="font-semibold">
            {error.status === 401
              ? "Unauthorized"
              : error.status === 403
                ? "Forbidden"
                : "API error"}
          </p>
          <p>{error.message}</p>
          <Button className="mt-2" variant="secondary" onClick={load}>
            Retry
          </Button>
        </div>
      ) : null}

      <DataTable
        dense
        columns={columns}
        rows={rows}
        loading={loading}
        error={null}
        emptyTitle={empty ? "No products available" : "No products assigned"}
        emptyDescription={
          empty
            ? "No client-visible products are published to your live campaigns yet."
            : "Products appear when catalog items are assigned to your published campaigns."
        }
      />

      {!loading && !error ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <p>
            {pagination.total} product(s)
            {pagination.totalPages > 1
              ? ` · Page ${pagination.page} of ${pagination.totalPages}`
              : ""}
          </p>
          {pagination.totalPages > 1 ? (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </PageLayout>
  );
}
