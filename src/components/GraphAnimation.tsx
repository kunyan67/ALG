import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { GraphAnimationConfig, GraphNode, GraphEdge } from '../data/algorithms'

interface GraphStep {
  dist: Record<string, number>
  prev: Record<string, string | null>
  visited: Set<string>
  currentNode?: string
  relaxEdge?: { from: string; to: string }
  relaxResult?: 'updated' | 'no-change'
  highlightEdges: Set<string>
  desc: string
  phase?: string
  floydMatrix?: number[][]
  floydK?: number
  floydI?: number
  floydJ?: number
  queue?: string[]
  stack?: string[]
  order?: string[]
  levels?: Record<string, number>
  indegree?: Record<string, number>
  dfn?: Record<string, number>
  low?: Record<string, number>
  onStack?: Set<string>
  components?: string[][]
  gridState?: { open: Set<string>; closed: Set<string>; path: string[] }
}

function edgeKey(from: string, to: string) {
  return `${from}->${to}`
}

function buildDijkstraSteps(nodes: GraphNode[], edges: GraphEdge[], source: string): GraphStep[] {
  const steps: GraphStep[] = []
  const nodeIds = nodes.map((n) => n.id)
  const adj: Record<string, { to: string; w: number }[]> = {}
  for (const id of nodeIds) adj[id] = []
  for (const e of edges) adj[e.from].push({ to: e.to, w: e.weight })

  const dist: Record<string, number> = {}
  const prev: Record<string, string | null> = {}
  const visited = new Set<string>()
  const confirmedEdges = new Set<string>()
  for (const id of nodeIds) {
    dist[id] = Infinity
    prev[id] = null
  }
  dist[source] = 0

  steps.push({
    dist: { ...dist },
    prev: { ...prev },
    visited: new Set(visited),
    highlightEdges: new Set(),
    desc: `初始化: dist[${source}]=0，其余=∞`,
  })

  for (let round = 0; round < nodeIds.length; round++) {
    let u: string | null = null
    for (const v of nodeIds) {
      if (!visited.has(v) && (u === null || dist[v] < dist[u])) u = v
    }
    if (u === null || dist[u] === Infinity) break

    visited.add(u)
    if (prev[u]) confirmedEdges.add(edgeKey(prev[u]!, u))

    steps.push({
      dist: { ...dist },
      prev: { ...prev },
      visited: new Set(visited),
      currentNode: u,
      highlightEdges: new Set(confirmedEdges),
      desc: `选中 ${u}（dist=${dist[u]}），标记为已访问`,
      phase: `第 ${round + 1} 轮`,
    })

    for (const { to: v, w } of adj[u]) {
      if (visited.has(v)) continue
      const newDist = dist[u] + w
      const old = dist[v]

      if (newDist < dist[v]) {
        dist[v] = newDist
        prev[v] = u
        steps.push({
          dist: { ...dist },
          prev: { ...prev },
          visited: new Set(visited),
          currentNode: u,
          relaxEdge: { from: u, to: v },
          relaxResult: 'updated',
          highlightEdges: new Set(confirmedEdges),
          desc: `松弛 ${u}→${v}: dist[${u}]+${w}=${newDist} < ${old === Infinity ? '∞' : old} → 更新 dist[${v}]=${newDist}`,
        })
      } else {
        steps.push({
          dist: { ...dist },
          prev: { ...prev },
          visited: new Set(visited),
          currentNode: u,
          relaxEdge: { from: u, to: v },
          relaxResult: 'no-change',
          highlightEdges: new Set(confirmedEdges),
          desc: `松弛 ${u}→${v}: dist[${u}]+${w}=${newDist} >= ${dist[v]} → 不更新`,
        })
      }
    }
  }

  for (const id of nodeIds) if (prev[id]) confirmedEdges.add(edgeKey(prev[id], id))
  steps.push({
    dist: { ...dist },
    prev: { ...prev },
    visited: new Set(visited),
    highlightEdges: new Set(confirmedEdges),
    desc: `完成! 从 ${source} 出发的最短距离: ${nodeIds.map((v) => `${v}=${dist[v]}`).join(', ')}`,
  })

  return steps
}

function buildBellmanFordSteps(nodes: GraphNode[], edges: GraphEdge[], source: string): GraphStep[] {
  const steps: GraphStep[] = []
  const nodeIds = nodes.map((n) => n.id)
  const dist: Record<string, number> = {}
  const prev: Record<string, string | null> = {}
  const confirmedEdges = new Set<string>()
  for (const id of nodeIds) {
    dist[id] = Infinity
    prev[id] = null
  }
  dist[source] = 0

  steps.push({
    dist: { ...dist },
    prev: { ...prev },
    visited: new Set(),
    highlightEdges: new Set(),
    desc: `初始化: dist[${source}]=0，其余=∞`,
  })

  for (let round = 1; round <= nodeIds.length - 1; round++) {
    let anyUpdate = false
    steps.push({
      dist: { ...dist },
      prev: { ...prev },
      visited: new Set(),
      highlightEdges: new Set(confirmedEdges),
      desc: `=== 第 ${round} 轮: 遍历所有 ${edges.length} 条边 ===`,
      phase: `第 ${round}/${nodeIds.length - 1} 轮`,
    })

    for (const e of edges) {
      if (dist[e.from] === Infinity) continue
      const newDist = dist[e.from] + e.weight
      if (newDist < dist[e.to]) {
        const old = dist[e.to]
        dist[e.to] = newDist
        prev[e.to] = e.from
        confirmedEdges.add(edgeKey(e.from, e.to))
        anyUpdate = true
        steps.push({
          dist: { ...dist },
          prev: { ...prev },
          visited: new Set(),
          relaxEdge: { from: e.from, to: e.to },
          relaxResult: 'updated',
          highlightEdges: new Set(confirmedEdges),
          desc: `${e.from}→${e.to}(w=${e.weight}): ${dist[e.from]}+${e.weight}=${newDist} < ${old === Infinity ? '∞' : old} → 更新!`,
          phase: `第 ${round} 轮`,
        })
      }
    }
    if (!anyUpdate) {
      steps.push({
        dist: { ...dist },
        prev: { ...prev },
        visited: new Set(),
        highlightEdges: new Set(confirmedEdges),
        desc: `第 ${round} 轮无更新，提前结束`,
      })
      break
    }
  }

  steps.push({
    dist: { ...dist },
    prev: { ...prev },
    visited: new Set(nodeIds),
    highlightEdges: new Set(confirmedEdges),
    desc: `完成! ${nodeIds.map((v) => `${v}=${dist[v]}`).join(', ')}`,
  })
  return steps
}

