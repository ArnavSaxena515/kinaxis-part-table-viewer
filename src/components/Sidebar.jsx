export default function Sidebar() {
  const navItems = [
    { icon: 'inventory_2', label: 'Inventory', active: true },
    { icon: 'event_note', label: 'Planning', active: false },
    { icon: 'factory', label: 'Sourcing', active: false },
    { icon: 'monitoring', label: 'Analytics', active: false },
    { icon: 'terminal', label: 'Logs', active: false },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low flex flex-col py-8 z-40 hidden md:flex">
      {/* Logo */}
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
        </div>
        <div>
          <h2 className="uppercase tracking-widest text-[10px] font-bold text-charcoal">Supply Chain</h2>
          <p className="text-[9px] text-charcoal opacity-60 font-medium">SAP S/4HANA SYNC</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={
              item.active
                ? 'flex items-center gap-4 px-4 py-3 bg-white text-primary font-black border-l-4 border-primary transition-all duration-200'
                : 'flex items-center gap-4 px-4 py-3 text-charcoal opacity-60 hover:text-primary hover:bg-white/50 border-l-4 border-transparent transition-all duration-200'
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="uppercase tracking-widest text-[10px]">{item.label}</span>
          </a>
        ))}
      </nav>

      {/* Bottom button */}
      <div className="mt-auto px-6">
        <button className="w-full bg-primary text-on-primary py-3 px-4 uppercase tracking-widest text-[10px] font-bold hover:bg-primary-container transition-colors">
          Refresh Cobalt API
        </button>
      </div>
    </aside>
  );
}
