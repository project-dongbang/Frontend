import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../../components/common'
import { DashboardShell } from '../dashboard/DashboardShell'
import { GalleryArtwork } from './GalleryArtwork'
import { GalleryDeleteModal } from './GalleryDeleteModal'
import { GalleryDetailModal } from './GalleryDetailModal'
import { GalleryPhotoFormModal } from './GalleryPhotoFormModal'
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
  const [pendingImageUrl, setPendingImageUrl] =
    useState('')
  const addFileInput = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setTitle('')
    setFileName('')
    setPendingImageUrl('')
  }
  const close = () => {
    setDialog(null)
    setSelected(null)
    resetForm()
  }
  const openDetail = (photo: GalleryPhoto) => { setSelected(photo); setDialog('detail') }
  const openEdit = () => {
    if (!selected) return
    setTitle(selected.title)
    setFileName('')
    setPendingImageUrl('')
    setDialog('edit')
  }
  const closeEditor = () => {
    resetForm()
    setDialog(selected ? 'detail' : null)
  }

  const readImage = (
    file: File,
    onLoad: (imageUrl: string) => void,
  ) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        onLoad(reader.result)
      }
    })
    reader.readAsDataURL(file)
  }

  const selectAddPhoto = (file: File | null) => {
    if (!file) return
    setFileName(file.name)
    readImage(file, (imageUrl) => {
      setPendingImageUrl(imageUrl)
      setTitle('')
      setDialog('add')
    })
  }

  const selectReplacementPhoto = (file: File | null) => {
    if (!file) {
      setFileName('')
      setPendingImageUrl('')
      return
    }
    setFileName(file.name)
    readImage(file, setPendingImageUrl)
  }

  const addPhoto = () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    setPhotos((current) => [...current, {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      createdAt: '2026.09.14',
      tone: nextTone,
      imageUrl: pendingImageUrl || undefined,
    }])
    close()
  }
  const saveEdit = () => {
    if (!selected || !title.trim()) return
    const updatedPhoto = {
      ...selected,
      title: title.trim(),
      imageUrl: pendingImageUrl || selected.imageUrl,
    }
    setPhotos((current) => current.map((photo) =>
      photo.id === selected.id ? updatedPhoto : photo,
    ))
    setSelected(updatedPhoto)
    resetForm()
    setDialog('detail')
  }
  const deletePhoto = () => {
    if (!selected) return
    setPhotos((current) => current.filter((photo) => photo.id !== selected.id))
    close()
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

        {!isMember && (
          <Button className="page-header-action" onClick={() => addFileInput.current?.click()}>
            사진 추가
          </Button>
        )}
      </header>

      <section className="gallery-card" aria-label="사진 목록">
        <div className="gallery-grid">
          {photos.length > 0 ? (
            photos.map((photo) => (
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
      mode="add"
      open={dialog === 'add'}
      title={title}
      onTitleChange={setTitle}
      onClose={close}
      onSubmit={addPhoto}
    />
    <GalleryPhotoFormModal
      mode="edit"
      open={dialog === 'edit'}
      title={title}
      fileName={fileName}
      onTitleChange={setTitle}
      onFileChange={selectReplacementPhoto}
      onClose={closeEditor}
      onSubmit={saveEdit}
    />
    <GalleryDeleteModal
      open={dialog === 'delete'}
      photo={selected}
      onClose={() => setDialog('detail')}
      onConfirm={deletePhoto}
    />
    <input
      ref={addFileInput}
      className="gallery-file-input"
      type="file"
      accept="image/png,image/jpeg,image/webp"
      aria-label="추가할 사진 선택"
      onChange={(event) =>
        selectAddPhoto(event.target.files?.[0] ?? null)
      }
    />
  </DashboardShell>
}
