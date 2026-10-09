import type { GalleryPhoto } from './galleryTypes'

export function GalleryArtwork({
  imageUrl,
  alt = '',
}: Pick<GalleryPhoto, 'tone' | 'imageUrl'> & {
  alt?: string
}) {
  if (imageUrl) {
    return (
      <img
        className="gallery-image"
        src={imageUrl}
        alt={alt}
      />
    )
  }

  return <span className="gallery-image-placeholder">이미지 없음</span>
}
