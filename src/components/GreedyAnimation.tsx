import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { GreedyAnimationConfig, GraphNode, GraphEdge } from '../data/algorithms'

// ==================== 步骤类型 ====================

interface HuffTreeNode {
  label: string
  freq: number
  left?: HuffTreeNode
  right?: HuffTreeNode
}

interface GreedyStep {
  desc: string
  activities?: { name: string; start: number; end: number; status: 'pending' | 'selected' | 'rejected' | 'current' }[]
  knapsackState?: { items: { w: number; v: number; ratio: number; taken: number }[]; remaining: number; total: number }
  // Huffman
  huffNodes?: { label: string; freq: number; merged?: boolean }[]
  huffTreeRoot?: HuffTreeNode  // 最终的完整树
  // Prim/Kruskal: 图
  graphNodes?: GraphNode[]
  graphEdges?: { from: string; to: string; weight: number; status: 'none' | 'selected' | 'rejected' | 'current' }[]
  mstTotal?: number
}

// ==================== 活动选择步骤 ====================

function buildActivitySteps(activities: { name: string; start: number; end: number }[]): GreedyStep[] {
  const sorted = [...activities].sort((a, b) => a.end - b.end)
  const steps: GreedyStep[] = []
  const statuses: ('pending' | 'selected' | 'rejected' | 'current')[] = sorted.map(() => 'pending')

  steps.push({ desc: `按结束时间排序: ${sorted.map(a => `${a.name}[${a.start},${a.end})`).join(', ')}`, activities: sorted.map((a, i) => ({ ...a, status: statuses[i] })) })

  const selected: string[] = []
  let lastEnd = -1
  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i]
    const acts = sorted.map((a, j) => ({ ...a, status: j === i ? 'current' as const : statuses[j] }))
    steps.push({ desc: `检查 ${a.name}[${a.start},${a.end}): start=${a.start} ${a.start >= lastEnd ? '>=' : '<'} lastEnd=${lastEnd === -1 ? 0 : lastEnd}`, activities: acts })

    if (a.start >= lastEnd || lastEnd === -1) {
      statuses[i] = 'selected'
      selected.push(a.name)
      lastEnd = a.end
      steps.push({ desc: `选中 ${a.name}! 已选: [${selected}]，lastEnd=${lastEnd}`, activities: sorted.map((a, j) => ({ ...a, status: statuses[j] })) })
    } else {
      statuses[i] = 'rejected'
      steps.push({ desc: `跳过 ${a.name}（与已选活动冲突）`, activities: sorted.map((a, j) => ({ ...a, status: statuses[j] })) })
    }
  }
  steps.push({ desc: `完成! 最多选 ${selected.length} 个活动: [${selected}]`, activities: sorted.map((a, j) => ({ ...a, status: statuses[j] })) })
  return steps
}

// ==================== 分数背包步骤 ====================

function buildFractionalSteps(items: { weight: number; value: number }[], capacity: number): GreedyStep[] {
  const sorted = items.map(it => ({ w: it.weight, v: it.value, ratio: +(it.value / it.weight).toFixed(2), taken: 0 })).sort((a, b) => b.ratio - a.ratio)
  const steps: GreedyStep[] = []
  let remaining = capacity, total = 0

  steps.push({ desc: `按性价比排序: ${sorted.map(it => `(w=${it.w},v=${it.v},比=${it.ratio})`).join(' > ')}`, knapsackState: { items: sorted.map(it => ({ ...it })), remaining, total } })

  for (const it of sorted) {
    if (remaining <= 0) break
    if (it.w <= remaining) {
      it.taken = 1
      remaining -= it.w
      total += it.v
      steps.push({ desc: `全装 (w=${it.w},v=${it.v}): 剩余容量 ${remaining}，总价值 ${total}`, knapsackState: { items: sorted.map(it => ({ ...it })), remaining, total } })
    } else {
      const frac = +(remaining / it.w).toFixed(2)
      const gained = +(remaining * it.ratio).toFixed(1)
      it.taken = frac
      total += gained
      remaining = 0
      steps.push({ desc: `装 ${(frac * 100).toFixed(0)}% (w=${it.w},v=${it.v}): 取 ${gained}，背包已满，总价值 ${total}`, knapsackState: { items: sorted.map(it => ({ ...it })), remaining, total } })
    }
  }
  steps.push({ desc: `完成! 最大价值 = ${total}`, knapsackState: { items: sorted.map(it => ({ ...it })), remaining, total } })
  return steps
}

