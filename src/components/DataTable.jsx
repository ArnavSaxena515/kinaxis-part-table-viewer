import { useState, useMemo } from 'react';
import { TYPE_COLORS, SOURCE_COLORS } from '../api/constants';
import DetailPanel from './DetailPanel';

const COLUMNS = [
  { key: 'Name', label: 'Part Name', sortable: true },
  { key: 'Type', label: 'Type', sortable: true },
  { key: 'UOM', label: 'UOM', sortable: true },
  { key: 'ProductGroup', label: 'Product Group', sortable: true },
  { key: 'Division', label: 'Division', sortable: true },
  { key: 'Site', label: 'Site', sortable: true },
  { key: 'LeadTime', label: 'LT', sortable: true },
  { key: 'MRPType', label: 'MRP', sortable: true },
  { key: 'ProcurementType', label: 'Procurement', sortable: true },
  { key: 'IsBatchManaged', label: 'Batch', sortable: true },
  { key: '_sources', label: 'Sources', sortable: false },
];

export default function DataTable({ records }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [expandedRow, setExpandedRow] = useState(null);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedRecords = useMemo(() => {
    if (!sortKey) return records;
    return [...records].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'boolean') { aVal = aVal ? 1 : 0; bVal = bVal ? 1 : 0; }
      if (typeof aVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [records, sortKey, sortDir]);

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <section className="bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-container-low">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer select-none hover:text-primary transition-colors' : ''
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span className="material-symbols-outlined text-xs text-primary">
                        {sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRecords.map((record, idx) => {
              const isExpanded = expandedRow === idx;
              const typeColor = TYPE_COLORS[record.Type] || { bg: 'bg-slate-100', text: 'text-slate-800' };
              const sources = record._sources || [];

              return (
                <Fragment key={idx}>
                  <tr
                    onClick={() => toggleRow(idx)}
                    className={`cursor-pointer transition-colors border-l-4 ${
                      isExpanded ? 'border-l-primary bg-surface-container-low' : 'border-l-transparent hover:border-l-primary'
                    } ${idx % 2 === 0 ? 'bg-white' : 'bg-surface'} hover:bg-surface-container-low`}
                  >
                    {/* Name */}
                    <td className="px-6 py-5">
                      <div className="font-bold text-charcoal text-sm whitespace-nowrap">{record.Name || '—'}</div>
                    </td>
                    {/* Type */}
                    <td className="px-6 py-5">
                      {record.Type ? (
                        <span className={`px-2 py-0.5 ${typeColor.bg} ${typeColor.text} text-[9px] font-black uppercase`}>
                          {record.Type}
                        </span>
                      ) : '—'}
                    </td>
                    {/* UOM */}
                    <td className="px-6 py-5 text-xs font-medium text-on-surface">{record.UOM || '—'}</td>
                    {/* Product Group */}
                    <td className="px-6 py-5 text-xs font-medium text-on-surface whitespace-nowrap">{record.ProductGroup || '—'}</td>
                    {/* Division */}
                    <td className="px-6 py-5 text-xs font-medium text-on-surface">{record.Division || '—'}</td>
                    {/* Site */}
                    <td className="px-6 py-5">
                      {record.Site ? (
                        <span className="px-2 py-0.5 bg-surface-container-high text-charcoal text-[9px] font-black uppercase whitespace-nowrap">
                          {record.Site}
                        </span>
                      ) : '—'}
                    </td>
                    {/* Lead Time */}
                    <td className="px-6 py-5 text-xs font-medium text-on-surface">
                      {record.LeadTime != null ? `${record.LeadTime}d` : '—'}
                    </td>
                    {/* MRP */}
                    <td className="px-6 py-5 text-xs font-medium text-on-surface">{record.MRPType || '—'}</td>
                    {/* Procurement */}
                    <td className="px-6 py-5 text-xs font-medium text-on-surface whitespace-nowrap">{record.ProcurementType || '—'}</td>
                    {/* Batch Managed */}
                    <td className="px-6 py-5">
                      {record.IsBatchManaged === true ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-zinc-300"></div>
                      )}
                    </td>
                    {/* Sources */}
                    <td className="px-6 py-5">
                      <div className="flex gap-1">
                        {sources.map((src, si) => {
                          const sc = SOURCE_COLORS[src] || { bg: 'bg-slate-500', label: src };
                          return (
                            <span
                              key={si}
                              className={`${sc.bg} text-white text-[8px] px-1.5 py-0.5 font-bold uppercase whitespace-nowrap`}
                              title={src}
                            >
                              {sc.label}
                            </span>
                          );
                        })}
                        {sources.length === 0 && <span className="text-xs text-on-surface-variant">—</span>}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && <DetailPanel record={record} onClose={() => setExpandedRow(null)} />}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Need Fragment import
import { Fragment } from 'react';
