import { TYPE_LABELS } from '../api/constants';

export default function FilterBar({
  records,
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  siteFilter,
  setSiteFilter,
  procurementFilter,
  setProcurementFilter,
  filteredCount,
  totalCount,
  onClear,
}) {
  const uniqueTypes = [...new Set(records.map((r) => r.Type).filter(Boolean))].sort();
  const uniqueSites = [...new Set(records.map((r) => r.Site).filter(Boolean))].sort();
  const uniqueProcurement = [...new Set(records.map((r) => r.ProcurementType).filter(Boolean))].sort();

  return (
    <section className="bg-surface-container-low p-4 flex flex-wrap items-center gap-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[240px]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border-0 py-2.5 pl-4 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Search by name, type, site, or any field..."
        />
      </div>

      {/* Dropdowns */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-white border-0 py-2.5 px-4 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="">All Types</option>
          {uniqueTypes.map((t) => (
            <option key={t} value={t}>
              {t} {TYPE_LABELS[t] ? `(${TYPE_LABELS[t]})` : ''}
            </option>
          ))}
        </select>

        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="bg-white border-0 py-2.5 px-4 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="">All Sites</option>
          {uniqueSites.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={procurementFilter}
          onChange={(e) => setProcurementFilter(e.target.value)}
          className="bg-white border-0 py-2.5 px-4 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="">Procurement</option>
          {uniqueProcurement.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Divider + Clear */}
      <div className="h-8 w-px bg-surface-container-high mx-2 hidden md:block"></div>
      <button
        onClick={onClear}
        className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors"
      >
        Clear Filters
      </button>

      {/* Record count */}
      <div className="ml-auto text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        Showing <span className="text-charcoal">{filteredCount}</span> of {totalCount}
      </div>
    </section>
  );
}
