import { useState, type FormEvent } from 'react'
import { Modal } from '../../../components/common'
import { feesApi } from '../../../api/services'
import { errorMessage } from '../../../api/client'
import { useSession } from '../../../context/SessionContext'
import type { FeesTransaction } from '../feesMock'

export function LedgerTransactionEditModal({ transaction, onClose }: { transaction: FeesTransaction; onClose: () => void }) {
  const { activeOrganization } = useSession()
  const [title, setTitle] = useState(transaction.title)
  const [date, setDate] = useState(transaction.date.replaceAll('.', '-'))
  const [amount, setAmount] = useState(String(transaction.amount))
  const [counterparty, setCounterparty] = useState(transaction.description)
  const [category, setCategory] = useState(transaction.category)
  const [paymentMethod, setPaymentMethod] = useState(transaction.paymentMethod ?? '')
  const [memo, setMemo] = useState(transaction.memo ?? '')
  const [evidence, setEvidence] = useState<File | undefined>()
  const [error, setError] = useState('')

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeOrganization) return
    const payload = { title: title.trim(), occurredOn: date, amount: Number(amount), counterparty: counterparty.trim(), category, paymentMethod, memo }
    try {
      if (transaction.type === 'income') {
        await feesApi.updateIncome(activeOrganization.organizationId, transaction.id, { title: payload.title, occurredOn: payload.occurredOn, amount: payload.amount, counterparty: payload.counterparty, memo: payload.memo })
      } else {
        await feesApi.updateExpense(activeOrganization.organizationId, transaction.id, payload, evidence)
      }
      window.dispatchEvent(new Event('dongbang:fees-changed'))
      onClose()
    } catch (requestError) { setError(errorMessage(requestError)) }
  }

  return <Modal open title="장부 항목 수정" className="my-page-modal" onClose={onClose}>
    <form onSubmit={(event) => void save(event)} className="ledger-edit-form">
      <label>항목명<input required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label>일자<input required type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <label>금액<input required type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
      <label>입금처 / 사용처<input required value={counterparty} onChange={(event) => setCounterparty(event.target.value)} /></label>
      {transaction.type === 'expense' && <>
        <label>분류<input required value={category} onChange={(event) => setCategory(event.target.value)} /></label>
        <label>결제 수단<input required value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} /></label>
        <label>영수증 교체<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setEvidence(event.target.files?.[0])} /></label>
      </>}
      <label>메모<textarea value={memo} onChange={(event) => setMemo(event.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">저장</button>
    </form>
  </Modal>
}
