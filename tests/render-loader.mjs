import { mkdtemp, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

export function createRenderLoader() {
  const directories = []

  return {
    async ssrLoadModule(modulePath) {
      const outputDirectory = await mkdtemp(resolve('node_modules/.cache/render-test-'))
      directories.push(outputDirectory)
      await build({
        configFile: false,
        logLevel: 'silent',
        build: {
          ssr: resolve(modulePath.replace(/^\//, '')),
          outDir: outputDirectory,
          emptyOutDir: false,
          rollupOptions: { output: { entryFileNames: 'entry.mjs' } },
        },
      })
      return import(pathToFileURL(join(outputDirectory, 'entry.mjs')).href)
    },
    async close() {
      await Promise.all(directories.map((directory) => rm(directory, { recursive: true, force: true })))
    },
  }
}
