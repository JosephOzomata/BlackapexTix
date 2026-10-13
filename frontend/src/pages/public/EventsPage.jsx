import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { PageHeader } from "../../components/layout/PageHeader";
import { EventGrid } from "../../components/events/EventGrid";
import { EventEmptyState } from "../../components/events/EventEmptyState";
import { EventCategoryChips } from "../../components/events/EventCategoryChips";
import { EventSearchBar, EventFilterToggle } from "../../components/events/EventSearchBar";
import { EventFiltersPanel, EventFiltersMobileDrawer } from "../../components/events/EventFilters";
import { Pagination } from "../../components/common/Pagination";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { eventsService } from "../../services/events.service";
import { queryKeys } from "../../queryClient";
import { useSeo } from "../../hooks/useSeo";
import { useDebounce } from "../../hooks/useDebounce";
import { PAGINATION } from "../../constants/config";

const SORTS = [
  { value: "soonest", label: "Soonest" },
  { value: "popular", label: "Trending" },
  { value: "newest", label: "Newly added" },
  { value: "priceAsc", label: "Price: low to high" },
];

export default function EventsPage() {
  useSeo({ title: "Browse events" });

  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(params.get("q") ?? "");
  const debouncedQ = useDebounce(searchInput, 350);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = useMemo(() => {
    return {
      q: params.get("q") ?? "",
      category: params.get("category") ?? "",
      city: params.get("city") ?? "",
      dateFrom: params.get("dateFrom") ?? "",
      dateTo: params.get("dateTo") ?? "",
      priceMin: params.get("priceMin") ?? "",
      priceMax: params.get("priceMax") ?? "",
      isFree: params.get("isFree") === "true" ? true : undefined,
      sort: params.get("sort") ?? "soonest",
      page: Number(params.get("page") ?? 1),
      pageSize: PAGINATION.defaultPageSize,
    };
  }, [params]);

  // Sync search input → URL
  useEffect(() => {
    if (debouncedQ === (params.get("q") ?? "")) return;
    const next = new URLSearchParams(params);
    if (debouncedQ) next.set("q", debouncedQ);
    else next.delete("q");
    next.set("page", "1");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const setFilter = (patch) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === "" || v === null || v === undefined || v === false) next.delete(k);
      else next.set(k, String(v));
    }
    next.set("page", "1");
    setParams(next);
  };

  const resetFilters = () => {
    const next = new URLSearchParams();
    if (filters.q) next.set("q", filters.q);
    setParams(next);
  };

  const filterCount = [
    filters.category,
    filters.city,
    filters.dateFrom,
    filters.dateTo,
    filters.priceMin,
    filters.priceMax,
    filters.isFree,
  ].filter(Boolean).length;

  const query = useQuery({
    queryKey: queryKeys.events.list(filters),
    queryFn: () => eventsService.getEvents(filters),
    placeholderData: keepPreviousData,
  });

  const items = query.data?.data?.items ?? [];
  const total = query.data?.data?.total ?? 0;
  const totalPages = query.data?.data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <PageHeader
        eyebrow="Discover"
        title="Browse events"
        subtitle={`${total.toLocaleString()} event${total === 1 ? "" : "s"} available`}
      />

      <div className="mt-6 space-y-4">
        <EventSearchBar defaultQuery={searchInput} defaultCity={filters.city} />
        <EventCategoryChips
          value={filters.category}
          onChange={(slug) => setFilter({ category: slug })}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal size={16} className="text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Filters
              </h3>
              {filterCount > 0 && (
                <span className="ml-auto rounded-full bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5">
                  {filterCount}
                </span>
              )}
            </div>
            <EventFiltersPanel
              value={filters}
              onChange={(v) => setFilter(v)}
              onReset={resetFilters}
            />
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="lg:hidden">
              <EventFilterToggle
                count={filterCount}
                onClick={() => setMobileFiltersOpen(true)}
              />
            </div>
            <p className="text-sm text-muted-foreground hidden lg:block">
              Showing {items.length} of {total.toLocaleString()}
            </p>
            <div className="ml-auto w-44">
              <Select
                value={filters.sort}
                onChange={(e) => setFilter({ sort: e.target.value })}
                options={SORTS}
                size="sm"
                aria-label="Sort by"
              />
            </div>
          </div>

          {query.isError ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">
                We couldn't load events right now.
              </p>
              <Button className="mt-4" onClick={() => query.refetch()}>
                Try again
              </Button>
            </div>
          ) : items.length === 0 && !query.isLoading ? (
            <EventEmptyState
              variant={filterCount > 0 ? "filtered" : "no-events"}
              onReset={resetFilters}
              query={filters.q}
            />
          ) : (
            <>
              <EventGrid
                events={items}
                loading={query.isLoading}
                columns={3}
              />
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    page={filters.page}
                    totalPages={totalPages}
                    onChange={(p) => setFilter({ page: p })}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <EventFiltersMobileDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        value={filters}
        onChange={(v) => setFilter(v)}
        onReset={resetFilters}
      />
    </div>
  );
}