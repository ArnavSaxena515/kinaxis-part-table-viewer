export default function StatsRow({ records }) {
  if (!records || records.length === 0) {
    const placeholders = [
      { label: 'Total Records', value: '—' },
      { label: 'Unique Types', value: '—' },
      { label: 'Active Sites', value: '—' },
      { label: 'Harmonized Sources', value: '—' },
      { label: 'Batch Managed', value: '—' },
    ];

    return (
      <section className="grid grid-cols-2 md:grid-cols-5 bg-white" style={{ border: '1px solid rgba(230,189,187,0.1)' }}>
        {placeholders.map((item, i) => (
          <div key={i} className="p-6" style={i < 4 ? { borderRight: '1px solid rgba(230,189,187,0.1)' } : {}}>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1">{item.label}</p>
            <p className="text-3xl font-black tracking-tighter text-charcoal">{item.value}</p>
          </div>
        ))}
      </section>
    );
  }

  const totalRecords = records.length;
  const uniqueTypes = new Set(records.map((r) => r.Type).filter(Boolean)).size;
  const activeSites = new Set(records.map((r) => r.Site).filter(Boolean)).size;

  const allSources = new Set();
  records.forEach((r) => {
    if (r._sources && Array.isArray(r._sources)) {
      r._sources.forEach((s) => allSources.add(s));
    }
  });
  const harmonizedSources = allSources.size;

  const batchCount = records.filter((r) => r.IsBatchManaged === true).length;
  const batchPercent = totalRecords > 0 ? Math.round((batchCount / totalRecords) * 100) : 0;

  const stats = [
    { label: 'Total Records', value: totalRecords },
    { label: 'Unique Types', value: uniqueTypes },
    { label: 'Active Sites', value: activeSites },
    { label: 'Harmonized Sources', value: harmonizedSources },
    { label: 'Batch Managed', value: `${batchPercent}%`, highlight: true },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-5 bg-white" style={{ border: '1px solid rgba(230,189,187,0.1)' }}>
      {stats.map((item, i) => (
        <div key={i} className="p-6" style={i < 4 ? { borderRight: '1px solid rgba(230,189,187,0.1)' } : {}}>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1">{item.label}</p>
          <p className={`text-3xl font-black tracking-tighter ${item.highlight ? 'text-primary' : 'text-charcoal'}`}>
            {item.value}
          </p>
        </div>
      ))}
    </section>
  );
}
