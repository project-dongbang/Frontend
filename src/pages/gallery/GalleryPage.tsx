import { useEffect, useRef, useState } from 'react'
import { DashboardShell } from '../dashboard/DashboardShell'
import { Button } from '../../components/common'
import { GalleryArtwork } from './GalleryArtwork'
import { GalleryDeleteModal } from './GalleryDeleteModal'
import { GalleryDetailModal } from './GalleryDetailModal'
import { GalleryPhotoFormModal } from './GalleryPhotoFormModal'
import { validatePhotoFile } from './validatePhotoFile'
import type { GalleryPhoto, GalleryTone } from './galleryTypes'
import type { PhotoDetail, PhotoListItem } from '../../api/types'
import './gallery.css'
import { photoApi } from '../../api/services'
import { errorMessage } from '../../api/client'
import { useSession } from '../../context/SessionContext'

type Dialog = 'detail' | 'form' | 'delete' | null
const tones: GalleryTone[] = ['sky', 'sand', 'blue']

function fromList(photo: PhotoListItem, index: number): GalleryPhoto {
  return {
    id: String(photo.photoId),
    title: photo.title ?? '',
    createdAt: photo.createdAt.slice(0, 10).replaceAll('-', '.'),
    tone: tones[index % tones.length],
    imageUrl: photo.imageUrl ?? undefined,
  }
}

function fromDetail(photo: PhotoDetail, tone: GalleryTone = 'sky'): GalleryPhoto {
  return {
    id: String(photo.photoId),
    title: photo.title ?? '',
    createdAt: photo.createdAt.slice(0, 10).replaceAll('-', '.'),
    tone,
    imageUrl: photo.file.url,
  }
}