// ==================== Huffman 步骤 ====================

function buildHuffmanSteps(frequencies: { char: string; freq: number }[]): GreedyStep[] {
  const steps: GreedyStep[] = []
  // 用真正的树节点
  let treeNodes: HuffTreeNode[] = frequencies.map(f => ({ label: f.char, freq: f.freq }))
  let displayNodes = frequencies.map(f => ({ label: f.char, freq: f.freq, merged: false }))

  steps.push({ desc: `初始节点: ${displayNodes.map(n => `${n.label}(${n.freq})`).join(', ')}`, huffNodes: displayNodes.map(n => ({ ...n })) })

  let round = 0
  while (treeNodes.length > 1) {
    round++
    // 按频率排序
    const indices = treeNodes.map((_, i) => i).sort((a, b) => treeNodes[a].freq - treeNodes[b].freq)
    const ai = indices[0], bi = indices[1]
    const a = treeNodes[ai], b = treeNodes[bi]

    displayNodes = treeNodes.map((n, i) => ({
      label: n.label, freq: n.freq,
      merged: i === ai || i === bi
    }))
    steps.push({ desc: `第${round}轮: 取最小 ${a.label}(${a.freq}) 和 ${b.label}(${b.freq})，合并`, huffNodes: displayNodes })

    // 合并为新树节点
    const merged: HuffTreeNode = {
      label: `${a.label}${b.label}`,
      freq: a.freq + b.freq,
      left: a,
      right: b,
    }
    treeNodes = treeNodes.filter((_, i) => i !== ai && i !== bi)
    treeNodes.push(merged)

    displayNodes = treeNodes.map(n => ({ label: n.label, freq: n.freq, merged: false }))
    steps.push({ desc: `合并后: ${treeNodes.map(n => `${n.label}(${n.freq})`).join(', ')}`, huffNodes: displayNodes })
  }

  // 最终展示完整树 + 编码
  const root = treeNodes[0]
  const codes: { char: string; code: string }[] = []
  function walk(node: HuffTreeNode, code: string) {
    if (!node.left && !node.right) { codes.push({ char: node.label, code: code || '0' }); return }
    if (node.left) walk(node.left, code + '0')
    if (node.right) walk(node.right, code + '1')
  }
  walk(root, '')
  const codeStr = codes.map(c => `${c.char}=${c.code}`).join(', ')

  steps.push({
    desc: `Huffman 树构建完成! 编码: ${codeStr}`,
    huffNodes: [{ label: root.label, freq: root.freq, merged: false }],
    huffTreeRoot: root,
  })
  return steps
}

// ==================== Prim 步骤 ====================

