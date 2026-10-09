import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

export async function loadSsrModules(suite, entries) {
  const outDir = `node_modules/.cache/dongbang-${suite}-test`
  await build({
    build: {
      ssr: true,
      rollupOptions: { input: entries },
      outDir,
      emptyOutDir: false,
    },
  })

  const modules = await Promise.all(
    Object.keys(entries).map((name) =>
      import(pathToFileURL(resolve(outDir, `${name}.js`)).href),
    ),
  )
  return Object.fromEntries(Object.keys(entries).map((name, index) => [name, modules[index]]))
}