function buildFloydSteps(nodes: GraphNode[], edges: GraphEdge[]): GraphStep[] {
  const steps: GraphStep[] = []
  const n = nodes.length
  const ids = nodes.map((nd) => nd.id)
  const inf = Infinity
  const dist: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : inf)),
  )
  for (const e of edges) {
    const i = ids.indexOf(e.from)
    const j = ids.indexOf(e.to)
    if (i >= 0 && j >= 0) dist[i][j] = e.weight
  }

  steps.push({
    dist: {},
    prev: {},
    visited: new Set(),
    highlightEdges: new Set(),
    desc: '初始距离矩阵（直接连接的边权，其余∞）',
    floydMatrix: dist.map((r) => [...r]),
  })

  for (let k = 0; k < n; k++) {
    steps.push({
      dist: {},
      prev: {},
      visited: new Set(),
      highlightEdges: new Set(),
      desc: `=== 中间节点 k=${ids[k]}: 尝试用 ${ids[k]} 中转缩短所有 (i,j) ===`,
      floydMatrix: dist.map((r) => [...r]),
      floydK: k,
      phase: `k=${ids[k]}`,
    })

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j || i === k || j === k) continue
        const via = dist[i][k] + dist[k][j]
        if (via < dist[i][j]) {
          const old = dist[i][j]
          dist[i][j] = via
          steps.push({
            dist: {},
            prev: {},
            visited: new Set(),
            highlightEdges: new Set(),
            desc: `dist[${ids[i]}][${ids[j]}]: 经 ${ids[k]} 中转 = ${dist[i][k]}+${dist[k][j]}=${via} < ${old === inf ? '∞' : old} → 更新!`,
            floydMatrix: dist.map((r) => [...r]),
            floydK: k,
            floydI: i,
            floydJ: j,
            phase: `k=${ids[k]}`,
          })
        }
      }
    }
  }

  steps.push({
    dist: {},
    prev: {},
    visited: new Set(),
    highlightEdges: new Set(),
    desc: '全源最短路径矩阵计算完成!',
    floydMatrix: dist.map((r) => [...r]),
  })
  return steps
}

function buildSPFASteps(nodes: GraphNode[], edges: GraphEdge[], source: string): GraphStep[] {
  const steps: GraphStep[] = []
  const nodeIds = nodes.map((n) => n.id)
  const adj: Record<string, { to: string; w: number }[]> = {}
  for (const id of nodeIds) adj[id] = []
  for (const e of edges) adj[e.from].push({ to: e.to, w: e.weight })

  const dist: Record<string, number> = {}
  const prev: Record<string, string | null> = {}
  const inQueue = new Set<string>()
  const confirmedEdges = new Set<string>()
  for (const id of nodeIds) {
    dist[id] = Infinity
    prev[id] = null
  }
  dist[source] = 0
  const queue: string[] = [source]
  inQueue.add(source)

  steps.push({
    dist: { ...dist },
    prev: { ...prev },
    visited: new Set(),
    highlightEdges: new Set(),
    desc: `初始化: dist[${source}]=0，${source} 入队`,
    queue: [...queue],
  })

  while (queue.length > 0) {
    const u = queue.shift()!
    inQueue.delete(u)

    steps.push({
      dist: { ...dist },
      prev: { ...prev },
      visited: new Set(),
      currentNode: u,
      highlightEdges: new Set(confirmedEdges),
      desc: `出队 ${u}（dist=${dist[u]}），处理其邻居`,
      queue: [...queue],
    })

    for (const { to: v, w } of adj[u]) {
      const newDist = dist[u] + w
      if (newDist < dist[v]) {
        const old = dist[v]
        dist[v] = newDist
        prev[v] = u
        confirmedEdges.add(edgeKey(u, v))

        const willEnqueue = !inQueue.has(v)
        if (willEnqueue) {
          queue.push(v)
          inQueue.add(v)
        }

        steps.push({
          dist: { ...dist },
          prev: { ...prev },
          visited: new Set(),
          currentNode: u,
          relaxEdge: { from: u, to: v },
          relaxResult: 'updated',
          highlightEdges: new Set(confirmedEdges),
          desc: `松弛 ${u}→${v}: ${dist[u]}+${w}=${newDist} < ${old === Infinity ? '∞' : old} → 更新, ${v} ${willEnqueue ? '入队' : '已在队中'}`,
          queue: [...queue],
        })
      }
    }
  }

  steps.push({
    dist: { ...dist },
    prev: { ...prev },
    visited: new Set(nodeIds),
    highlightEdges: new Set(confirmedEdges),
    desc: `队列为空，完成! ${nodeIds.map((v) => `${v}=${dist[v]}`).join(', ')}`,
    queue: [],
  })
  return steps
}