function buildPrimSteps(nodes: GraphNode[], edges: GraphEdge[]): GreedyStep[] {
  const steps: GreedyStep[] = []
  const adj: Record<string, { to: string; w: number }[]> = {}
  for (const n of nodes) adj[n.id] = []
  for (const e of edges) { adj[e.from].push({ to: e.to, w: e.weight }); adj[e.to].push({ to: e.from, w: e.weight }) }

  const inMST = new Set<string>()
  const edgeStatuses = new Map<string, 'none' | 'selected' | 'rejected' | 'current'>()
  const ek = (a: string, b: string) => a < b ? `${a}-${b}` : `${b}-${a}`
  let total = 0

  inMST.add(nodes[0].id)
  steps.push({ desc: `从 ${nodes[0].id} 开始`, graphNodes: nodes, graphEdges: edges.map(e => ({ ...e, status: edgeStatuses.get(ek(e.from, e.to)) || 'none' })), mstTotal: 0 })

  while (inMST.size < nodes.length) {
    let bestEdge: { from: string; to: string; w: number } | null = null
    for (const u of inMST) {
      for (const { to: v, w } of adj[u]) {
        if (!inMST.has(v) && (!bestEdge || w < bestEdge.w)) bestEdge = { from: u, to: v, w }
      }
    }
    if (!bestEdge) break

    edgeStatuses.set(ek(bestEdge.from, bestEdge.to), 'current')
    steps.push({ desc: `跨越边: ${bestEdge.from}-${bestEdge.to}(${bestEdge.w})，最小!`, graphNodes: nodes, graphEdges: edges.map(e => ({ ...e, status: edgeStatuses.get(ek(e.from, e.to)) || 'none' })), mstTotal: total })

    edgeStatuses.set(ek(bestEdge.from, bestEdge.to), 'selected')
    inMST.add(bestEdge.to)
    total += bestEdge.w
    steps.push({ desc: `加入 ${bestEdge.from}-${bestEdge.to}(${bestEdge.w})，已选集合: {${[...inMST]}}，总权 ${total}`, graphNodes: nodes, graphEdges: edges.map(e => ({ ...e, status: edgeStatuses.get(ek(e.from, e.to)) || 'none' })), mstTotal: total })
  }
  steps.push({ desc: `MST 完成! 总权值 = ${total}`, graphNodes: nodes, graphEdges: edges.map(e => ({ ...e, status: edgeStatuses.get(ek(e.from, e.to)) || 'none' })), mstTotal: total })
  return steps
}

// ==================== Kruskal 步骤 ====================

function buildKruskalSteps(nodes: GraphNode[], edges: GraphEdge[]): GreedyStep[] {
  const steps: GreedyStep[] = []
  const sorted = [...edges].sort((a, b) => a.weight - b.weight)
  const parent = new Map<string, string>()
  for (const n of nodes) parent.set(n.id, n.id)
  function find(x: string): string { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x)!)!); x = parent.get(x)! } return x }
  function unite(a: string, b: string) { parent.set(find(a), find(b)) }

  const edgeStatuses = new Map<string, 'none' | 'selected' | 'rejected' | 'current'>()
  const ek = (a: string, b: string) => a < b ? `${a}-${b}` : `${b}-${a}`
  let total = 0, count = 0

  steps.push({ desc: `边按权值排序: ${sorted.map(e => `${e.from}-${e.to}(${e.weight})`).join(', ')}`, graphNodes: nodes, graphEdges: edges.map(e => ({ ...e, status: 'none' })), mstTotal: 0 })

  for (const e of sorted) {
    if (count >= nodes.length - 1) break
    edgeStatuses.set(ek(e.from, e.to), 'current')
    steps.push({ desc: `检查 ${e.from}-${e.to}(${e.weight})`, graphNodes: nodes, graphEdges: edges.map(ed => ({ ...ed, status: edgeStatuses.get(ek(ed.from, ed.to)) || 'none' })), mstTotal: total })

    if (find(e.from) !== find(e.to)) {
      unite(e.from, e.to)
      edgeStatuses.set(ek(e.from, e.to), 'selected')
      total += e.weight
      count++
      steps.push({ desc: `加入! ${e.from}-${e.to}(${e.weight})，不成环，总权 ${total}`, graphNodes: nodes, graphEdges: edges.map(ed => ({ ...ed, status: edgeStatuses.get(ek(ed.from, ed.to)) || 'none' })), mstTotal: total })
    } else {
      edgeStatuses.set(ek(e.from, e.to), 'rejected')
      steps.push({ desc: `跳过 ${e.from}-${e.to}(${e.weight})，会成环!`, graphNodes: nodes, graphEdges: edges.map(ed => ({ ...ed, status: edgeStatuses.get(ek(ed.from, ed.to)) || 'none' })), mstTotal: total })
    }
  }
  steps.push({ desc: `MST 完成! 总权值 = ${total}`, graphNodes: nodes, graphEdges: edges.map(e => ({ ...e, status: edgeStatuses.get(ek(e.from, e.to)) || 'none' })), mstTotal: total })
  return steps
}

