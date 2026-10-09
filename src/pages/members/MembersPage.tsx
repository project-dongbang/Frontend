import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Badge, Button, Card, EmptyState, PageHeader, Select } from '../../components/common'
import addIcon from '../../assets/dashboard-add.svg'
import searchIcon from '../../assets/member-search.svg'
import { DashboardShell } from '../dashboard/DashboardShell'
import { MemberFormModal } from './MemberFormModal'
import { MemberRoleModal } from './MemberRoleModal'
import { MemberInviteModal } from './MemberInviteModal'
import { filterMembers, membersToCsv } from './memberModel'
import type { Member, MemberRole } from './memberModel'
import type { MemberInfoUpdate } from './MemberFormModal'
import './members.css'
import { organizationApi } from '../../api/services'
import { errorMessage } from '../../api/client'
import { useSession } from '../../context/SessionContext'

export function MembersPage() {
  const [params, setParams] = useSearchParams()
  const { activeOrganization, refresh } = useSession()
  const isMember = activeOrganization?.myRole === 'MEMBER'
  const [members, setMembers] = useState<Member[]>([])
  const [membersOrganizationId, setMembersOrganizationId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [generation, setGeneration] = useState('')
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [roleMember, setRoleMember] = useState<Member | null>(null)
  const [notice, setNotice] = useState('')
  const tableRegion = useRef<HTMLDivElement>(null)
  const currentMembers = activeOrganization
    ? membersOrganizationId === activeOrganization.organizationId ? members : []
    : []
  const visibleMembers = filterMembers(currentMembers, query, generation)
  const generations = [...new Set(currentMembers.map((member) => member.generation))].sort((a, b) => parseInt(a) - parseInt(b))
  const staffCount = currentMembers.filter((member) => member.role !== '일반 회원' && member.status === '활동').length

  useEffect(() => {
    if (!activeOrganization) return
    const organizationId = activeOrganization.organizationId
    let cancelled = false
    organizationApi.members(organizationId)
      .then(({ members: apiMembers }) => {
        if (cancelled) return
        setMembers(apiMembers.map((member) => ({
          id: String(member.membershipId),
          name: member.memberName,
          studentId: member.studentNumber,
          generation: member.generation || '-',
          position: member.position ?? '',
          role: member.role === 'OWNER' ? '회장' : member.role === 'ADMIN' ? '운영진' : '일반 회원',
          status: member.status === 'ACTIVE' ? '활동' : member.status === 'INACTIVE' ? '휴면' : '탈퇴',
          payment: '확인 필요',
        })))
        setNotice('')
      })
      .catch((error) => { if (!cancelled) { setMembers([]); setNotice(errorMessage(error)) } })
      .finally(() => { if (!cancelled) setMembersOrganizationId(organizationId) })
    return () => { cancelled = true }
  }, [activeOrganization])

  function closeInvite() {
    setParams((current) => { const next = new URLSearchParams(current); next.delete('dialog'); return next }, { replace: true })
  }

  function openInvite() {
    setNotice('')
    setParams((current) => { const next = new URLSearchParams(current); next.set('dialog', 'invite'); return next })
  }

  async function saveMemberInfo(value: MemberInfoUpdate, editingId: string) {
    if (isMember || !activeOrganization) return
    try {
      await organizationApi.updateMemberInfo(activeOrganization.organizationId, Number(editingId), {
        generation: value.generation,
        position: value.position ?? '',
        status: value.status === '활동' ? 'ACTIVE' : 'INACTIVE',
      })
      const memberName = members.find((member) => member.id === editingId)?.name ?? '멤버'
      setMembers((current) => current.map((member) => member.id === editingId ? { ...member, ...value } : member))
      setEditingMember(null)
      setNotice(`${memberName} 멤버 정보를 저장했어요.`)
    } catch (error) { setNotice(errorMessage(error)) }
  }

  async function saveRole(roleValue: MemberRole, editingId: string) {
    if (isMember) return
    if (!activeOrganization) return
    try {
      const role = roleValue === '일반 회원' ? 'MEMBER' : 'ADMIN'
      await organizationApi.changeRole(activeOrganization.organizationId, Number(editingId), role)
      const memberName = members.find((member) => member.id === editingId)?.name ?? '멤버'
      setMembers((current) => current.map((member) => member.id === editingId ? { ...member, role: roleValue } : member))
      setRoleMember(null)
      setQuery('')
      setGeneration('')
      if (tableRegion.current) tableRegion.current.scrollTop = 0
      setNotice(`${memberName} 멤버의 역할을 저장했어요.`)
    } catch (error) { setNotice(errorMessage(error)) }
  }

  async function expelMember(member: Member) {
    if (!activeOrganization || !window.confirm(`${member.name}님을 동아리에서 내보낼까요?`)) return
    try {
      await organizationApi.expel(activeOrganization.organizationId, Number(member.id))
      setMembers((current) => current.filter((item) => item.id !== member.id))
      setNotice(`${member.name} 멤버를 내보냈어요.`)
    } catch (error) { setNotice(errorMessage(error)) }
  }

  async function delegateOwner(member: Member) {
    if (!activeOrganization || !window.confirm(`${member.name} 운영진에게 대표 권한을 위임할까요?`)) return
    try {
      await organizationApi.delegateOwner(activeOrganization.organizationId, Number(member.id))
      await refresh()
      const { members: apiMembers } = await organizationApi.members(activeOrganization.organizationId)
      setMembers(apiMembers.map((item) => ({ id: String(item.membershipId), name: item.memberName, studentId: item.studentNumber, generation: item.generation || '-', position: item.position ?? '', role: item.role === 'OWNER' ? '회장' : item.role === 'ADMIN' ? '운영진' : '일반 회원', status: item.status === 'ACTIVE' ? '활동' : item.status === 'INACTIVE' ? '휴면' : '탈퇴', payment: '확인 필요' })))
      setNotice(`${member.name}님에게 대표 권한을 위임했어요.`)
    } catch (error) { setNotice(errorMessage(error)) }
  }

  function exportMembers() {
    if (isMember || !visibleMembers.length) return
    const url = URL.createObjectURL(new Blob([membersToCsv(visibleMembers)], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `DongBang-멤버-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice(`현재 검색 결과 ${visibleMembers.length}명을 CSV로 내보냈어요.`)
  }

  return <DashboardShell role={isMember ? 'member' : 'admin'}>
    <section className="members-page">
      <PageHeader eyebrow="MEMBERS" title="멤버 관리" description="동아리 멤버를 조회하고 역할을 관리해요."
        action={!isMember && <Button className="page-header-action member-invite-button" onClick={openInvite}><img src={addIcon} alt="" width={17} height={17} />멤버 초대</Button>} />
      {isMember ? <Card><EmptyState title="운영진만 이용할 수 있어요" description="멤버 조회와 관리는 동아리 운영진에게 문의해 주세요." /></Card> : <>
        <Card className="members-card" title={`전체 멤버 ${currentMembers.length}명`} description={`운영진 ${staffCount}명 · 검색 결과 ${visibleMembers.length}명`}
          action={<div className="members-toolbar">
            <label className="members-search"><img src={searchIcon} alt="" width={15.125} height={17} /><input aria-label="멤버 이름 또는 학번 검색" type="search" placeholder="이름 또는 학번 검색" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <Select aria-label="기수 필터" value={generation} onChange={(event) => setGeneration(event.target.value)}><option value="">전체 기수</option>{generations.map((item) => <option key={item}>{item}</option>)}</Select>
            <Button variant="secondary" onClick={exportMembers} disabled={!visibleMembers.length}>내보내기</Button>
          </div>}>
          {visibleMembers.length ? <div ref={tableRegion} className="members-table-scroll" role="region" aria-label="멤버 목록" tabIndex={0}>
            <table className="members-table">
              <caption className="members-sr-only">멤버 이름, 학번, 기수, 역할, 납부 및 활동 상태</caption>
              <colgroup><col className="member-col-name" /><col className="member-col-generation" /><col className="member-col-role" /><col className="member-col-payment" /><col className="member-col-status" /><col /></colgroup>
              <thead><tr>{['멤버', '기수', '역할', '납부', '상태', '관리'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
              <tbody>{visibleMembers.map((member) => <tr key={member.id}>
                <td><div className="member-identity"><span className="member-avatar" aria-hidden="true">{member.name.slice(0, 1)}</span><div><strong>{member.name}</strong><span>{member.studentId}</span></div></div></td>
                <td>{member.generation}</td><td>{member.position || member.role}</td>
                <td><Badge tone={member.payment === '납부 완료' ? 'success' : member.payment === '미납' ? 'warning' : 'neutral'}>{member.payment}</Badge></td>
                <td>{member.status}</td>
                <td><div className="member-row-actions">
                  {member.status !== '탈퇴' && <Button variant="ghost" aria-label={`${member.name} ${member.studentId} 정보 수정`} onClick={() => { setNotice(''); setEditingMember(member) }}>정보 수정</Button>}
                  {member.role !== '회장' && member.status !== '탈퇴' && <Button variant="ghost" aria-label={`${member.name} ${member.studentId} 역할 변경`} onClick={() => { setNotice(''); setRoleMember(member) }}>역할 변경</Button>}
                  {member.role === '운영진' && activeOrganization?.myRole === 'OWNER' && <Button variant="ghost" onClick={() => void delegateOwner(member)}>대표 위임</Button>}
                  {member.role !== '회장' && <Button variant="ghost" onClick={() => void expelMember(member)}>추방</Button>}
                </div></td>
              </tr>)}</tbody>
            </table>
          </div> : <EmptyState title="검색 결과가 없어요" description="이름·학번이나 선택한 기수를 다시 확인해 주세요." action={<Button variant="secondary" onClick={() => { setQuery(''); setGeneration('') }}>검색 초기화</Button>} />}
        </Card>
        <p className="members-notice" role="status">{notice}</p>
      </>}
    </section>
    {!isMember && params.get('dialog') === 'invite' && !editingMember && !roleMember && <MemberInviteModal onClose={closeInvite} />}
    {!isMember && editingMember && <MemberFormModal key={editingMember.id} member={editingMember} onClose={() => setEditingMember(null)} onSave={saveMemberInfo} />}
    {!isMember && roleMember && <MemberRoleModal key={roleMember.id} member={roleMember} onClose={() => setRoleMember(null)} onSave={saveRole} />}
  </DashboardShell>
}
