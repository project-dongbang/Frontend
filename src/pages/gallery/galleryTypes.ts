export type GalleryTone = 'sky' | 'sand' | 'blue'

export type GalleryPhoto = {
  id: string
  title: string
  createdAt: string
  tone: GalleryTone
  imageUrl?: string
}
