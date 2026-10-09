import { type FormEvent } from 'react'
import { Modal } from '../../components/common'

type GalleryPhotoFormModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  title: string
  file: File | null
  saving: boolean
  error: string
  onTitleChange: (title: string) => void
  onFileChange: (file: File | null) => boolean
  onClose: () => void
  onSubmit: () => void
}

export function GalleryPhotoFormModal({
  open, mode, title, file, saving, error,
  onTitleChange, onFileChange, onClose, onSubmit,
}: GalleryPhotoFormModalProps) {
  const isCreate = mode === 'create'
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (saving || (isCreate && !file) || (!isCreate && !file && !title.trim())) return
    onSubmit()
  }

  return (
    <Modal
      open={open}
      title={isCreate ? '사진 등록' : '사진 수정'}
      className={`gallery-manage-modal ${isCreate ? 'is-add' : 'is-edit'}`}
      onClose={onClose}
    >
      <form className="gallery-manage-form" onSubmit={handleSubmit}>
        <label className="gallery-manage-field">
          <span>사진 제목 {isCreate ? '(선택)' : ''}</span>
          <input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="예: 9월 개강 총회"
            maxLength={200}
          />
        </label>
        <label className="gallery-manage-field gallery-file-field">
          <span>{isCreate ? '사진 파일' : '이미지 교체 (선택)'}</span>
          <input
            className="gallery-file-control"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              if (!onFileChange(event.target.files?.[0] ?? null)) event.target.value = ''
            }}
            required={isCreate}
          />
          <small>{file ? `선택한 파일: ${file.name}` : 'JPG·PNG·WebP, 최대 10MB'}</small>
        </label>
        {error && <p className="gallery-form-error" role="alert">{error}</p>}
        <button type="submit" className="gallery-manage-submit" disabled={saving || (isCreate && !file)}>
          {saving ? '저장 중…' : isCreate ? '사진 등록' : '변경사항 저장'}
        </button>
      </form>
    </Modal>
  )
}