function buildAStarSteps(grid: number[][], source: string, goal: string): GraphStep[] {
  const steps: GraphStep[] = []
  const [sr, sc] = source.split(',').map(Number)
  const [er, ec] = goal.split(',').map(Number)
  const rows = grid.length
  const cols = grid[0].length
  const h = (r: number, c: number) => Math.abs(r - er) + Math.abs(c - ec)
  const key = (r: number, c: number) => `${r},${c}`

  const gScore: Record<string, number> = {}
  const fScore: Record<string, number> = {}
  const closed = new Set<string>()
  const openSet = new Set<string>()
  const prevMap: Record<string, string> = {}
  gScore[key(sr, sc)] = 0
  fScore[key(sr, sc)] = h(sr, sc)
  const open: { r: number; c: number; f: number }[] = [{ r: sr, c: sc, f: h(sr, sc) }]
  openSet.add(key(sr, sc))

  steps.push({
    dist: {},
    prev: {},
    visited: new Set(),
    highlightEdges: new Set(),
    desc: `起点 (${sr},${sc})，终点 (${er},${ec})，h = 曼哈顿距离`,
    gridState: { open: new Set(openSet), closed: new Set(closed), path: [] },
  })

  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f)
    const { r, c } = open.shift()!
    const k = key(r, c)
    openSet.delete(k)

    if (r === er && c === ec) {
      const path: string[] = [k]
      let cur = k
      while (prevMap[cur]) {
        cur = prevMap[cur]
        path.unshift(cur)
      }
      steps.push({
        dist: {},
        prev: {},
        visited: new Set(),
        highlightEdges: new Set(),
        desc: `到达终点! 路径长度=${gScore[k]}，共探索 ${closed.size} 个节点`,
        gridState: { open: new Set(openSet), closed: new Set(closed), path },
      })
      return steps
    }

    if (closed.has(k)) continue
    closed.add(k)

    steps.push({
      dist: {},
      prev: {},
      visited: new Set(),
      highlightEdges: new Set(),
      currentNode: k,
      desc: `取出 (${r},${c})：g=${gScore[k]}, h=${h(r, c)}, f=${fScore[k]}`,
      gridState: { open: new Set(openSet), closed: new Set(closed), path: [] },
    })

    for (const [dr, dc] of dirs) {
      const nr = r + dr
      const nc = c + dc
      const nk = key(nr, nc)
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] === 1 || closed.has(nk)) continue
      const ng = gScore[k] + 1
      if (ng < (gScore[nk] ?? Infinity)) {
        gScore[nk] = ng
        fScore[nk] = ng + h(nr, nc)
        prevMap[nk] = k
        open.push({ r: nr, c: nc, f: fScore[nk] })
        openSet.add(nk)
      }
    }

    steps.push({
      dist: {},
      prev: {},
      visited: new Set(),
      highlightEdges: new Set(),
      desc: `扩展 (${r},${c}) 的邻居，open 集 ${openSet.size} 个，closed 集 ${closed.size} 个`,
      gridState: { open: new Set(openSet), closed: new Set(closed), path: [] },
    })
  }

  steps.push({
    dist: {},
    prev: {},
    visited: new Set(),
    highlightEdges: new Set(),
    desc: '无法到达终点!',
    gridState: { open: new Set(), closed: new Set(closed), path: [] },
  })
  return steps
}

function buildBFSSteps(nodes: GraphNode[], edges: GraphEdge[], source: string): GraphStep[] {
  const steps: GraphStep[] = []
  const nodeIds = nodes.map((n) => n.id)
  const adj: Record<string, string[]> = {}
  for (const id of nodeIds) adj[id] = []
  for (const e of edges) adj[e.from].push(e.to)

  const visited = new Set<string>([source])
  const queue = [source]
  const order: string[] = []
  const levels: Record<string, number> = {}
  const prev: Record<string, string | null> = {}
  for (const id of nodeIds) {
    levels[id] = -1
    prev[id] = null
  }
  levels[source] = 0

  steps.push({
    dist: {},
    prev: { ...prev },
    visited: new Set(visited),
    highlightEdges: new Set(),
    queue: [...queue],
    order: [...order],
    levels: { ...levels },
    desc: `初始化：从 ${source} 开始，先把起点入队`,
  })

  while (queue.length) {
    const u = queue.shift()!
    order.push(u)
    steps.push({
      dist: {},
      prev: { ...prev },
      visited: new Set(visited),
      currentNode: u,
      highlightEdges: new Set(),
      queue: [...queue],
      order: [...order],
      levels: { ...levels },
      desc: `队首出队 ${u}，它属于第 ${levels[u]} 层，开始按顺序扩展邻居`,
    })

    for (const v of adj[u]) {
      if (visited.has(v)) {
        steps.push({
          dist: {},
          prev: { ...prev },
          visited: new Set(visited),
          currentNode: u,
          relaxEdge: { from: u, to: v },
          relaxResult: 'no-change',
          highlightEdges: new Set([edgeKey(u, v)]),
          queue: [...queue],
          order: [...order],
          levels: { ...levels },
          desc: `${u} 的邻居 ${v} 已访问过，不再重复入队`,
        })
        continue
      }
      visited.add(v)
      prev[v] = u
      levels[v] = levels[u] + 1
      queue.push(v)
      steps.push({
        dist: {},
        prev: { ...prev },
        visited: new Set(visited),
        currentNode: u,
        relaxEdge: { from: u, to: v },
        relaxResult: 'updated',
        highlightEdges: new Set([edgeKey(u, v)]),
        queue: [...queue],
        order: [...order],
        levels: { ...levels },
        desc: `发现新节点 ${v}，层数 = ${levels[u]} + 1 = ${levels[v]}，入队等待下一层处理`,
      })
    }
  }

  steps.push({
    dist: {},
    prev: { ...prev },
    visited: new Set(visited),
    highlightEdges: new Set(),
    queue: [],
    order: [...order],
    levels: { ...levels },
    desc: `BFS 完成，访问顺序：${order.join(' -> ')}`,
  })
  return steps
}

