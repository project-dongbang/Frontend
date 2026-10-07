import { Button, Modal } from '../../components/common'
import type { GalleryPhoto } from './galleryMock'

type GalleryDeleteModalProps = {
  open: boolean
  photo: GalleryPhoto | null
  onClose: () => void
  onConfirm: () => void
}

export function GalleryDeleteModal({
  open,
  photo,
  onClose,
  onConfirm,
}: GalleryDeleteModalProps) {
  if (!photo) {
    return null
  }

  return (
    <Modal
      open={open}
      title="이 사진을 삭제할까요?"
      tone="danger"
      className="gallery-delete-modal"
      hideHeader
      onClose={onClose}
      footer={
        <footer className="gallery-delete-actions">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            사진 삭제
          </Button>
        </footer>
      }
    >
      <div className="gallery-delete-content">
        <span className="modal-kicker">DONG BANG</span>
        <strong>이 사진을 삭제할까요?</strong>
        <p>
          사진첩과 연결된 활동 화면에서 이 사진이 더 이상
          표시되지 않습니다.
        </p>
        <div className="gallery-delete-summary">
          <strong>{photo.title}</strong>
          <span>
            등록일 {photo.createdAt} · 운영진 등록
          </span>
        </div>
        <small>삭제한 사진은 복구할 수 없습니다.</small>
      </div>
    </Modal>
  )
}
