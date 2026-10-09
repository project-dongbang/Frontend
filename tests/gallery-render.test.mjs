import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createRenderLoader } from './render-loader.mjs'

let server
let App
let GalleryDetailModal
let GalleryPhotoFormModal
let GalleryDeleteModal
const galleryMock = [
  { id: 'orientation', title: '2026년 2학기 개강 총회', createdAt: '2026.09.01', tone: 'sky' },
]
let validatePhotoFile

before(async () => {
  server = createRenderLoader()
  App = (await server.ssrLoadModule('/src/App.tsx')).default
  GalleryDetailModal = (
    await server.ssrLoadModule(
      '/src/pages/gallery/GalleryDetailModal.tsx',
    )
  ).GalleryDetailModal
  const formModule = (
    await server.ssrLoadModule(
      '/src/pages/gallery/GalleryPhotoFormModal.tsx',
    )
  )
  GalleryPhotoFormModal = formModule.GalleryPhotoFormModal
  validatePhotoFile = (await server.ssrLoadModule('/src/pages/gallery/validatePhotoFile.ts')).validatePhotoFile
  GalleryDeleteModal = (
    await server.ssrLoadModule(
      '/src/pages/gallery/GalleryDeleteModal.tsx',
    )
  ).GalleryDeleteModal
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

test('GAL001 renders the empty API-backed photo list without mock entries', () => {
  const html = renderPath('/gallery')

  assert.match(html, /CLUB GALLERY/)
  assert.doesNotMatch(html, /사진 파일 등록·교체 API의 multipart 형식/)
  assert.doesNotMatch(html, /사진 추가/)
  assert.match(html, /아직 등록된 사진이 없어요/)
  assert.doesNotMatch(html, /2026년 2학기 개강 총회/)
})

test('GAL002 hides management controls without an active organization', () => {
  const html = renderPath('/gallery?role=member')

  assert.match(html, /아직 등록된 사진이 없어요/)
  assert.doesNotMatch(html, /사진 추가/)
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
  onFileChange() { return true },
  onClose() {},
  onSubmit() {},
}

test('GAL004 renders the image replacement field for editors', () => {
  const html = renderToStaticMarkup(
    createElement(GalleryPhotoFormModal, {
      ...formCallbacks,
      open: true,
      mode: 'edit',
      title: galleryMock[0].title,
      file: null,
      saving: false,
      error: '',
    }),
  )

  assert.match(html, /사진 수정/)
  assert.match(html, /value="2026년 2학기 개강 총회"/)
  assert.match(html, /이미지 교체 \(선택\)/)
  assert.match(html, /type="file"/)
  assert.match(html, />변경사항 저장<\/button>/)
})

test('GAL005 requires a photo file for new photos and validates type and size', () => {
  const html = renderToStaticMarkup(createElement(GalleryPhotoFormModal, {
    ...formCallbacks, open: true, mode: 'create', title: '', file: null,
    saving: false, error: '',
  }))
  assert.match(html, /사진 등록/)
  assert.match(html, /type="file"/)
  assert.match(html, /required=""/)
  assert.match(html, /disabled=""/)
  assert.equal(validatePhotoFile(new File(['data'], 'photo.gif', { type: 'image/gif' })), 'JPG, PNG 또는 WebP 이미지만 등록할 수 있습니다.')
  assert.equal(validatePhotoFile(new File(['data'], 'photo.png', { type: 'image/png' })), '')
  assert.match(validatePhotoFile(new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' })), /10MB/)
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
