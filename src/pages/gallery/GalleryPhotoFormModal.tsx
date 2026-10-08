import { type FormEvent } from 'react'

import { Modal } from '../../components/common'

type GalleryPhotoFormModalProps = {
  open: boolean
  title: string
  onTitleChange: (title: string) => void
  onClose: () => void
  onSubmit: () => void
}

export function GalleryPhotoFormModal({
  open,
  title,
  onTitleChange,
  onClose,
  onSubmit,
}: GalleryPhotoFormModalProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) {
      return
    }
    onSubmit()
  }

  return (
    <Modal
      open={open}
      title="사진 제목 수정"
      className="gallery-manage-modal is-edit"
      onClose={onClose}
    >
      <form
        className="gallery-manage-form"
        onSubmit={handleSubmit}
      >
        <label className="gallery-manage-field">
          <span>사진 제목</span>
          <input
            value={title}
            onChange={(event) =>
              onTitleChange(event.target.value)
            }
            placeholder="예: 9월 개강 총회"
            maxLength={80}
            required
          />
        </label>

        <button
          type="submit"
          className="gallery-manage-submit"
        >
          저장
        </button>
      </form>
    </Modal>
  )
}
