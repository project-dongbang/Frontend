type Tab = { id: string; label: string }

export function TabList({ tabs, activeId, onChange }: { tabs: Tab[]; activeId: string; onChange: (id: string) => void }) {
  return <div className="tab-list" role="tablist">{tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={tab.id === activeId} className={tab.id === activeId ? 'active' : ''} onClick={() => onChange(tab.id)}>{tab.label}</button>)}</div>
}