export function GalleryPage() {
  const { activeOrganization } = useSession()
  const currentOrganizationId = useRef(activeOrganization?.organizationId)
  useEffect(() => { currentOrganizationId.current = activeOrganization?.organizationId }, [activeOrganization?.organizationId])
  const isMember = activeOrganization?.myRole === 'MEMBER'
  const canManage = Boolean(activeOrganization && !isMember)
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [photosOrganizationId, setPhotosOrganizationId] = useState<number | null>(null)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selected, setSelected] = useState<GalleryPhoto | null>(null)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [dialogOrganizationId, setDialogOrganizationId] = useState<number | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [formError, setFormError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [listRevision, setListRevision] = useState(0)
  const currentPhotos = photosOrganizationId === activeOrganization?.organizationId ? photos : []
  const loadingPhotos = Boolean(activeOrganization && photosOrganizationId !== activeOrganization.organizationId)
  const visibleDialog = dialogOrganizationId === activeOrganization?.organizationId ? dialog : null

  useEffect(() => {
    if (!activeOrganization) return
    const organizationId = activeOrganization.organizationId
    let cancelled = false
    photoApi.list(organizationId)
      .then((response) => {
        if (cancelled) return
        setPhotos((response.content ?? []).map(fromList))
        setPhotosOrganizationId(organizationId)
        setNextCursor(response.hasNext ? response.nextCursor : null)
        setRequestError('')
      })
      .catch((error) => {
        if (cancelled) return
        setPhotos([])
        setPhotosOrganizationId(organizationId)
        setNextCursor(null)
        setRequestError(errorMessage(error))
      })
    return () => { cancelled = true }
  }, [activeOrganization, listRevision])

  const resetForm = () => { setTitle(''); setFile(null); setFormError('') }
  const loadMore = async () => {
    if (!activeOrganization || !nextCursor || loadingMore) return
    const organizationId = activeOrganization.organizationId
    setLoadingMore(true)
    try {
      const response = await photoApi.list(organizationId, nextCursor)
      if (organizationId !== currentOrganizationId.current) return
      setPhotos((current) => [...current, ...(response.content ?? []).map((photo, index) => fromList(photo, current.length + index))])
      setNextCursor(response.hasNext ? response.nextCursor : null)
      setRequestError('')
    } catch (error) { if (organizationId === currentOrganizationId.current) setRequestError(errorMessage(error)) }
    finally { setLoadingMore(false) }
  }
  const close = () => { setDialog(null); setSelected(null); resetForm() }
  const openCreate = () => {
    if (!activeOrganization || !canManage || loadingPhotos) return
    resetForm(); setSelected(null); setFormMode('create')
    setDialogOrganizationId(activeOrganization.organizationId); setDialog('form')
  }
  const openDetail = async (photo: GalleryPhoto) => {
    if (!activeOrganization) return
    const organizationId = activeOrganization.organizationId
    try {
      const detail = await photoApi.detail(organizationId, photo.id)
      if (organizationId !== currentOrganizationId.current) return
      setSelected(fromDetail(detail, photo.tone))
      setDialogOrganizationId(organizationId)
      setDialog('detail')
      setRequestError('')
    } catch (error) { if (organizationId === currentOrganizationId.current) setRequestError(errorMessage(error)) }
  }
  const openEdit = () => {
    if (!selected || !canManage) return
    resetForm(); setTitle(selected.title); setFormMode('edit'); setDialog('form')
  }
  const closeEditor = () => {
    if (saving) return
    resetForm(); setDialog(selected ? 'detail' : null)
  }
  const changeFile = (nextFile: File | null): boolean => {
    if (nextFile) {
      const error = validatePhotoFile(nextFile)
      if (error) { setFile(null); setFormError(error); return false }
    }
    setFile(nextFile); setFormError(''); return true
  }
  const savePhoto = async () => {
    if (!activeOrganization || !canManage || saving || dialogOrganizationId !== activeOrganization.organizationId) return
    const organizationId = activeOrganization.organizationId
    if (formMode === 'create' && !file) { setFormError('사진 파일을 선택해 주세요.'); return }
    if (formMode === 'edit' && !selected) return
    setSaving(true); setFormError('')
    try {
      const cleanTitle = title.trim()
      const saved = formMode === 'create'
        ? await photoApi.create(organizationId, file!, cleanTitle || undefined)
        : file
          ? await photoApi.replaceImage(organizationId, selected!.id, file, cleanTitle || undefined)
          : await photoApi.update(organizationId, selected!.id, cleanTitle)
      if (organizationId !== currentOrganizationId.current) return
      const mapped = fromDetail(saved, selected?.tone)
      setPhotos((current) => formMode === 'create'
        ? [mapped, ...current]
        : current.map((photo) => photo.id === mapped.id ? mapped : photo))
      setPhotosOrganizationId(organizationId)
      setSelected(mapped)
      setDialog(formMode === 'create' ? null : 'detail')
      resetForm()
    } catch (error) { if (organizationId === currentOrganizationId.current) setFormError(errorMessage(error)) }
    finally { setSaving(false) }
  }
  const deletePhoto = async () => {
    if (!selected || !activeOrganization || !canManage || deleting || dialogOrganizationId !== activeOrganization.organizationId) return
    const organizationId = activeOrganization.organizationId
    setDeleting(true); setDeleteError('')
    try {
      await photoApi.remove(organizationId, selected.id)
      if (organizationId !== currentOrganizationId.current) return
      setPhotos((current) => current.filter((photo) => photo.id !== selected.id))
      close()
    } catch (error) { if (organizationId === currentOrganizationId.current) setDeleteError(errorMessage(error)) }
    finally { setDeleting(false) }
  }

  return <DashboardShell role={isMember ? 'member' : 'admin'}>
    <section className="gallery-page">
      <header className="gallery-header">
        <div>
          <span className="gallery-kicker">CLUB GALLERY</span>
          <h1>사진첩</h1>
          <p>동아리 활동의 순간을 함께 기록해요.</p>
        </div>
        {canManage && <Button onClick={openCreate} disabled={loadingPhotos}>사진 추가</Button>}
      </header>
      {requestError && <div className="gallery-request-error" role="alert">
        <span>{requestError}</span>
        {activeOrganization && <Button variant="secondary" onClick={() => {
          setDialog(null)
          setSelected(null)
          setPhotosOrganizationId(null)
          setRequestError('')
          setListRevision((current) => current + 1)
        }}>목록 다시 불러오기</Button>}
      </div>}
      <section className="gallery-card" aria-label="사진 목록">
        <div className="gallery-grid">
          {currentPhotos.length > 0 ? currentPhotos.map((photo) => (
            <button
              type="button"
              className={`gallery-thumbnail tone-${photo.tone}`}
              aria-label={`${photo.title || '제목 없음'} 사진 상세 보기`}
              onClick={() => openDetail(photo)}
              key={photo.id}
            >
              <GalleryArtwork tone={photo.tone} imageUrl={photo.imageUrl} alt="" />
              <strong>{photo.title || '제목 없음'}</strong>
            </button>
          )) : <div className="gallery-empty">
            <strong>{loadingPhotos ? '사진을 불러오는 중이에요.' : '아직 등록된 사진이 없어요.'}</strong>
            {!loadingPhotos && <span>동아리 활동의 첫 번째 순간을 기록해 보세요.</span>}
          </div>}
        </div>
        {currentPhotos.length > 0 && nextCursor && <button type="button" className="gallery-load-more" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? '불러오는 중…' : '사진 더 보기'}
        </button>}
        <p>썸네일을 누르면 사진을 크게 볼 수 있어요.</p>
      </section>
    </section>
    <GalleryDetailModal
      open={visibleDialog === 'detail'} photo={selected} canManage={canManage}
      onClose={close} onEdit={openEdit} onDelete={() => setDialog('delete')}
    />
    <GalleryPhotoFormModal
      open={visibleDialog === 'form'} mode={formMode} title={title} file={file}
      saving={saving} error={formError} onTitleChange={setTitle}
      onFileChange={changeFile} onClose={closeEditor} onSubmit={savePhoto}
    />
    <GalleryDeleteModal
      open={visibleDialog === 'delete'} photo={selected} deleting={deleting} error={deleteError}
      onClose={() => { if (!deleting) { setDeleteError(''); setDialog('detail') } }} onConfirm={deletePhoto}
    />
  </DashboardShell>
}