function buildDFSSteps(nodes: GraphNode[], edges: GraphEdge[], source: string): GraphStep[] {
  const steps: GraphStep[] = []
  const nodeIds = nodes.map((n) => n.id)
  const adj: Record<string, string[]> = {}
  for (const id of nodeIds) adj[id] = []
  for (const e of edges) adj[e.from].push(e.to)

  const visited = new Set<string>()
  const order: string[] = []
  const stack: string[] = []
  const prev: Record<string, string | null> = {}
  for (const id of nodeIds) prev[id] = null

  const dfs = (u: string) => {
    visited.add(u)
    order.push(u)
    stack.push(u)
    steps.push({
      dist: {},
      prev: { ...prev },
      visited: new Set(visited),
      currentNode: u,
      highlightEdges: new Set(),
      stack: [...stack],
      order: [...order],
      desc: `进入 ${u}，压栈。DFS 会优先沿着当前路径继续向深处走`,
    })

    for (const v of adj[u]) {
      if (visited.has(v)) {
        steps.push({
          dist: {},
          prev: { ...prev },
          visited: new Set(visited),
          currentNode: u,
          relaxEdge: { from: u, to: v },
          relaxResult: 'no-change',
          highlightEdges: new Set([edgeKey(u, v)]),
          stack: [...stack],
          order: [...order],
          desc: `${u} -> ${v} 指向已访问节点，说明这条分支不用再次深入`,
        })
        continue
      }
      prev[v] = u
      steps.push({
        dist: {},
        prev: { ...prev },
        visited: new Set(visited),
        currentNode: u,
        relaxEdge: { from: u, to: v },
        relaxResult: 'updated',
        highlightEdges: new Set([edgeKey(u, v)]),
        stack: [...stack],
        order: [...order],
        desc: `从 ${u} 沿 ${u} -> ${v} 继续深入，暂时不处理其它兄弟分支`,
      })
      dfs(v)
      steps.push({
        dist: {},
        prev: { ...prev },
        visited: new Set(visited),
        currentNode: u,
        highlightEdges: new Set([edgeKey(u, v)]),
        stack: [...stack],
        order: [...order],
        desc: `从 ${v} 回溯到 ${u}，继续检查 ${u} 剩余的邻居`,
      })
    }

    stack.pop()
    steps.push({
      dist: {},
      prev: { ...prev },
      visited: new Set(visited),
      currentNode: u,
      highlightEdges: new Set(),
      stack: [...stack],
      order: [...order],
      desc: `${u} 的邻居都处理完，出栈回溯`,
    })
  }

  dfs(source)
  steps.push({
    dist: {},
    prev: { ...prev },
    visited: new Set(visited),
    highlightEdges: new Set(),
    stack: [],
    order: [...order],
    desc: `DFS 完成，访问顺序：${order.join(' -> ')}`,
  })
  return steps
}

function buildTopoSteps(nodes: GraphNode[], edges: GraphEdge[]): GraphStep[] {
  const steps: GraphStep[] = []
  const nodeIds = nodes.map((n) => n.id)
  const adj: Record<string, string[]> = {}
  const indegree: Record<string, number> = {}
  for (const id of nodeIds) {
    adj[id] = []
    indegree[id] = 0
  }
  for (const e of edges) {
    adj[e.from].push(e.to)
    indegree[e.to] += 1
  }
  const queue = nodeIds.filter((id) => indegree[id] === 0)
  const order: string[] = []

  steps.push({
    dist: {},
    prev: {},
    visited: new Set(),
    highlightEdges: new Set(),
    queue: [...queue],
    order: [...order],
    indegree: { ...indegree },
    desc: `初始化入度，先把所有入度为 0 的点入队：${queue.join('、')}`,
  })

  while (queue.length) {
    const u = queue.shift()!
    order.push(u)
    steps.push({
      dist: {},
      prev: {},
      visited: new Set(order),
      currentNode: u,
      highlightEdges: new Set(),
      queue: [...queue],
      order: [...order],
      indegree: { ...indegree },
      desc: `输出 ${u}，因为它当前没有任何未解决的前驱依赖`,
    })

    for (const v of adj[u]) {
      indegree[v] -= 1
      const highlight = new Set([edgeKey(u, v)])
      if (indegree[v] === 0) {
        queue.push(v)
        steps.push({
          dist: {},
          prev: {},
          visited: new Set(order),
          currentNode: u,
          relaxEdge: { from: u, to: v },
          relaxResult: 'updated',
          highlightEdges: highlight,
          queue: [...queue],
          order: [...order],
          indegree: { ...indegree },
          desc: `删除边 ${u} -> ${v} 后，${v} 的入度降为 0，因此现在也可以入队`,
        })
      } else {
        steps.push({
          dist: {},
          prev: {},
          visited: new Set(order),
          currentNode: u,
          relaxEdge: { from: u, to: v },
          relaxResult: 'no-change',
          highlightEdges: highlight,
          queue: [...queue],
          order: [...order],
          indegree: { ...indegree },
          desc: `删除边 ${u} -> ${v} 后，${v} 的入度变为 ${indegree[v]}，还不能输出`,
        })
      }
    }
  }

  steps.push({
    dist: {},
    prev: {},
    visited: new Set(order),
    highlightEdges: new Set(),
    queue: [],
    order: [...order],
    indegree: { ...indegree },
    desc: order.length === nodeIds.length ? `拓扑排序完成：${order.join(' -> ')}` : '输出节点数不足，图中存在环，无法完成拓扑排序',
  })
  return steps
}

