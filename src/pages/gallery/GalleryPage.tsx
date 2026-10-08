import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DashboardShell } from '../dashboard/DashboardShell'
import { GalleryArtwork } from './GalleryArtwork'
import { GalleryDeleteModal } from './GalleryDeleteModal'
import { GalleryDetailModal } from './GalleryDetailModal'
import { GalleryPhotoFormModal } from './GalleryPhotoFormModal'
import { galleryMock, type GalleryPhoto, type GalleryTone } from './galleryMock'
import './gallery.css'
import { photoApi } from '../../api/services'
import { errorMessage } from '../../api/client'
import { useSession } from '../../context/SessionContext'

type Dialog = 'detail' | 'edit' | 'delete' | null

export function GalleryPage() {
  const [params] = useSearchParams()
  const { activeOrganization, user } = useSession()
  const isMember = activeOrganization?.myRole === 'MEMBER' || params.get('role') === 'member'
  const [photos, setPhotos] = useState(galleryMock)
  const [photosOrganizationId, setPhotosOrganizationId] = useState<number | null>(null)
  const [selected, setSelected] = useState<GalleryPhoto | null>(null)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [title, setTitle] = useState('')
  const [requestError, setRequestError] = useState('')
  const currentPhotos = activeOrganization
    ? photosOrganizationId === activeOrganization.organizationId ? photos : []
    : photos

  useEffect(() => {
    if (!activeOrganization || !user) return
    const organizationId = activeOrganization.organizationId
    let cancelled = false
    photoApi.list(organizationId, user.userId)
      .then((response) => {
        if (cancelled) return
        const mapped = (response.content ?? []).map((photo, index) => {
          const file = photo.file as { url?: string } | undefined
          return {
            id: String(photo.photoId),
            title: String(photo.title ?? ''),
            createdAt: String(photo.createdAt ?? '').slice(0, 10).replaceAll('-', '.'),
            tone: (['sky', 'sand', 'blue'][index % 3] ?? 'sky') as GalleryTone,
            imageUrl: String(photo.imageUrl ?? file?.url ?? ''),
          }
        })
        setPhotos(mapped)
        setPhotosOrganizationId(organizationId)
        setRequestError('')
      })
      .catch((error) => {
        if (cancelled) return
        setPhotos([])
        setPhotosOrganizationId(organizationId)
        setRequestError(errorMessage(error))
      })
    return () => { cancelled = true }
  }, [activeOrganization, user])

  const resetForm = () => {
    setTitle('')
  }
  const close = () => {
    setDialog(null)
    setSelected(null)
    resetForm()
  }
  const openDetail = async (photo: GalleryPhoto) => {
    if (!activeOrganization || !user) { setSelected(photo); setDialog('detail'); return }
    try {
      const raw = await photoApi.detail(activeOrganization.organizationId, photo.id, user.userId)
      const file = raw.file as { url?: string } | undefined
      const detailed = { ...photo, title: String(raw.title ?? photo.title), imageUrl: String(file?.url ?? photo.imageUrl), createdAt: String(raw.createdAt ?? photo.createdAt).slice(0, 10).replaceAll('-', '.') }
      setSelected(detailed); setDialog('detail'); setRequestError('')
    } catch (error) { setRequestError(errorMessage(error)) }
  }
  const openEdit = () => {
    if (!selected) return
    setTitle(selected.title)
    setDialog('edit')
  }
  const closeEditor = () => {
    resetForm()
    setDialog(selected ? 'detail' : null)
  }

  const saveEdit = async () => {
    if (!selected || !title.trim()) return
    const updatedPhoto = {
      ...selected,
      title: title.trim(),
      imageUrl: selected.imageUrl,
    }
    if (!activeOrganization || !user) return
    try {
      await photoApi.update(activeOrganization.organizationId, selected.id, user.userId, title.trim())
      setPhotos((current) => current.map((photo) => photo.id === selected.id ? updatedPhoto : photo))
      setSelected(updatedPhoto); resetForm(); setDialog('detail')
    } catch (error) { setRequestError(errorMessage(error)) }
  }
  const deletePhoto = async () => {
    if (!selected) return
    if (!activeOrganization || !user) return
    try { await photoApi.remove(activeOrganization.organizationId, selected.id, user.userId); setPhotos((current) => current.filter((photo) => photo.id !== selected.id)); close() }
    catch (error) { setRequestError(errorMessage(error)) }
  }

  return <DashboardShell role={isMember ? 'member' : 'admin'}>
    <section className="gallery-page">
      <header className="gallery-header">
        <div>
          <span className="gallery-kicker">
            CLUB GALLERY
          </span>
          <h1>사진첩</h1>
          <p>동아리 활동의 순간을 함께 기록해요.</p>
        </div>

      </header>
      {!isMember && <p className="gallery-integration-note">사진 파일 등록·교체 API의 multipart 형식이 Swagger에 명확히 정의되지 않아 현재 사용할 수 없습니다. 기존 사진 제목 수정과 삭제는 가능합니다.</p>}
      {requestError && <p role="alert">{requestError}</p>}

      <section className="gallery-card" aria-label="사진 목록">
        <div className="gallery-grid">
          {currentPhotos.length > 0 ? (
            currentPhotos.map((photo) => (
              <button
                type="button"
                className={`gallery-thumbnail tone-${photo.tone}`}
                aria-label={`${photo.title} 사진 상세 보기`}
                onClick={() => openDetail(photo)}
                key={photo.id}
              >
                <GalleryArtwork
                  tone={photo.tone}
                  imageUrl={photo.imageUrl}
                  alt=""
                />
                <strong>{photo.title}</strong>
              </button>
            ))
          ) : (
            <div className="gallery-empty">
              <strong>아직 등록된 사진이 없어요.</strong>
              <span>
                동아리 활동의 첫 번째 순간을 기록해 보세요.
              </span>
            </div>
          )}
        </div>
        <p>썸네일을 누르면 사진을 크게 볼 수 있어요.</p>
      </section>
    </section>

    <GalleryDetailModal
      open={dialog === 'detail'}
      photo={selected}
      canManage={!isMember}
      onClose={close}
      onEdit={openEdit}
      onDelete={() => setDialog('delete')}
    />
    <GalleryPhotoFormModal
      open={dialog === 'edit'}
      title={title}
      onTitleChange={setTitle}
      onClose={closeEditor}
      onSubmit={saveEdit}
    />
    <GalleryDeleteModal
      open={dialog === 'delete'}
      photo={selected}
      onClose={() => setDialog('detail')}
      onConfirm={deletePhoto}
    />
  </DashboardShell>
}
