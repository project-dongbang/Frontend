export type GalleryTone = 'sky' | 'sand' | 'blue'

export type GalleryPhoto = {
  id: string
  title: string
  createdAt: string
  tone: GalleryTone
}

export const galleryMock: GalleryPhoto[] = [
  { id: 'orientation', title: '2026년 2학기 개강 총회', createdAt: '2026.09.01', tone: 'sky' },
  { id: 'networking', title: '신입 부원 환영 네트워킹', createdAt: '2026.09.05', tone: 'sand' },
  { id: 'backend', title: '정기 백엔드 세미나', createdAt: '2026.09.12', tone: 'blue' },
]
