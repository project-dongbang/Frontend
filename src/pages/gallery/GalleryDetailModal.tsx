import { Button, Modal } from '../../components/common'
import { GalleryArtwork } from './GalleryArtwork'
import type { GalleryPhoto } from './galleryMock'

type GalleryDetailModalProps = {
  open: boolean
  photo: GalleryPhoto | null
  canManage: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export function GalleryDetailModal({
  open,
  photo,
  canManage,
  onClose,
  onEdit,
  onDelete,
}: GalleryDetailModalProps) {
  if (!photo) {
    return null
  }

  const footer = canManage ? (
    <footer className="gallery-detail-footer">
      <Button variant="secondary" onClick={onEdit}>
        수정
      </Button>
      <Button onClick={onDelete}>삭제</Button>
    </footer>
  ) : undefined

  return (
    <Modal
      open={open}
      title="사진 상세"
      className={`gallery-detail-modal ${
        canManage ? 'is-admin' : 'is-member'
      }`}
      footer={footer}
      onClose={onClose}
    >
      <figure className="gallery-detail">
        <div
          className={`gallery-detail-art tone-${photo.tone}`}
          role="img"
          aria-label={photo.title}
        >
          <GalleryArtwork tone={photo.tone} />
        </div>

        <figcaption>
          <strong>{photo.title}</strong>
          <span>등록일 {photo.createdAt}</span>
        </figcaption>
      </figure>
    </Modal>
  )
}