// ==================== 分派 ====================

function buildSteps(config: GreedyAnimationConfig): GreedyStep[] {
  switch (config.algorithm) {
    case 'activity-selection':    return buildActivitySteps(config.activities!)
    case 'fractional-knapsack':   return buildFractionalSteps(config.items!, config.capacity!)
    case 'huffman':               return buildHuffmanSteps(config.frequencies!)
    case 'prim':                  return buildPrimSteps(config.nodes!, config.edges!)
    case 'kruskal':               return buildKruskalSteps(config.nodes!, config.edges!)
  }
}

// ==================== 播放器 ====================

function usePlayer(total: number) {
  const [step, setStep] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clear = useCallback(() => { if (timer.current) { clearTimeout(timer.current); timer.current = null } }, [])
  useEffect(() => {
    if (!playing) { clear(); return }
    if (step >= total - 1) { setPlaying(false); return }
    timer.current = setTimeout(() => setStep(s => s + 1), speed)
    return clear
  }, [playing, step, total, speed, clear])
  return {
    step, playing, speed, setSpeed,
    reset: useCallback(() => { clear(); setPlaying(false); setStep(-1) }, [clear]),
    playPause: useCallback(() => { if (step >= total - 1) { setStep(-1); setPlaying(true) } else setPlaying(p => !p) }, [step, total]),
    next: useCallback(() => { setPlaying(false); setStep(s => Math.min(s + 1, total - 1)) }, [total]),
    prev: useCallback(() => { setPlaying(false); setStep(s => Math.max(s - 1, -1)) }, []),
  }
}

// ==================== 活动选择时间轴视图 ====================

function ActivityView({ activities }: { activities: GreedyStep['activities'] }) {
  if (!activities) return null
  const maxEnd = Math.max(...activities.map(a => a.end))
  const colors = { pending: 'bg-gray-700 border-gray-600', selected: 'bg-emerald-500/30 border-emerald-500', rejected: 'bg-gray-800/50 border-gray-700 opacity-40', current: 'bg-amber-400/30 border-amber-400' }
  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 space-y-1">
      <div className="text-xs text-gray-500 mb-1">时间轴（横轴=时间）</div>
      {activities.map((a, i) => (
        <div key={i} className="flex items-center gap-2 h-6">
          <span className="w-6 text-[10px] font-mono text-gray-400 text-right">{a.name}</span>
          <div className="flex-1 relative h-full">
            <div
              className={`absolute h-full rounded border ${colors[a.status]} flex items-center justify-center text-[9px] font-mono text-gray-300`}
              style={{ left: `${(a.start / maxEnd) * 100}%`, width: `${((a.end - a.start) / maxEnd) * 100}%` }}
            >
              {a.start}-{a.end}
            </div>
          </div>
        </div>
      ))}
      <div className="flex justify-between text-[8px] text-gray-600 font-mono mt-1">
        {Array.from({ length: maxEnd + 1 }, (_, i) => <span key={i}>{i}</span>)}
      </div>
    </div>
  )
}

// ==================== 分数背包视图 ====================

