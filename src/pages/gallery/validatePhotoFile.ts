export const MAX_PHOTO_SIZE = 10 * 1024 * 1024
const SUPPORTED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function validatePhotoFile(file: File): string {
  if (!SUPPORTED_PHOTO_TYPES.has(file.type)) return 'JPG, PNG 또는 WebP 이미지만 등록할 수 있습니다.'
  if (file.size > MAX_PHOTO_SIZE) return '사진 크기는 10MB 이하여야 합니다.'
  return ''
}
