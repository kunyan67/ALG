#!/usr/bin/env node

import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { platform } from 'node:os'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, '..')
const packageRoot = resolve(__dirname, '..')
const distDir = join(packageRoot, 'dist')

const portArg = process.argv.find((arg) => arg.startsWith('--port='))
const port = portArg ? Number(portArg.split('=')[1]) : 4173
const embed = process.argv.includes('--embed')
const helpMode = process.argv.includes('--help') || process.argv.includes('-h')
const algorithmArg = process.argv.find((arg) => arg.startsWith('--algorithm='))
const algorithmId = algorithmArg ? algorithmArg.split('=')[1] : ''

function ensureBuilt() {
  if (!existsSync(distDir) || !statSync(distDir).isDirectory()) {
    console.error('未找到 dist 目录，请先执行构建。')
    process.exit(1)
  }
}

function printHelp() {
  console.log(`ALG Visualizer

用法:
  ALG
  ALG --port=8080
  ALG --algorithm=sort-bubble
  ALG --algorithm=sort-bubble --embed
  ALG --help

参数:
  --port=<number>       指定本地服务端口，默认 4173
  --algorithm=<id>      直接打开指定算法
  --embed               打开纯动画页（不带侧边栏和说明区）
  --help, -h            显示帮助
`)
}

function getFilePath(urlPath) {
  const cleaned = urlPath === '/' ? '/index.html' : urlPath
  const absolute = join(distDir, cleaned)
  if (existsSync(absolute) && statSync(absolute).isFile()) {
    return absolute
  }
  return join(distDir, 'index.html')
}

function buildLaunchUrl() {
  if (!algorithmId) {
    return `http://localhost:${port}`
  }

  const path = embed
    ? `/embed/${encodeURIComponent(algorithmId)}`
    : `/algorithm/${encodeURIComponent(algorithmId)}`

  return `http://localhost:${port}/#${path}`
}

function openBrowser(url) {
  const currentPlatform = platform()

  if (currentPlatform === 'darwin') {
    return spawn('open', [url], { stdio: 'ignore', detached: true })
  }

  if (currentPlatform === 'win32') {
    return spawn('cmd', ['/c', 'start', '', url], { stdio: 'ignore', detached: true })
  }

  return spawn('xdg-open', [url], { stdio: 'ignore', detached: true })
}

if (helpMode) {
  printHelp()
  process.exit(0)
}

ensureBuilt()

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

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`端口 ${port} 已被占用，请改用 --port=其他端口 后重试。`)
    process.exit(1)
  }

  console.error(`服务启动失败: ${error.message}`)
  process.exit(1)
})

server.listen(port, () => {
  const url = buildLaunchUrl()
  console.log(`ALG 算法可视化网站已启动: http://localhost:${port}`)
  console.log(`访问地址: ${url}`)

  try {
    const child = openBrowser(url)
    child.unref()
  } catch (error) {
    console.warn(`自动打开浏览器失败，请手动访问: ${url}`)
    if (error instanceof Error) {
      console.warn(`原因: ${error.message}`)
    }
  }
})
