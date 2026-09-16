export type FeesTab = 'ledger' | 'payments'

type FeesTabsProps = {
  activeTab: FeesTab
  onChange: (tab: FeesTab) => void
}

export function FeesTabs({
  activeTab,
  onChange,
}: FeesTabsProps) {
  return (
    <div
      className="fees-tabs"
      role="group"
      aria-label="회비 메뉴"
    >
      <button
        type="button"
        aria-pressed={activeTab === 'ledger'}
        onClick={() => onChange('ledger')}
      >
        사용 내역·증빙
      </button>

      <button
        type="button"
        aria-pressed={activeTab === 'payments'}
        onClick={() => onChange('payments')}
      >
        납부 현황
      </button>
    </div>
  )
}