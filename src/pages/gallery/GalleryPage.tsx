import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Input, Modal } from '../../components/common'
import { DashboardShell } from '../dashboard/DashboardShell'
import { galleryMock, type GalleryPhoto, type GalleryTone } from './galleryMock'
import './gallery.css'

type Dialog = 'detail' | 'add' | 'edit' | 'delete' | null

const nextTone: GalleryTone = 'sky'

export function GalleryPage() {
  const [params] = useSearchParams()
  const isMember = params.get('role') === 'member'
  const [photos, setPhotos] = useState(galleryMock)
  const [selected, setSelected] = useState<GalleryPhoto | null>(null)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [title, setTitle] = useState('')
  const [fileName, setFileName] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const close = () => { setDialog(null); setSelected(null); setTitle(''); setFileName('') }
  const openDetail = (photo: GalleryPhoto) => { setSelected(photo); setDialog('detail') }
  const openEdit = () => { if (!selected) return; setTitle(selected.title); setDialog('edit') }
  const addPhoto = () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    setPhotos((current) => [...current, { id: crypto.randomUUID(), title: trimmedTitle, createdAt: '2026.09.14', tone: nextTone }])
    close()
  }
  const saveEdit = () => {
    if (!selected || !title.trim()) return
    setPhotos((current) => current.map((photo) => photo.id === selected.id ? { ...photo, title: title.trim() } : photo))
    setSelected((current) => current ? { ...current, title: title.trim() } : current)
    setDialog('detail')
  }
  const deletePhoto = () => {
    if (!selected) return
    setPhotos((current) => current.filter((photo) => photo.id !== selected.id))
    close()
  }

  return <DashboardShell role={isMember ? 'member' : 'admin'}>
    <section className="gallery-page">
      <header className="gallery-header"><div><span className="gallery-kicker">CLUB GALLERY</span><h1>사진첩</h1><p>동아리 활동의 순간을 함께 기록해요.</p></div>{!isMember && <Button onClick={() => setDialog('add')}>사진 추가</Button>}</header>
      <section className="gallery-card" aria-label="사진 목록"><div className="gallery-grid">{photos.map((photo) => <button type="button" className={`gallery-thumbnail tone-${photo.tone}`} onClick={() => openDetail(photo)} key={photo.id}><GalleryArtwork tone={photo.tone} /><strong>{photo.title}</strong></button>)}</div><p>썸네일을 누르면 사진을 크게 볼 수 있어요.</p></section>
    </section>

    <Modal open={dialog === 'detail' && selected !== null} title="사진 상세" onClose={close}><PhotoDetail photo={selected} />{!isMember && <div className="gallery-detail-actions"><Button variant="secondary" onClick={openEdit}>수정</Button><Button onClick={() => setDialog('delete')}>삭제</Button></div>}</Modal>
    <Modal open={dialog === 'add'} title="사진 설명" onClose={close} confirmLabel="사진 추가" onConfirm={addPhoto}><Input label="사진 제목" placeholder="예: 9월 개강 총회" value={title} onChange={(event) => setTitle(event.target.value)} autoFocus required /><button type="button" className="gallery-file-select" onClick={() => fileInput.current?.click()}>{fileName || '사진 파일 선택'}<span>JPG · PNG · WEBP</span></button></Modal>
    <Modal open={dialog === 'edit'} title="사진 수정" onClose={() => setDialog('detail')} confirmLabel="저장" onConfirm={saveEdit}><Input label="사진 제목" value={title} onChange={(event) => setTitle(event.target.value)} autoFocus required /><button type="button" className="gallery-file-select" onClick={() => fileInput.current?.click()}>사진 교체<span>{fileName || '새 사진을 선택하지 않으면 제목만 변경됩니다.'}</span></button></Modal>
    <Modal open={dialog === 'delete' && selected !== null} title="이 사진을 삭제할까요?" description="사진첩과 연결된 활동 화면에서 이 사진이 더 이상 표시되지 않습니다." tone="danger" onClose={() => setDialog('detail')} confirmLabel="사진 삭제" onConfirm={deletePhoto}><div className="gallery-delete-summary"><strong>{selected?.title}</strong><span>등록일 {selected?.createdAt} · 운영진 등록</span></div><p className="gallery-delete-warning">삭제한 사진은 복구할 수 없습니다.</p></Modal>
    <input ref={fileInput} className="gallery-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')} />
  </DashboardShell>
}

function PhotoDetail({ photo }: { photo: GalleryPhoto | null }) {
  if (!photo) return null
  return <div className="gallery-detail"><div className={`gallery-detail-art tone-${photo.tone}`}><GalleryArtwork tone={photo.tone} /></div><strong>{photo.title}</strong><span>등록일 {photo.createdAt}</span></div>
}

function GalleryArtwork({ tone }: { tone: GalleryTone }) { return <span className={`gallery-art tone-${tone}`} aria-hidden="true"><i /><b /><em /></span> }
