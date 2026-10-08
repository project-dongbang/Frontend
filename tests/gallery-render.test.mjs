import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server
let App
let GalleryDetailModal
let GalleryPhotoFormModal
let GalleryDeleteModal
let galleryMock

before(async () => {
  server = await createServer({
    server: { middlewareMode: true, watch: null },
    appType: 'custom',
  })
  App = (await server.ssrLoadModule('/src/App.tsx')).default
  GalleryDetailModal = (
    await server.ssrLoadModule(
      '/src/pages/gallery/GalleryDetailModal.tsx',
    )
  ).GalleryDetailModal
  GalleryPhotoFormModal = (
    await server.ssrLoadModule(
      '/src/pages/gallery/GalleryPhotoFormModal.tsx',
    )
  ).GalleryPhotoFormModal
  GalleryDeleteModal = (
    await server.ssrLoadModule(
      '/src/pages/gallery/GalleryDeleteModal.tsx',
    )
  ).GalleryDeleteModal
  galleryMock = (
    await server.ssrLoadModule(
      '/src/pages/gallery/galleryMock.ts',
    )
  ).galleryMock
})

after(async () => {
  await server?.close()
})

function renderPath(path) {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(App),
    ),
  )
}

test('GAL001 renders API-backed photos and explains unavailable upload actions', () => {
  const html = renderPath('/gallery')

  assert.match(html, /CLUB GALLERY/)
  assert.match(html, /사진 파일 등록·교체 API의 multipart 형식이 Swagger에 명확히 정의되지 않아 현재 사용할 수 없습니다/)
  assert.doesNotMatch(html, /사진 추가/)
  assert.equal(
    (html.match(/사진 상세 보기/g) ?? []).length,
    3,
  )
  assert.match(html, /2026년 2학기 개강 총회/)
  assert.match(html, /신입 부원 환영 네트워킹/)
  assert.match(html, /정기 백엔드 세미나/)
})

test('GAL002 keeps the photo list but hides admin controls', () => {
  const html = renderPath('/gallery?role=member')

  assert.equal(
    (html.match(/사진 상세 보기/g) ?? []).length,
    3,
  )
  assert.doesNotMatch(html, /사진 추가/)
  assert.match(html, /읽지 않은 알림 1개/)
})

const detailCallbacks = {
  onClose() {},
  onEdit() {},
  onDelete() {},
}

test('GAL003 renders admin photo detail actions', () => {
  const html = renderToStaticMarkup(
    createElement(GalleryDetailModal, {
      ...detailCallbacks,
      open: true,
      photo: galleryMock[0],
      canManage: true,
    }),
  )

  assert.match(html, /role="dialog"/)
  assert.match(html, /gallery-detail-modal is-admin/)
  assert.match(html, /aria-label="2026년 2학기 개강 총회"/)
  assert.match(html, /등록일 2026.09.01/)
  assert.match(html, />수정<\/button>/)
  assert.match(html, />삭제<\/button>/)
})

test('GAL007 renders read-only member photo detail', () => {
  const html = renderToStaticMarkup(
    createElement(GalleryDetailModal, {
      ...detailCallbacks,
      open: true,
      photo: galleryMock[0],
      canManage: false,
    }),
  )

  assert.match(html, /gallery-detail-modal is-member/)
  assert.match(html, /2026년 2학기 개강 총회/)
  assert.doesNotMatch(html, /gallery-detail-footer/)
  assert.doesNotMatch(html, />수정<\/button>|>삭제<\/button>/)
})

const formCallbacks = {
  onTitleChange() {},
  onClose() {},
  onSubmit() {},
}

test('GAL004 renders title editing without unsupported image replacement', () => {
  const html = renderToStaticMarkup(
    createElement(GalleryPhotoFormModal, {
      ...formCallbacks,
      open: true,
      title: galleryMock[0].title,
    }),
  )

  assert.match(html, /사진 제목 수정/)
  assert.match(html, /value="2026년 2학기 개강 총회"/)
  assert.doesNotMatch(html, /사진 교체|type="file"/)
  assert.match(html, />저장<\/button>/)
})

test('GAL006 renders photo context and destructive confirmation', () => {
  const html = renderToStaticMarkup(
    createElement(GalleryDeleteModal, {
      open: true,
      photo: galleryMock[0],
      onClose() {},
      onConfirm() {},
    }),
  )

  assert.match(html, /gallery-delete-modal/)
  assert.match(html, /이 사진을 삭제할까요/)
  assert.match(html, /2026년 2학기 개강 총회/)
  assert.match(html, /등록일 2026.09.01 · 운영진 등록/)
  assert.match(html, /삭제한 사진은 복구할 수 없습니다/)
  assert.match(html, />취소<\/button>/)
  assert.match(html, />사진 삭제<\/button>/)
})
