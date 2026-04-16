#!/usr/bin/env node

import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')
const packageRoot = resolve(__dirname, '..')
const distDir = join(packageRoot, 'dist')

if (!existsSync(distDir) || !statSync(distDir).isDirectory()) {
  console.error('未找到 dist 目录，请先执行构建。')
  process.exit(1)
}

const portArg = process.argv.find((arg) => arg.startsWith('--port='))
const port = portArg ? Number(portArg.split('=')[1]) : 4173

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
} 

function getFilePath(urlPath) {
  const cleaned = urlPath === '/' ? '/index.html' : urlPath
  const absolute = join(distDir, cleaned)
  if (existsSync(absolute) && statSync(absolute).isFile()) {
    return absolute
  }
  return join(distDir, 'index.html')
}

const server = createServer((req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`)
    const filePath = getFilePath(url.pathname)
    const ext = extname(filePath)
    const content = readFileSync(filePath)

    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    })
    res.end(content)
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(`启动失败: ${error instanceof Error ? error.message : String(error)}`)
  }
})

server.listen(port, () => {
  console.log(`ALG 算法可视化网站已启动: http://localhost:${port}`)
})
