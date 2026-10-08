import { useEffect, useMemo, useState } from 'react'
import { errorMessage } from '../../api/client'
import { scheduleApi } from '../../api/services'
import { useSession } from '../../context/SessionContext'
import type { CalendarItem } from './scheduleMock'

type ParticipantStatus = 'ADDED' | 'KEPT' | 'EXCLUDED'

type Participant = {
  id: number
  name: string
  studentNumber: string
  department: string
  initiallyParticipating: boolean
  allowedActions: Array<'ADD' | 'REMOVE'>
  status: ParticipantStatus
}

type Props = {
  open: boolean
  item: CalendarItem | null
  onClose: () => void
  onSaved?: () => void
}

export function ApiScheduleParticipantEditModal({ open, item, onClose, onSaved }: Props) {
  const { activeOrganization } = useSession()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [participantVersion, setParticipantVersion] = useState(0)
  const [capacity, setCapacity] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [requestError, setRequestError] = useState('')

  useEffect(() => {
    if (!open || !item || !activeOrganization) return
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true)
        setRequestError('')
      }
    })
    scheduleApi.participantCandidates(activeOrganization.organizationId, item.id)
      .then((raw) => {
        if (cancelled) return
        const response = raw as { capacity?: number; participantVersion?: number; members?: Array<Record<string, unknown>> }
        setCapacity(response.capacity ?? null)
        setParticipantVersion(Number(response.participantVersion ?? 0))
        setParticipants((response.members ?? []).map((member) => {
          const participating = Boolean(member.participating)
          return {
            id: Number(member.membershipId),
            name: String(member.memberName ?? ''),
            studentNumber: String(member.studentNumber ?? ''),
            department: String(member.department ?? ''),
            initiallyParticipating: participating,
            allowedActions: (member.allowedActions ?? []) as Array<'ADD' | 'REMOVE'>,
            status: participating ? 'KEPT' : 'EXCLUDED',
          }
        }))
      })
      .catch((error) => setRequestError(errorMessage(error)))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [activeOrganization, item, open])

  const filteredParticipants = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return participants
    return participants.filter((participant) => participant.name.toLowerCase().includes(keyword) || participant.studentNumber.includes(keyword))
  }, [participants, search])

  if (!open || !item) return null

  const addedCount = participants.filter((participant) => participant.status === 'ADDED').length
  const excludedCount = participants.filter((participant) => participant.initiallyParticipating && participant.status === 'EXCLUDED').length
  const currentCount = participants.filter((participant) => participant.status !== 'EXCLUDED').length

  const handleToggle = (participant: Participant) => {
    if (participant.status === 'EXCLUDED') {
      if (!participant.allowedActions.includes('ADD')) return
      setParticipants((current) => current.map((value) => value.id === participant.id ? { ...value, status: value.initiallyParticipating ? 'KEPT' : 'ADDED' } : value))
      return
    }
    if (!participant.allowedActions.includes('REMOVE')) return
    setParticipants((current) => current.map((value) => value.id === participant.id ? { ...value, status: 'EXCLUDED' } : value))
  }

  const handleSave = async () => {
    if (!activeOrganization) return
    const changes: Array<{ membershipId: number; action: 'ADD' | 'REMOVE' }> = []
    participants.forEach((participant) => {
      if (!participant.initiallyParticipating && participant.status === 'ADDED') changes.push({ membershipId: participant.id, action: 'ADD' })
      if (participant.initiallyParticipating && participant.status === 'EXCLUDED') changes.push({ membershipId: participant.id, action: 'REMOVE' })
    })
    if (changes.length === 0) { onClose(); return }
    try {
      setLoading(true)
      await scheduleApi.changeParticipants(activeOrganization.organizationId, item.id, participantVersion, changes)
      onSaved?.()
      onClose()
    } catch (error) {
      setRequestError(errorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="schedule-modal-backdrop nested" onMouseDown={onClose}>
      <div className="schedule-participant-dialog" role="dialog" aria-modal="true" aria-labelledby="participant-edit-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="schedule-participant-content">
          <div className="schedule-participant-head">
            <span className="schedule-participant-label">참가자 관리</span>
            <h2 id="participant-edit-title">참가자 직접 수정</h2>
            <p>상태 버튼을 눌러 행사 참가자를 추가하거나 제외하세요.</p>
          </div>
          <input type="search" className="schedule-participant-search" placeholder="이름 또는 학번으로 검색" value={search} onChange={(event) => setSearch(event.target.value)} />
          {requestError && <p role="alert">{requestError}</p>}
          <div className="schedule-participant-list">
            {loading && participants.length === 0 ? <p>참가자 목록을 불러오는 중입니다.</p> : filteredParticipants.map((participant) => (
              <div key={participant.id} className={`schedule-participant-card ${participant.status === 'EXCLUDED' ? 'excluded' : participant.status === 'ADDED' ? 'added' : ''}`}>
                <div className="schedule-participant-info"><strong>{participant.name}</strong><span>{participant.studentNumber} · {participant.department}</span></div>
                <button type="button" className={`schedule-participant-state ${participant.status.toLowerCase()}`} onClick={() => handleToggle(participant)} disabled={loading}>
                  {participant.status === 'ADDED' ? '추가됨' : participant.status === 'KEPT' ? '참가 중' : '제외됨'}
                </button>
              </div>
            ))}
          </div>
          <div className="schedule-participant-summary">
            현재 {currentCount}{capacity == null ? '명' : ` / ${capacity}명`}<span> · </span>추가 {addedCount}명<span> · </span>제외 {excludedCount}명
          </div>
        </div>
        <div className="schedule-participant-footer">
          <button type="button" className="schedule-participant-cancel" onClick={onClose}>취소</button>
          <button type="button" className="schedule-participant-save" onClick={() => void handleSave()} disabled={loading}>변경사항 저장</button>
        </div>
      </div>
    </div>
  )
}
