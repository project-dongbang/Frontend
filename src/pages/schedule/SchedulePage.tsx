import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DashboardShell } from '../dashboard/DashboardShell'
import { CalendarGrid } from './CalendarGrid'
import type { CalendarItem } from './scheduleMock'
import { ScheduleFormModal } from './ScheduleFormModal'
import { ScheduleDetailModal } from './ScheduleDetailModal'
import { ScheduleDeleteModal } from './ScheduleDeleteModal'
import { ScheduleEarlyCloseModal } from './ScheduleEarlyCloseModal'
import { ApiScheduleParticipantEditModal } from './ApiScheduleParticipantEditModal'
import './schedule.css'
import { scheduleApi } from '../../api/services'
import { errorMessage } from '../../api/client'
import { useSession } from '../../context/SessionContext'

export function SchedulePage() {
  const { activeOrganization } = useSession()
  const [searchParams, setSearchParams] = useSearchParams()
const isMember = activeOrganization?.myRole === 'MEMBER'
  const [currentDate, setCurrentDate] = useState(new Date())
  const [items, setItems] = useState<CalendarItem[]>([])
  const [loadError, setLoadError] = useState('')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(
    () => searchParams.get('dialog') === 'schedule-create',
  )
  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
    if (searchParams.get('dialog') === 'schedule-create') {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('dialog')
      setSearchParams(nextParams, { replace: true })
    }
  }
  const [selectedItem, setSelectedItem] =
  useState<CalendarItem | null>(null)
  const [editingItem, setEditingItem] =
  useState<CalendarItem | null>(null)
const [earlyCloseItem, setEarlyCloseItem] =
  useState<CalendarItem | null>(null)
const [deletingItem, setDeletingItem] =
  useState<CalendarItem | null>(null)
  const loadCalendar = useCallback(async () => {
    if (!activeOrganization) return
    setItems([])
    try {
      const response = await scheduleApi.calendar(activeOrganization.organizationId, year, month + 1)
      setItems((response.events ?? []).map((event) => ({
        id: String(event.eventId ?? event.feeItemId),
        title: event.title,
        type: event.type === 'EVENT' ? 'event' : event.type === 'FEE_DUE' ? 'fee' : 'schedule',
        start: (event.startsAt ?? `${event.dueDate}T23:59`).slice(0, 16),
        end: (event.endsAt ?? event.startsAt ?? `${event.dueDate}T23:59`).slice(0, 16),
      })))
      setLoadError('')
    } catch (requestError) { setLoadError(errorMessage(requestError)) }
  }, [activeOrganization, year, month])

  useEffect(() => { queueMicrotask(() => void loadCalendar()); window.addEventListener('dongbang:schedule-changed', loadCalendar); return () => window.removeEventListener('dongbang:schedule-changed', loadCalendar) }, [loadCalendar])

  const openItem = async (item: CalendarItem) => {
    if (!activeOrganization || item.type === 'fee') { setSelectedItem(item); return }
    try {
      const detail = await scheduleApi.detail(activeOrganization.organizationId, item.id)
      setSelectedItem({
        ...item,
        location: String(detail.location ?? ''),
        description: String(detail.description ?? ''),
        capacity: detail.capacity == null ? undefined : Number(detail.capacity),
        registered: detail.participantCount == null ? undefined : Number(detail.participantCount),
        deadline: detail.registrationDeadline ? String(detail.registrationDeadline).slice(0, 16) : undefined,
      })
    } catch (requestError) { setLoadError(errorMessage(requestError)) }
  }
  const [participantEditItem, setParticipantEditItem] =
  useState<CalendarItem | null>(null)
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleEditRequest = (item: CalendarItem) => {
  setEditingItem(item)
}

const handleDeleteRequest = (item: CalendarItem) => {
  setDeletingItem(item)
}
const handleEarlyCloseRequest = (
  item: CalendarItem,
) => {
  setEarlyCloseItem(item)
}
const handleParticipantEditRequest = (
  item: CalendarItem,
) => {
  setParticipantEditItem(item)
}

  return (
    <DashboardShell role={isMember ? 'member' : 'admin'}>
      <section className="schedule-page">
        <div className="schedule-header">
          <div>
            <div className="schedule-eyebrow">
              CALENDAR
            </div>

            <h1>캘린더·행사</h1>

            <p>
              동아리 일정과 참가 신청을 한곳에서 관리해요.
            </p>
          </div>
          {!isMember && (
          <button
            type="button"
            className="page-header-action schedule-create-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span>＋</span>
            일정 등록
          </button>
         )}
        </div>

        {loadError && <p role="alert">{loadError}</p>}
        <div className="calendar-card">
          <div className="calendar-top">
            <h2>
              {year}년 {month + 1}월
            </h2>

            <div className="calendar-controls">
              <button
                type="button"
                onClick={handlePreviousMonth}
                aria-label="이전 달"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="다음 달"
              >
                ›
              </button>
            </div>
          </div>

          <CalendarGrid
            year={year}
            month={month}
            items={items}
            onItemClick={(item) => void openItem(item)}
          />
        </div>
      </section>

         <ScheduleDetailModal
  key={selectedItem?.id ?? 'empty'}
  open={selectedItem !== null}
  item={selectedItem}
  isMember={isMember}
  onClose={() => setSelectedItem(null)}
  onEditRequest={handleEditRequest}
  onDeleteRequest={handleDeleteRequest}
  onEarlyCloseRequest={handleEarlyCloseRequest}
  onParticipantEditRequest={
    handleParticipantEditRequest
  }
/>
      <ScheduleFormModal
        key={isCreateModalOpen ? 'create-open' : 'create-closed'}
        open={isCreateModalOpen}
        onClose={closeCreateModal}
      />
      <ScheduleFormModal
        key={editingItem?.id ?? 'edit-empty'}
        open={editingItem !== null}
        item={editingItem}
        onClose={() => setEditingItem(null)}
      />

   

      <ScheduleDeleteModal
        open={deletingItem !== null}
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={async (item) => {
          if (!activeOrganization) return
          try { await scheduleApi.remove(activeOrganization.organizationId, item.id); setDeletingItem(null); setSelectedItem(null); await loadCalendar() }
          catch (requestError) { setLoadError(errorMessage(requestError)) }
        }}
      />
      <ScheduleEarlyCloseModal
  open={earlyCloseItem !== null}
  item={earlyCloseItem}
  onClose={() => setEarlyCloseItem(null)}
  onConfirm={() => {
    if (!activeOrganization || !earlyCloseItem) return
    void scheduleApi.closeApplications(activeOrganization.organizationId, earlyCloseItem.id)
      .then(() => setEarlyCloseItem(null))
      .catch((requestError) => setLoadError(errorMessage(requestError)))
  }}
/>

<ApiScheduleParticipantEditModal
  open={participantEditItem !== null}
  item={participantEditItem}
  onClose={() => setParticipantEditItem(null)}
  onSaved={() => void loadCalendar()}
/>

    </DashboardShell>
  )
}
