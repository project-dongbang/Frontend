import type { GalleryTone } from './galleryMock'

export function GalleryArtwork({ tone }: { tone: GalleryTone }) {
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
