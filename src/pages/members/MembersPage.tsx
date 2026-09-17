import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Badge, Button, Card, EmptyState, PageHeader, Select } from '../../components/common'
import addIcon from '../../assets/dashboard-add.svg'
import searchIcon from '../../assets/member-search.svg'
import { DashboardShell } from '../dashboard/DashboardShell'
import { MemberFormModal } from './MemberFormModal'
import { MemberInviteModal } from './MemberInviteModal'
import { filterMembers, membersToCsv } from './memberModel'
import type { Member, MemberForm } from './memberModel'
import { membersMock } from './membersMock'
import './members.css'

export function MembersPage() {
  const [params, setParams] = useSearchParams()
  const isMember = params.get('role') === 'member'
  const [members, setMembers] = useState<Member[]>(membersMock)
  const [query, setQuery] = useState('')
  const [generation, setGeneration] = useState('')
  const [form, setForm] = useState<{ member?: Member } | null>(null)
  const [notice, setNotice] = useState('')
  const tableRegion = useRef<HTMLDivElement>(null)
  const visibleMembers = filterMembers(members, query, generation)
  const generations = [...new Set(members.map((member) => member.generation))].sort((a, b) => parseInt(a) - parseInt(b))
  const staffCount = members.filter((member) => member.role !== '일반 회원' && member.status === '활동').length

  function closeInvite() {
    setParams((current) => { const next = new URLSearchParams(current); next.delete('dialog'); return next }, { replace: true })
  }

  function openInvite() {
    setNotice('')
    setParams((current) => { const next = new URLSearchParams(current); next.set('dialog', 'invite'); return next })
  }

  function saveMember(value: MemberForm, editingId?: string) {
    if (isMember) return
    setMembers((current) => editingId
      ? current.map((member) => member.id === editingId ? { ...member, ...value } : member)
      // A fee API must supply the payment status; never mark a new member paid locally.
      : [{ ...value, id: crypto.randomUUID(), payment: '확인 필요' }, ...current])
    setForm(null)
    setQuery('')
    setGeneration('')
    if (tableRegion.current) tableRegion.current.scrollTop = 0
    setNotice(`${value.name} 멤버${editingId ? '의 정보를 저장했어요.' : '를 등록했어요.'}`)
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
      <PageHeader eyebrow="MEMBERS" title="멤버 관리" description="동아리 소속, 역할, 활동 상태를 한눈에 관리해요."
        action={!isMember && <Button className="member-invite-button" onClick={openInvite}><img src={addIcon} alt="" width={17} height={17} />멤버 초대</Button>} />
      {isMember ? <Card><EmptyState title="운영진만 이용할 수 있어요" description="멤버 조회와 관리는 동아리 운영진에게 문의해 주세요." /></Card> : <>
        <Card className="members-card" title={`전체 멤버 ${members.length}명`} description={`운영진 ${staffCount}명 · 검색 결과 ${visibleMembers.length}명`}
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
                <td>{member.generation}</td><td>{member.role}</td>
                <td><Badge tone={member.payment === '납부 완료' ? 'success' : member.payment === '미납' ? 'warning' : 'neutral'}>{member.payment}</Badge></td>
                <td>{member.status}</td>
                <td><Button variant="ghost" aria-label={`${member.name} ${member.studentId} 정보 수정`} onClick={() => { setNotice(''); setForm({ member }) }}>수정</Button></td>
              </tr>)}</tbody>
            </table>
          </div> : <EmptyState title="검색 결과가 없어요" description="이름·학번이나 선택한 기수를 다시 확인해 주세요." action={<Button variant="secondary" onClick={() => { setQuery(''); setGeneration('') }}>검색 초기화</Button>} />}
        </Card>
        <p className="members-notice" role="status">{notice}</p>
      </>}
    </section>
    {!isMember && params.get('dialog') === 'invite' && !form && <MemberInviteModal onClose={closeInvite} onRegister={() => { closeInvite(); setForm({}) }} />}
    {!isMember && form && <MemberFormModal key={form.member?.id ?? 'new'} member={form.member} members={members} onClose={() => setForm(null)} onSave={saveMember} />}
  </DashboardShell>
}
