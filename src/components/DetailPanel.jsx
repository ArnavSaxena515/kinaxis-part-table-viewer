import { SOURCE_COLORS } from '../api/constants';

export default function DetailPanel({ record, onClose }) {
  if (!record) return null;

  const fields = [
    { label: 'Name', value: record.Name },
    { label: 'Type', value: record.Type },
    { label: 'UOM', value: record.UOM },
    { label: 'Product Group', value: record.ProductGroup },
    { label: 'Division', value: record.Division },
    { label: 'Site', value: record.Site },
    { label: 'Lead Time', value: record.LeadTime != null ? `${record.LeadTime}d` : null },
    { label: 'MRP Type', value: record.MRPType },
    { label: 'Procurement Type', value: record.ProcurementType },
    { label: 'Batch Managed', value: record.IsBatchManaged === true ? 'Yes' : record.IsBatchManaged === false ? 'No' : null },
    { label: 'MRP Controller', value: record.MRPController },
    { label: 'Valuation Class', value: record.ValuationClass },
    { label: 'Material Group', value: record.MaterialGroup },
    { label: 'Weight Unit', value: record.WeightUnit },
    { label: 'Gross Weight', value: record.GrossWeight },
    { label: 'Net Weight', value: record.NetWeight },
    { label: 'Volume', value: record.Volume },
    { label: 'Volume Unit', value: record.VolumeUnit },
  ];

  const sources = record._sources || [];

  return (
    <tr className="bg-white" style={{ borderLeft: '4px solid #b90027' }}>
      <td className="p-0" colSpan={11}>
        <div className="px-6 py-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="font-bold text-charcoal text-sm">{record.Name || '—'}</div>
              <div className="text-[10px] text-on-surface-variant uppercase">
                Material Record Details
              </div>
            </div>
            <button
              onClick={onClose}
              className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              close
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">
            {/* Field grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
              {fields.map((f, i) => (
                <div key={i}>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{f.label}</p>
                  <p className="text-xs font-medium text-charcoal">{f.value ?? '—'}</p>
                </div>
              ))}
            </div>

            {/* Source Flow Visualization */}
            <div className="bg-surface-container-low p-6">
              <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Source Flow Visualization</p>
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2">
                  {sources.map((src, i) => {
                    const color = SOURCE_COLORS[src] || { bg: 'bg-slate-500', label: src };
                    return (
                      <div key={i} className={`${color.bg} text-white px-3 py-2 text-[10px] font-black`}>
                        {src}
                      </div>
                    );
                  })}
                  {sources.length === 0 && (
                    <div className="bg-slate-400 text-white px-3 py-2 text-[10px] font-black">No Sources</div>
                  )}
                </div>
                <span className="text-on-surface-variant font-bold text-lg">→</span>
                <div className="flex-1 bg-primary text-white p-4 font-black text-center text-sm">
                  Kinaxis Part Record
                </div>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
