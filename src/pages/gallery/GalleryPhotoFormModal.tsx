import {
  type ChangeEvent,
  type FormEvent,
} from 'react'

import { Modal } from '../../components/common'

type GalleryPhotoFormModalProps = {
  mode: 'add' | 'edit'
  open: boolean
  title: string
  fileName?: string
  onTitleChange: (title: string) => void
  onFileChange?: (file: File | null) => void
  onClose: () => void
  onSubmit: () => void
}

export function GalleryPhotoFormModal({
  mode,
  open,
  title,
  fileName,
  onTitleChange,
  onFileChange,
  onClose,
  onSubmit,
}: GalleryPhotoFormModalProps) {
  const isEditing = mode === 'edit'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) {
      return
    }
    onSubmit()
  }

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    onFileChange?.(event.target.files?.[0] ?? null)
  }

  return (
    <Modal
      open={open}
      title={isEditing ? '사진 수정' : '사진 설명'}
      className={`gallery-manage-modal ${
        isEditing ? 'is-edit' : 'is-add'
      }`}
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

        {isEditing && (
          <label className="gallery-manage-field gallery-file-field">
            <span>사진 교체</span>
            <input
              className="gallery-file-control"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
            />
            <small>
              {fileName ||
                '새 사진을 선택하지 않으면 제목만 변경됩니다.'}
            </small>
          </label>
        )}

        <button
          type="submit"
          className="gallery-manage-submit"
        >
          {isEditing ? '저장' : '사진 추가'}
        </button>
      </form>
    </Modal>
  )
}