function buildTarjanSteps(nodes: GraphNode[], edges: GraphEdge[]): GraphStep[] {
  const steps: GraphStep[] = []
  const nodeIds = nodes.map((n) => n.id)
  const adj: Record<string, string[]> = {}
  for (const id of nodeIds) adj[id] = []
  for (const e of edges) adj[e.from].push(e.to)

  const dfn: Record<string, number> = {}
  const low: Record<string, number> = {}
  const stack: string[] = []
  const onStack = new Set<string>()
  const visited = new Set<string>()
  const components: string[][] = []
  let time = 0

  const snapshot = (desc: string, currentNode?: string, relaxEdge?: { from: string; to: string }, relaxResult?: 'updated' | 'no-change') => {
    steps.push({
      dist: {},
      prev: {},
      visited: new Set(visited),
      currentNode,
      relaxEdge,
      relaxResult,
      highlightEdges: relaxEdge ? new Set([edgeKey(relaxEdge.from, relaxEdge.to)]) : new Set(),
      stack: [...stack],
      dfn: { ...dfn },
      low: { ...low },
      onStack: new Set(onStack),
      components: components.map((c) => [...c]),
      desc,
    })
  }

  const dfs = (u: string) => {
    visited.add(u)
    dfn[u] = low[u] = ++time
    stack.push(u)
    onStack.add(u)
    snapshot(`首次访问 ${u}：设置 dfn[${u}] = low[${u}] = ${dfn[u]}，并压栈`, u)

    for (const v of adj[u]) {
      if (!(v in dfn)) {
        snapshot(`${u} -> ${v} 指向未访问节点，继续深入 DFS`, u, { from: u, to: v }, 'updated')
        dfs(v)
        low[u] = Math.min(low[u], low[v])
        snapshot(`从 ${v} 回来后，用 low[${v}] 更新 low[${u}]，得到 low[${u}] = ${low[u]}`, u, { from: u, to: v }, 'updated')
      } else if (onStack.has(v)) {
        low[u] = Math.min(low[u], dfn[v])
        snapshot(`${u} -> ${v} 指向栈中祖先，可回退到时间戳 ${dfn[v]}，更新 low[${u}] = ${low[u]}`, u, { from: u, to: v }, 'updated')
      } else {
        snapshot(`${u} -> ${v} 指向已经出栈的分量，不参与当前 low 更新`, u, { from: u, to: v }, 'no-change')
      }
    }

    if (dfn[u] === low[u]) {
      const component: string[] = []
      while (true) {
        const x = stack.pop()!
        onStack.delete(x)
        component.push(x)
        if (x === u) break
      }
      components.push(component)
      snapshot(`发现一个强连通分量：{ ${component.join(', ')} }，因为 dfn[${u}] == low[${u}]`, u)
    }
  }

  for (const id of nodeIds) {
    if (!(id in dfn)) dfs(id)
  }

  snapshot(`Tarjan 完成，共找到 ${components.length} 个强连通分量`, undefined)
  return steps
}

function buildSteps(config: GraphAnimationConfig): GraphStep[] {
  switch (config.algorithm) {
    case 'bfs':
      return buildBFSSteps(config.nodes, config.edges, config.source)
    case 'dfs':
      return buildDFSSteps(config.nodes, config.edges, config.source)
    case 'topo':
      return buildTopoSteps(config.nodes, config.edges)
    case 'tarjan':
      return buildTarjanSteps(config.nodes, config.edges)
    case 'dijkstra':
      return buildDijkstraSteps(config.nodes, config.edges, config.source)
    case 'bellman-ford':
      return buildBellmanFordSteps(config.nodes, config.edges, config.source)
    case 'spfa':
      return buildSPFASteps(config.nodes, config.edges, config.source)
    case 'floyd':
      return buildFloydSteps(config.nodes, config.edges)
    case 'astar':
      return buildAStarSteps(config.grid!, config.source, config.goal!)
    default:
      return []
  }
}

function usePlayer(total: number) {
  const [step, setStep] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(700)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  useEffect(() => {
    if (!playing) {
      clear()
      return
    }
    if (step >= total - 1) {
      setPlaying(false)
      return
    }
    timer.current = setTimeout(() => setStep((s) => s + 1), speed)
    return clear
  }, [playing, step, total, speed, clear])

  return {
    step,
    playing,
    speed,
    setSpeed,
    reset: useCallback(() => {
      clear()
      setPlaying(false)
      setStep(-1)
    }, [clear]),
    playPause: useCallback(() => {
      if (step >= total - 1) {
        setStep(-1)
        setPlaying(true)
      } else {
        setPlaying((p) => !p)
      }
    }, [step, total]),
    next: useCallback(() => {
      setPlaying(false)
      setStep((s) => Math.min(s + 1, total - 1))
    }, [total]),
    prev: useCallback(() => {
      setPlaying(false)
      setStep((s) => Math.max(s - 1, -1))
    }, []),
  }
}

