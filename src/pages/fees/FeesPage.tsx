import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ApiMemberFeesPage } from './ApiMemberFeesPage'
import { DashboardShell } from '../dashboard/DashboardShell'
import { ExpenseCreateModal } from './components/ExpenseCreateModal'
import { FeeItemModal } from './components/FeeItemModal'
import { IncomeCreateModal } from './components/IncomeCreateModal'
import { FeesLedger } from './components/FeesLedger'
import { FeesPayments } from './components/FeesPayments'
import {
  FeesTabs,
  type FeesTab,
} from './components/FeesTabs'
import { FeesSummary } from './components/FeesSummary'

import {
  type FeeCollection,
  type FeeCollectionDraft,
} from './feesMock'

import './fees.css'
import { feesApi, organizationApi } from '../../api/services'
import { errorMessage } from '../../api/client'
import { useSession } from '../../context/SessionContext'
import type { FeesTransaction, FeePaymentMember } from './feesMock'

export function FeesPage() {
  const { activeOrganization } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] =
    useState<FeesTab>('ledger')

  const [paymentMembers, setPaymentMembers] =
    useState<FeePaymentMember[]>([])
  const [collections, setCollections] =
    useState<FeeCollection[]>([])
  const [transactions, setTransactions] = useState<FeesTransaction[]>([])
  const [availableMembers, setAvailableMembers] = useState<FeePaymentMember[]>([])
  const [requestError, setRequestError] = useState('')
  const [ledgerSummary, setLedgerSummary] = useState({ balance: 0, expense: 0, expenseCount: 0 })

  const [paymentSummary, setPaymentSummary] = useState({
    feeItemId: 0,
    targetCount: 0,
    paidCount: 0,
    unpaidCount: 0,
    paymentRate: 0,
  })

  const [feeItemModalOpen, setFeeItemModalOpen] =
    useState(() => searchParams.get('dialog') === 'fee-item-create')
  const [editingFeeCollection, setEditingFeeCollection] =
    useState<FeeCollection | null>(null)
  const [incomeModalOpen, setIncomeModalOpen] =
    useState(false)
  const [expenseModalOpen, setExpenseModalOpen] =
    useState(false)

  const loadFees = useCallback(async () => {
    if (!activeOrganization) return
    setCollections([])
    setTransactions([])
    setAvailableMembers([])
    setPaymentMembers([])
    setLedgerSummary({ balance: 0, expense: 0, expenseCount: 0 })
    setPaymentSummary({ feeItemId: 0, targetCount: 0, paidCount: 0, unpaidCount: 0, paymentRate: 0 })
    try {
      const [ledgerRaw, itemsRaw, memberRaw] = await Promise.all([
        feesApi.ledger(activeOrganization.organizationId),
        feesApi.feeItems(activeOrganization.organizationId),
        organizationApi.members(activeOrganization.organizationId),
      ])
      const ledger = ledgerRaw as { content?: Array<Record<string, unknown>>; summary?: Record<string, unknown> }
      const items = itemsRaw as { content?: Array<Record<string, unknown>> }
      const mappedTransactions: FeesTransaction[] = (ledger.content ?? []).map((item) => ({
        id: String(item.transactionId ?? item.feeItemId),
        date: String(item.occurredOn ?? '').replaceAll('-', '.'),
        title: String(item.title ?? ''),
        description: String(item.counterparty ?? ''),
        category: String(item.category ?? (item.transactionType === 'INCOME' ? '수입' : '기타')),
        amount: Number(item.amount ?? 0),
        type: item.transactionType === 'INCOME' ? 'income' : 'expense',
        author: String(item.createdByName ?? '시스템'),
        proofText: item.hasEvidence ? '영수증 보기' : '상세 보기',
      }))
      setTransactions(mappedTransactions)
      const summary = ledger.summary ?? {}
      const period = summary.period as { expenseCount?: number; expenseAmount?: number } | undefined
      const incomeTotal = Number(summary.totalIncome ?? summary.income ?? summary.incomeAmount ?? 0)
      const expenseTotal = Number(summary.totalExpense ?? summary.expense ?? summary.expenseAmount ?? 0)
      setLedgerSummary({ balance: Number(summary.balance ?? summary.currentBalance ?? (incomeTotal - expenseTotal)), expense: Number(period?.expenseAmount ?? expenseTotal), expenseCount: Number(period?.expenseCount ?? 0) })
      const mappedCollections: FeeCollection[] = (items.content ?? []).map((item) => ({
        id: String(item.feeItemId), title: String(item.title ?? ''), dueDate: String(item.dueDate ?? '').replaceAll('-', '.'), description: '', bank: '', accountNumber: '', accountHolder: '', categories: [],
      }))
      setCollections(mappedCollections)
      setAvailableMembers(memberRaw.members.filter((member) => member.status === 'ACTIVE').map((member) => ({ id: String(member.membershipId), membershipId: String(member.membershipId), name: member.memberName, studentId: member.studentNumber, generation: member.generation || '-', amount: 0, status: 'unpaid' })))
      if (mappedCollections[0]) {
        const targetsRaw = await feesApi.feeTargets(activeOrganization.organizationId, mappedCollections[0].id) as { content?: Array<Record<string, unknown>>; summary?: { targetCount?: number; paidCount?: number; unpaidCount?: number; paymentRate?: number } }
        const targets = (targetsRaw.content ?? []).map((target): FeePaymentMember => ({
          id: String(target.feeTargetId), membershipId: String(target.membershipId), name: String(target.name), studentId: String(target.studentNumber), generation: String(target.generation ?? '-'), amount: Number(target.amountDue ?? 0), status: target.status === 'PAID' ? 'paid' : 'unpaid',
        }))
        setPaymentMembers(targets)
        const targetCount = Number(targetsRaw.summary?.targetCount ?? targets.length)
        const paidCount = Number(targetsRaw.summary?.paidCount ?? targets.filter((target) => target.status === 'paid').length)
        setPaymentSummary({ feeItemId: Number(mappedCollections[0].id), targetCount, paidCount, unpaidCount: Number(targetsRaw.summary?.unpaidCount ?? targetCount - paidCount), paymentRate: Number(targetsRaw.summary?.paymentRate ?? (targetCount ? paidCount / targetCount * 100 : 0)) })
      } else setPaymentMembers([])
      setRequestError('')
    } catch (error) { setRequestError(errorMessage(error)) }
  }, [activeOrganization])

  useEffect(() => { queueMicrotask(() => void loadFees()); window.addEventListener('dongbang:fees-changed', loadFees); return () => window.removeEventListener('dongbang:fees-changed', loadFees) }, [loadFees])

  const closeFeeItemModal = () => {
    setFeeItemModalOpen(false)
    setEditingFeeCollection(null)
    if (searchParams.get('dialog') === 'fee-item-create') {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('dialog')
      setSearchParams(nextParams, { replace: true })
    }
  }

  const handleFeeItemSave = async (
    draft: FeeCollectionDraft,
  ) => {
    if (!activeOrganization) return
    const base = { title: draft.title, dueDate: draft.dueDate.replaceAll('.', '-'), description: draft.description, paymentAccount: { bankName: draft.bank, accountNumber: draft.accountNumber, accountHolder: draft.accountHolder } }
    const categories = draft.categories.map((category) => ({ name: category.name, amount: category.amount, targetMembershipIds: category.memberIds.map(Number).filter(Number.isFinite) }))
    try {
      if (editingFeeCollection) await feesApi.updateFeeItem(activeOrganization.organizationId, editingFeeCollection.id, { ...base, categories })
      else await feesApi.createFeeItem(activeOrganization.organizationId, { ...base, categories })
      closeFeeItemModal()
      await loadFees()
    } catch (error) { setRequestError(errorMessage(error)); throw error }
  }

  const handleFeeItemDelete = async () => {
    if (!editingFeeCollection) {
      return
    }

    if (!activeOrganization) return
    try { await feesApi.deleteFeeItem(activeOrganization.organizationId, editingFeeCollection.id); closeFeeItemModal(); await loadFees() }
    catch (error) { setRequestError(errorMessage(error)) }
  }

  const handlePaymentStatusChange = async (
    _collectionId: string,
    memberId: string,
    status: 'paid' | 'unpaid',
  ) => {
    if (!activeOrganization) return
    try { await feesApi.changeTarget(activeOrganization.organizationId, memberId, status === 'paid' ? 'PAID' : 'UNPAID') }
    catch (error) { setRequestError(errorMessage(error)); return }

    setPaymentMembers((current) =>
      current.map((member) =>
        member.id === memberId
          ? { ...member, status }
          : member,
      ),
    )

    setPaymentSummary((current) => {
      const paidCount =
        current.paidCount +
        (status === 'paid' ? 1 : -1)

      return {
        ...current,
        paidCount,
        unpaidCount:
          current.targetCount - paidCount,
        paymentRate: Number(
          (
            (paidCount / current.targetCount) *
            100
          ).toFixed(1),
        ),
      }
    })
  }

  const handleCollectionChange = async (collectionId: string) => {
    if (!activeOrganization) return
    try {
      const targetsRaw = await feesApi.feeTargets(activeOrganization.organizationId, collectionId) as { content?: Array<Record<string, unknown>>; summary?: { targetCount?: number; paidCount?: number; unpaidCount?: number; paymentRate?: number } }
      const targets = (targetsRaw.content ?? []).map((target): FeePaymentMember => ({
        id: String(target.feeTargetId),
        membershipId: String(target.membershipId),
        name: String(target.name),
        studentId: String(target.studentNumber),
        generation: String(target.generation ?? '-'),
        amount: Number(target.amountDue ?? 0),
        status: target.status === 'PAID' ? 'paid' : 'unpaid',
      }))
      setPaymentMembers(targets)
      const targetCount = Number(targetsRaw.summary?.targetCount ?? targets.length)
      const paidCount = Number(targetsRaw.summary?.paidCount ?? targets.filter((target) => target.status === 'paid').length)
      setPaymentSummary({ feeItemId: Number(collectionId), targetCount, paidCount, unpaidCount: Number(targetsRaw.summary?.unpaidCount ?? targetCount - paidCount), paymentRate: Number(targetsRaw.summary?.paymentRate ?? (targetCount ? paidCount / targetCount * 100 : 0)) })
      setRequestError('')
    } catch (error) {
      setRequestError(errorMessage(error))
    }
  }

  const handlePaymentExport = (
    collectionId: string,
  ) => {
    if (!activeOrganization) return
    window.location.assign(feesApi.exportTargetsUrl(activeOrganization.organizationId, collectionId))
  }
  const openFeeEditor = async (collection: FeeCollection) => {
    if (!activeOrganization) return
    try {
      const detail = await feesApi.feeItemDetail(activeOrganization.organizationId, collection.id) as {
        title?: string
        dueDate?: string
        description?: string
        editDetails?: { paymentAccount?: { bankName?: string; accountNumber?: string; accountHolder?: string }; categoriesEditable?: boolean; categories?: Array<{ categoryId: number; name: string; amount: number; targets?: Array<{ membershipId: number }> }> }
      }
      const editDetails = detail.editDetails
      setEditingFeeCollection({
        ...collection,
        title: String(detail.title ?? collection.title),
        dueDate: String(detail.dueDate ?? collection.dueDate).replaceAll('-', '.'),
        description: String(detail.description ?? ''),
        bank: editDetails?.paymentAccount?.bankName ?? '',
        accountNumber: editDetails?.paymentAccount?.accountNumber ?? '',
        accountHolder: editDetails?.paymentAccount?.accountHolder ?? '',
        categories: (editDetails?.categories ?? []).map((category) => ({
          id: String(category.categoryId),
          name: category.name,
          amount: Number(category.amount ?? 0),
          memberIds: (category.targets ?? []).map((target) => String(target.membershipId)),
        })),
      })
      setFeeItemModalOpen(true)
      setRequestError('')
    } catch (error) { setRequestError(errorMessage(error)) }
  }
  if (activeOrganization?.myRole === 'MEMBER') {
    return <ApiMemberFeesPage />
  }

  return (
    <DashboardShell role="admin">
      <section className="fees-page">
        <header className="fees-page-head">
          <div>
            <div className="fees-eyebrow">
              OPEN LEDGER
            </div>

            <h1>회비 관리</h1>

            <p>
              납부부터 사용 내역, 증빙과 잔여금까지
              투명하게 공개해요.
            </p>
          </div>

          <div className="fees-page-actions">
            <button
              type="button"
              className="page-header-action fees-secondary-btn"
              onClick={() => {
                setEditingFeeCollection(null)
                setFeeItemModalOpen(true)
              }}
            >
              납부 항목 등록
            </button>

            <button
              type="button"
              className="page-header-action fees-secondary-btn"
              onClick={() =>
                setIncomeModalOpen(true)
              }
            >
              입금 내역 등록
            </button>

            <button
              type="button"
              className="page-header-action fees-primary-btn"
              onClick={() =>
                setExpenseModalOpen(true)
              }
            >
              <span aria-hidden="true">＋</span>
              출금 내역 등록
            </button>
          </div>
        </header>
        {requestError && <p role="alert">{requestError}</p>}

        <FeesSummary
          balance={ledgerSummary.balance}
          semesterExpense={ledgerSummary.expense}
          expenseCount={ledgerSummary.expenseCount}
          paidCount={paymentSummary.paidCount}
          totalCount={paymentSummary.targetCount}
        />

        <FeesTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'ledger' ? (
            <FeesLedger
              transactions={transactions}
          />
        ) : (
          <FeesPayments
            collections={collections}
            members={paymentMembers}
            paymentSummary={paymentSummary}
            onPaymentStatusChange={
              handlePaymentStatusChange
            }
            onExport={handlePaymentExport}
            onCollectionChange={(collectionId) => void handleCollectionChange(collectionId)}
            onEditCollection={(collection) => {
              void openFeeEditor(collection)
            }}
          />
        )}
      </section>

      {feeItemModalOpen && (
        <FeeItemModal
          key={editingFeeCollection?.id ?? 'create'}
          collection={editingFeeCollection ?? undefined}
          members={availableMembers}
          onClose={closeFeeItemModal}
          onSave={handleFeeItemSave}
          onDelete={
            editingFeeCollection
              ? handleFeeItemDelete
              : undefined
          }
        />
      )}
      {incomeModalOpen && (
        <IncomeCreateModal
          onClose={() => setIncomeModalOpen(false)}
        />
      )}
      {expenseModalOpen && (
        <ExpenseCreateModal
          onClose={() => setExpenseModalOpen(false)}
        />
      )}
    </DashboardShell>
  )
}
