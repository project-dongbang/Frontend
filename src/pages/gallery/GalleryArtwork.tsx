import type { GalleryPhoto } from './galleryMock'

export function GalleryArtwork({
  tone,
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

  return (
    <span
      className={`gallery-art tone-${tone}`}
      aria-hidden="true"
    >
      <i />
      <b />
      <em />
    </span>
  )
}