function GraphView({ nodes, edges, step }: { nodes: GraphNode[]; edges: GraphEdge[]; step: GraphStep | null }) {
  const w = 620
  const h = 250
  const r = 20
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  function nodeColor(id: string): string {
    if (!step) return 'stroke-slate-500 fill-slate-800'
    if (id === step.currentNode) return 'stroke-amber-400 fill-amber-400/20'
    if (step.onStack?.has(id)) return 'stroke-fuchsia-400 fill-fuchsia-400/15'
    if (step.visited.has(id)) return 'stroke-emerald-500 fill-emerald-500/15'
    return 'stroke-slate-500 fill-slate-800'
  }

  function nodeTextColor(id: string): string {
    if (!step) return 'fill-gray-300'
    if (id === step.currentNode) return 'fill-amber-300'
    if (step.onStack?.has(id)) return 'fill-fuchsia-300'
    if (step.visited.has(id)) return 'fill-emerald-300'
    return 'fill-gray-300'
  }

  function edgeColor(from: string, to: string): string {
    if (!step) return 'stroke-gray-700'
    const key = edgeKey(from, to)
    if (step.relaxEdge?.from === from && step.relaxEdge?.to === to) {
      return step.relaxResult === 'updated' ? 'stroke-emerald-400' : 'stroke-rose-400'
    }
    if (step.highlightEdges.has(key)) return 'stroke-emerald-500/60'
    return 'stroke-gray-700'
  }

  function edgeWidth(from: string, to: string): number {
    if (!step) return 1.5
    if (step.relaxEdge?.from === from && step.relaxEdge?.to === to) return 3
    if (step.highlightEdges.has(edgeKey(from, to))) return 2.5
    return 1.5
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block w-full h-auto max-w-[620px]">
      <defs>
        <marker id="arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" className="fill-gray-600" />
        </marker>
        <marker id="arrow-green" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" className="fill-emerald-400" />
        </marker>
        <marker id="arrow-red" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
          <polygon points="0 0, 10 3.5, 0 7" className="fill-rose-400" />
        </marker>
      </defs>

      {edges.map((e, i) => {
        const a = nodeMap.get(e.from)!
        const b = nodeMap.get(e.to)!
        const dx = b.x - a.x
        const dy = b.y - a.y
        const len = Math.sqrt(dx * dx + dy * dy)
        const ux = dx / len
        const uy = dy / len
        const x1 = a.x + ux * r
        const y1 = a.y + uy * r
        const x2 = b.x - ux * (r + 6)
        const y2 = b.y - uy * (r + 6)
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        const color = edgeColor(e.from, e.to)
        const isRelaxing = step?.relaxEdge?.from === e.from && step?.relaxEdge?.to === e.to
        const markerEnd = isRelaxing
          ? step?.relaxResult === 'updated'
            ? 'url(#arrow-green)'
            : 'url(#arrow-red)'
          : 'url(#arrow)'

        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} className={color} strokeWidth={edgeWidth(e.from, e.to)} markerEnd={markerEnd} />
            <text x={mx + uy * 12} y={my - ux * 12} textAnchor="middle" className={`text-[10px] font-bold font-mono ${isRelaxing ? 'fill-white' : 'fill-gray-400'}`}>
              {e.weight}
            </text>
          </g>
        )
      })}

      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={r} className={nodeColor(n.id)} strokeWidth={2.5} />
          <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="central" className={`text-sm font-bold font-mono ${nodeTextColor(n.id)}`}>
            {n.id}
          </text>
          {step && step.dist[n.id] !== undefined && (
            <text x={n.x} y={n.y + r + 14} textAnchor="middle" className="text-[9px] font-mono fill-gray-500">
              {step.dist[n.id] === Infinity ? '∞' : step.dist[n.id]}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

function DistTable({ nodes, step, source }: { nodes: GraphNode[]; step: GraphStep | null; source: string }) {
  if (!step) return null
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1 border border-gray-700 bg-gray-900 text-gray-500">节点</th>
            {nodes.map((n) => (
              <th
                key={n.id}
                className={`px-3 py-1 border border-gray-700 font-mono ${
                  n.id === step.currentNode
                    ? 'bg-amber-400/20 text-amber-300'
                    : step.visited.has(n.id)
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-gray-900 text-gray-300'
                }`}
              >
                {n.id}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-2 py-1 border border-gray-700 bg-gray-900 text-gray-500">dist</td>
            {nodes.map((n) => {
              const d = step.dist[n.id]
              const isUpdating = step.relaxEdge?.to === n.id && step.relaxResult === 'updated'
              return (
                <td
                  key={n.id}
                  className={`px-3 py-1 border border-gray-700 font-mono text-center ${
                    isUpdating
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                      : n.id === source && d === 0
                        ? 'bg-blue-500/10 text-blue-300'
                        : d === Infinity
                          ? 'text-gray-600'
                          : 'text-gray-300'
                  }`}
                >
                  {d === Infinity ? '∞' : d}
                </td>
              )
            })}
          </tr>
          <tr>
            <td className="px-2 py-1 border border-gray-700 bg-gray-900 text-gray-500">前驱</td>
            {nodes.map((n) => (
              <td key={n.id} className="px-3 py-1 border border-gray-700 font-mono text-center text-gray-500">
                {step.prev[n.id] ?? '-'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function SequencePanel({ title, values, accent }: { title: string; values?: string[]; accent: string }) {
  if (!values) return null
  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3">
      <div className="text-xs text-gray-500 mb-1.5">{title}</div>
      <div className="flex gap-1 flex-wrap items-center">
        {values.length > 0 ? values.map((value, i) => (
          <span key={`${title}-${i}-${value}`} className={`px-2 py-1 rounded border text-xs font-mono ${accent}`}>
            {value}
          </span>
        )) : <span className="text-[10px] text-gray-600 italic">空</span>}
      </div>
    </div>
  )
}

function TraversalTable({ nodes, step }: { nodes: GraphNode[]; step: GraphStep | null }) {
  if (!step) return null
  const hasLevels = !!step.levels
  const hasIndegree = !!step.indegree
  const hasTarjan = !!step.dfn || !!step.low
  if (!hasLevels && !hasIndegree && !hasTarjan) return null

  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 overflow-x-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1 border border-gray-700 bg-gray-900 text-gray-500">节点</th>
            {nodes.map((n) => (
              <th key={n.id} className={`px-3 py-1 border border-gray-700 font-mono ${n.id === step.currentNode ? 'bg-amber-400/20 text-amber-300' : 'bg-gray-900 text-gray-300'}`}>
                {n.id}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hasLevels && (
            <tr>
              <td className="px-2 py-1 border border-gray-700 bg-gray-900 text-gray-500">层数</td>
              {nodes.map((n) => (
                <td key={`level-${n.id}`} className="px-3 py-1 border border-gray-700 font-mono text-center text-gray-300">
                  {(step.levels?.[n.id] ?? -1) < 0 ? '-' : step.levels?.[n.id]}
                </td>
              ))}
            </tr>
          )}
          {hasIndegree && (
            <tr>
              <td className="px-2 py-1 border border-gray-700 bg-gray-900 text-gray-500">入度</td>
              {nodes.map((n) => (
                <td key={`indegree-${n.id}`} className="px-3 py-1 border border-gray-700 font-mono text-center text-gray-300">
                  {step.indegree?.[n.id] ?? '-'}
                </td>
              ))}
            </tr>
          )}
          {hasTarjan && (
            <tr>
              <td className="px-2 py-1 border border-gray-700 bg-gray-900 text-gray-500">dfn</td>
              {nodes.map((n) => (
                <td key={`dfn-${n.id}`} className="px-3 py-1 border border-gray-700 font-mono text-center text-gray-300">
                  {step.dfn?.[n.id] ?? '-'}
                </td>
              ))}
            </tr>
          )}
          {hasTarjan && (
            <tr>
              <td className="px-2 py-1 border border-gray-700 bg-gray-900 text-gray-500">low</td>
              {nodes.map((n) => (
                <td key={`low-${n.id}`} className="px-3 py-1 border border-gray-700 font-mono text-center text-gray-300">
                  {step.low?.[n.id] ?? '-'}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function FloydMatrix({ matrix, nodes, k, ci, cj }: {
  matrix: number[][]
  nodes: GraphNode[]
  k?: number
  ci?: number
  cj?: number
}) {
  const ids = nodes.map((n) => n.id)
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th className="w-8 h-7 border border-gray-700 bg-gray-900 text-gray-600 text-[10px]">→</th>
            {ids.map((id, j) => (
              <th
                key={j}
                className={`w-10 h-7 border border-gray-700 font-mono text-[10px] ${
                  j === cj ? 'bg-amber-400/15 text-amber-300' : j === k ? 'bg-violet-500/15 text-violet-300' : 'bg-gray-900 text-gray-400'
                }`}
              >
                {id}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <td
                className={`w-8 h-7 border border-gray-700 font-mono text-[10px] text-center ${
                  i === ci ? 'bg-amber-400/15 text-amber-300' : i === k ? 'bg-violet-500/15 text-violet-300' : 'bg-gray-900 text-gray-400'
                }`}
              >
                {ids[i]}
              </td>
              {row.map((val, j) => {
                const isCurrent = i === ci && j === cj
                const isKRow = i === ci && j === k
                const isKCol = i === k && j === cj
                return (
                  <td
                    key={j}
                    className={`w-10 h-7 border border-gray-700 font-mono text-[10px] text-center ${
                      isCurrent
                        ? 'bg-emerald-500/25 text-emerald-300 font-bold'
                        : isKRow || isKCol
                          ? 'bg-sky-500/15 text-sky-300'
                          : i === j
                            ? 'bg-gray-800 text-gray-600'
                            : 'text-gray-400'
                    }`}
                  >
                    {val >= 99999 || val === Infinity ? '∞' : val}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function GraphAnimation({ config }: { config: GraphAnimationConfig }) {
  const steps = useRef(buildSteps(config)).current
  const player = usePlayer(steps.length)
  const cur = player.step >= 0 ? steps[player.step] : null
  const isFloyd = config.algorithm === 'floyd'
  const isAStar = config.algorithm === 'astar'
  const isTraversal = ['bfs', 'dfs', 'topo', 'tarjan'].includes(config.algorithm)
  const isGraph = !isAStar && config.nodes.length > 0

  return (
    <div className="space-y-3">
      {isGraph && (
        <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 overflow-x-auto">
          <GraphView nodes={config.nodes} edges={config.edges} step={cur} />
        </div>
      )}

      {isAStar && config.grid && (
        <AStarGridView grid={config.grid} source={config.source} goal={config.goal!} gridState={cur?.gridState} currentNode={cur?.currentNode} />
      )}

      {!isFloyd && !isAStar && isGraph && (
        <div className="bg-gray-950 rounded-lg border border-gray-800 p-3">
          <div className="text-xs text-gray-500 mb-2">
            距离表 {cur?.phase && <span className="text-indigo-400 ml-2">{cur.phase}</span>}
          </div>
          <DistTable nodes={config.nodes} step={cur} source={config.source} />
        </div>
      )}

      {isTraversal && (
        <TraversalTable nodes={config.nodes} step={cur} />
      )}

      {config.algorithm === 'bfs' && <SequencePanel title="队列" values={cur?.queue} accent="border-sky-500/40 bg-sky-500/10 text-sky-300" />}
      {config.algorithm === 'dfs' && <SequencePanel title="递归栈" values={cur?.stack} accent="border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300" />}
      {config.algorithm === 'topo' && <SequencePanel title="当前队列" values={cur?.queue} accent="border-sky-500/40 bg-sky-500/10 text-sky-300" />}
      {config.algorithm === 'tarjan' && <SequencePanel title="Tarjan 栈" values={cur?.stack} accent="border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300" />}
      {isTraversal && <SequencePanel title="访问/输出顺序" values={cur?.order} accent="border-emerald-500/40 bg-emerald-500/10 text-emerald-300" />}
      {config.algorithm === 'tarjan' && cur?.components && (
        <div className="bg-gray-950 rounded-lg border border-gray-800 p-3">
          <div className="text-xs text-gray-500 mb-1.5">已识别的强连通分量</div>
          <div className="flex gap-2 flex-wrap">
            {cur.components.length > 0 ? cur.components.map((component, i) => (
              <span key={`component-${i}`} className="px-2 py-1 rounded border text-xs font-mono border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                {`{ ${component.join(', ')} }`}
              </span>
            )) : <span className="text-[10px] text-gray-600 italic">暂无</span>}
          </div>
        </div>
      )}

      {config.algorithm === 'spfa' && cur?.queue && (
        <div className="bg-gray-950 rounded-lg border border-gray-800 p-3">
          <div className="text-xs text-gray-500 mb-1.5">队列</div>
          <div className="flex gap-0.5 items-center">
            <span className="text-[10px] text-gray-600 mr-1">队首←</span>
            {cur.queue.length > 0 ? cur.queue.map((v, i) => (
              <span key={i} className="w-7 h-7 flex items-center justify-center text-xs font-mono font-bold rounded border border-sky-500/40 bg-sky-500/10 text-sky-300">
                {v}
              </span>
            )) : <span className="text-[10px] text-gray-600 italic">空</span>}
            <span className="text-[10px] text-gray-600 ml-1">→队尾</span>
          </div>
        </div>
      )}

      {isFloyd && cur?.floydMatrix && (
        <div className="bg-gray-950 rounded-lg border border-gray-800 p-3">
          <div className="text-xs text-gray-500 mb-2">
            距离矩阵 {cur.phase && <span className="text-violet-400 ml-2">中间节点 {cur.phase}</span>}
          </div>
          <FloydMatrix matrix={cur.floydMatrix} nodes={config.nodes} k={cur.floydK} ci={cur.floydI} cj={cur.floydJ} />
        </div>
      )}

      <div className="flex gap-3 text-[10px] text-gray-500 flex-wrap">
        {isAStar ? (
          <>
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-sky-400/40 border border-sky-400 mr-0.5 align-middle" /> Open(待探索)</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-gray-600 mr-0.5 align-middle" /> Closed(已探索)</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500 mr-0.5 align-middle" /> 最终路径</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-gray-400 mr-0.5 align-middle" /> 障碍物</span>
          </>
        ) : (
          <>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400/30 border border-amber-400 mr-0.5 align-middle" /> 当前节点</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500 mr-0.5 align-middle" /> 已确定</span>
            {config.algorithm === 'tarjan' && <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-fuchsia-500/30 border border-fuchsia-400 mr-0.5 align-middle" /> 栈中节点</span>}
            <span><span className="inline-block w-2.5 h-0.5 bg-emerald-400 mr-0.5 align-middle" /> 松弛成功</span>
            <span><span className="inline-block w-2.5 h-0.5 bg-rose-400 mr-0.5 align-middle" /> 松弛失败</span>
          </>
        )}
      </div>

      {cur && (
        <motion.div key={player.step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm bg-gray-800 rounded px-4 py-2 text-gray-200">
          {cur.desc}
        </motion.div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={player.prev} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300">上一步</button>
        <button onClick={player.playPause} className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded text-white font-medium min-w-16">
          {player.playing ? '暂停' : '播放'}
        </button>
        <button onClick={player.next} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300">下一步</button>
        <button onClick={player.reset} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300">重置</button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-gray-500">速度:</label>
          <input type="range" min={200} max={2000} step={100} value={2200 - player.speed} onChange={(e) => player.setSpeed(2200 - Number(e.target.value))} className="w-20 accent-indigo-500" />
        </div>
        <span className="text-xs text-gray-500">{player.step + 1} / {steps.length}</span>
      </div>
    </div>
  )
}

function AStarGridView({
  grid,
  source,
  goal,
  gridState,
  currentNode,
}: {
  grid: number[][]
  source: string
  goal: string
  gridState?: { open: Set<string>; closed: Set<string>; path: string[] }
  currentNode?: string
}) {
  const rows = grid.length
  const cols = grid[0].length
  const cellSize = 36
  const pathSet = new Set(gridState?.path ?? [])

  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 overflow-x-auto">
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: '2px' }}>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const k = `${r},${c}`
            const isWall = grid[r][c] === 1
            const isStart = k === source
            const isGoal = k === goal
            const isPath = pathSet.has(k)
            const isCurrent = k === currentNode
            const isOpen = gridState?.open.has(k)
            const isClosed = gridState?.closed.has(k)

            let bg = 'bg-gray-800'
            if (isWall) bg = 'bg-gray-500'
            else if (isStart) bg = 'bg-blue-500'
            else if (isGoal) bg = 'bg-rose-500'
            else if (isPath) bg = 'bg-emerald-500'
            else if (isCurrent) bg = 'bg-amber-400'
            else if (isOpen) bg = 'bg-sky-400/30'
            else if (isClosed) bg = 'bg-gray-600'

            return (
              <div
                key={k}
                className={`rounded-sm flex items-center justify-center text-[8px] font-mono ${bg} ${
                  isStart || isGoal ? 'text-white font-bold' : isCurrent ? 'text-gray-900 font-bold' : 'text-gray-500'
                }`}
                style={{ width: cellSize, height: cellSize }}
              >
                {isStart ? 'S' : isGoal ? 'G' : isWall ? '' : isCurrent ? 'N' : ''}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
