import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DashboardShell } from '../dashboard/DashboardShell'
import { CalendarGrid } from './CalendarGrid'
import {calendarMockData,type CalendarItem,} from './scheduleMock'
import { ScheduleFormModal } from './ScheduleFormModal'
import { ScheduleDetailModal } from './ScheduleDetailModal'
import { ScheduleDeleteModal } from './ScheduleDeleteModal'
import { ScheduleEarlyCloseModal } from './ScheduleEarlyCloseModal'
import { ScheduleParticipantEditModal } from './ScheduleParticipantEditModal'
import './schedule.css'

export function SchedulePage() {
  const [searchParams] = useSearchParams()
const role = searchParams.get('role')

const isMember = role === 'member'
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] =
  useState<CalendarItem | null>(null)
  const [editingItem, setEditingItem] =
  useState<CalendarItem | null>(null)
const [earlyCloseItem, setEarlyCloseItem] =
  useState<CalendarItem | null>(null)
const [deletingItem, setDeletingItem] =
  useState<CalendarItem | null>(null)
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
            className="schedule-create-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span>＋</span>
            일정 등록
          </button>
         )}
        </div>

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
            items={calendarMockData}
            onItemClick={setSelectedItem}
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
        onClose={() => setIsCreateModalOpen(false)}
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
      />
      <ScheduleEarlyCloseModal
  open={earlyCloseItem !== null}
  item={earlyCloseItem}
  onClose={() => setEarlyCloseItem(null)}
  onConfirm={() => {
    // TODO: 일정 조기 마감 API 연결

    setEarlyCloseItem(null)
  }}
/>

<ScheduleParticipantEditModal
  open={participantEditItem !== null}
  item={participantEditItem}
  onClose={() => setParticipantEditItem(null)}
/>

    </DashboardShell>
  )
}