function KnapsackView({ state }: { state: GreedyStep['knapsackState'] }) {
  if (!state) return null
  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 space-y-2">
      <div className="flex gap-2 text-xs text-gray-400">
        <span>剩余容量: <span className="text-sky-400 font-bold">{state.remaining}</span></span>
        <span>总价值: <span className="text-emerald-400 font-bold">{state.total}</span></span>
      </div>
      <div className="flex gap-1.5">
        {state.items.map((it, i) => {
          const pct = it.taken * 100
          return (
            <div key={i} className={`flex-1 rounded border p-2 text-[10px] font-mono ${
              it.taken === 1 ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
              : it.taken > 0 ? 'border-amber-500 bg-amber-500/10 text-amber-300'
              : 'border-gray-700 bg-gray-800 text-gray-400'
            }`}>
              <div>w={it.w} v={it.v}</div>
              <div>比={it.ratio}</div>
              <div className="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-[8px] mt-0.5">{pct > 0 ? `取${pct.toFixed(0)}%` : '未取'}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== Huffman 队列 + 树视图 ====================

function HuffmanView({ nodes, treeRoot }: { nodes: GreedyStep['huffNodes']; treeRoot?: HuffTreeNode }) {
  if (!nodes) return null
  return (
    <div className="space-y-3">
      {/* 优先队列 */}
      <div className="bg-gray-950 rounded-lg border border-gray-800 p-3">
        <div className="text-xs text-gray-500 mb-1.5">优先队列（按频率排序）</div>
        <div className="flex gap-1 flex-wrap">
          {[...nodes].sort((a, b) => a.freq - b.freq).map((n, i) => (
            <div key={i} className={`px-2 py-1.5 rounded border text-xs font-mono ${
              n.merged ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-gray-600 bg-gray-800 text-gray-300'
            }`}>
              <div className="font-bold">{n.label}</div>
              <div className="text-[10px] opacity-70">{n.freq}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 完整的 Huffman 编码树 */}
      {treeRoot && <HuffmanTreeSVG root={treeRoot} />}
    </div>
  )
}

function HuffmanTreeSVG({ root }: { root: HuffTreeNode }) {
  // 计算树的布局
  type Pos = { x: number; y: number; node: HuffTreeNode; code: string }
  const positions: Pos[] = []
  const connections: { x1: number; y1: number; x2: number; y2: number; label: string }[] = []

  function getDepth(n: HuffTreeNode): number {
    if (!n.left && !n.right) return 0
    return 1 + Math.max(n.left ? getDepth(n.left) : 0, n.right ? getDepth(n.right) : 0)
  }
  const depth = getDepth(root)
  const W = Math.max(500, (2 ** depth) * 50)
  const H = (depth + 1) * 65 + 40
  const R = 18

  function layout(node: HuffTreeNode, x: number, y: number, spread: number, code: string) {
    positions.push({ x, y, node, code })
    if (node.left) {
      const cx = x - spread, cy = y + 60
      connections.push({ x1: x, y1: y + R, x2: cx, y2: cy - R, label: '0' })
      layout(node.left, cx, cy, spread / 2, code + '0')
    }
    if (node.right) {
      const cx = x + spread, cy = y + 60
      connections.push({ x1: x, y1: y + R, x2: cx, y2: cy - R, label: '1' })
      layout(node.right, cx, cy, spread / 2, code + '1')
    }
  }
  layout(root, W / 2, 30, W / 4.5, '')

  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 overflow-x-auto">
      <div className="text-xs text-gray-500 mb-2">Huffman 编码树（左=0，右=1）</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block mx-auto w-full h-auto max-w-[500px]">
        {/* 连线 + 0/1 标签 */}
        {connections.map((c, i) => {
          const mx = (c.x1 + c.x2) / 2, my = (c.y1 + c.y2) / 2
          return (
            <g key={i}>
              <line x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} className="stroke-gray-600" strokeWidth={1.5} />
              <text x={mx + (c.label === '0' ? -8 : 8)} y={my} textAnchor="middle" className="fill-sky-400 text-[10px] font-bold font-mono">{c.label}</text>
            </g>
          )
        })}
        {/* 节点 */}
        {positions.map(({ x, y, node, code }, i) => {
          const isLeaf = !node.left && !node.right
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={R}
                className={isLeaf ? 'stroke-emerald-500 fill-emerald-500/15' : 'stroke-gray-500 fill-gray-800'}
                strokeWidth={2} />
              <text x={x} y={y - 2} textAnchor="middle" className={`text-[10px] font-bold font-mono ${isLeaf ? 'fill-emerald-300' : 'fill-gray-400'}`}>
                {isLeaf ? node.label : ''}
              </text>
              <text x={x} y={y + 9} textAnchor="middle" className="fill-gray-500 text-[8px] font-mono">{node.freq}</text>
              {/* 叶子节点下方标编码 */}
              {isLeaf && (
                <text x={x} y={y + R + 14} textAnchor="middle" className="fill-violet-400 text-[9px] font-mono font-bold">{code}</text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ==================== MST 图视图 ====================

function MSTGraphView({ nodes, edges, mstTotal }: { nodes: GraphNode[]; edges: { from: string; to: string; weight: number; status: string }[]; mstTotal?: number }) {
  const W = 580, H = 220, R = 18
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 space-y-2">
      {mstTotal !== undefined && <div className="text-xs text-gray-400">MST 总权值: <span className="text-emerald-400 font-bold">{mstTotal}</span></div>}
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto max-w-[580px]">
        {/* 边（无向，画一次） */}
        {edges.map((e, i) => {
          const a = nodeMap.get(e.from)!, b = nodeMap.get(e.to)!
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy)
          const ux = dx / len, uy = dy / len
          const color = e.status === 'selected' ? 'stroke-emerald-500' : e.status === 'current' ? 'stroke-amber-400' : e.status === 'rejected' ? 'stroke-rose-400/40' : 'stroke-gray-700'
          const width = e.status === 'selected' ? 3 : e.status === 'current' ? 2.5 : 1.5
          return (
            <g key={i}>
              <line x1={a.x + ux * R} y1={a.y + uy * R} x2={b.x - ux * R} y2={b.y - uy * R} className={color} strokeWidth={width} />
              <text x={mx + uy * 10} y={my - ux * 10} textAnchor="middle" className={`text-[10px] font-bold font-mono ${e.status === 'selected' ? 'fill-emerald-300' : e.status === 'current' ? 'fill-amber-300' : 'fill-gray-500'}`}>{e.weight}</text>
            </g>
          )
        })}
        {nodes.map(n => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={R} className="stroke-slate-500 fill-slate-800" strokeWidth={2} />
            <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="central" className="text-sm font-bold font-mono fill-gray-300">{n.id}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// ==================== 主组件 ====================

export default function GreedyAnimation({ config }: { config: GreedyAnimationConfig }) {
  const steps = useRef(buildSteps(config)).current
  const player = usePlayer(steps.length)
  const cur = player.step >= 0 ? steps[player.step] : null

  return (
    <div className="space-y-3">
      {/* 活动选择时间轴 */}
      {config.algorithm === 'activity-selection' && cur?.activities && <ActivityView activities={cur.activities} />}

      {/* 分数背包 */}
      {config.algorithm === 'fractional-knapsack' && cur?.knapsackState && <KnapsackView state={cur.knapsackState} />}

      {/* Huffman */}
      {config.algorithm === 'huffman' && cur?.huffNodes && <HuffmanView nodes={cur.huffNodes} treeRoot={cur.huffTreeRoot} />}

      {/* Prim/Kruskal 图 */}
      {(config.algorithm === 'prim' || config.algorithm === 'kruskal') && cur?.graphNodes && cur?.graphEdges && (
        <MSTGraphView nodes={cur.graphNodes} edges={cur.graphEdges} mstTotal={cur.mstTotal} />
      )}

      {/* 图例 */}
      <div className="flex gap-3 text-[10px] text-gray-500 flex-wrap">
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500 mr-0.5 align-middle" /> 选中</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400/40 border border-amber-400 mr-0.5 align-middle" /> 当前检查</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-gray-700 mr-0.5 align-middle opacity-40" /> 跳过/未选</span>
      </div>

      {/* 步骤说明 */}
      {cur && (
        <motion.div key={player.step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="text-sm bg-gray-800 rounded px-4 py-2 text-gray-200"
        >{cur.desc}</motion.div>
      )}

      {/* 控制条 */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={player.prev} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300">上一步</button>
        <button onClick={player.playPause} className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded text-white font-medium min-w-16">{player.playing ? '暂停' : '播放'}</button>
        <button onClick={player.next} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300">下一步</button>
        <button onClick={player.reset} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300">重置</button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-gray-500">速度:</label>
          <input type="range" min={200} max={2000} step={100} value={2200 - player.speed} onChange={e => player.setSpeed(2200 - Number(e.target.value))} className="w-20 accent-indigo-500" />
        </div>
        <span className="text-xs text-gray-500">{player.step + 1} / {steps.length}</span>
      </div>
    </div>
  )
}
