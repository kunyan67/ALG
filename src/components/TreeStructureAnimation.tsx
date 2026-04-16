import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { TreeAnimationConfig, TreeSnapshot } from '../data/algorithms'

function edgeKey(from: string, to: string) {
  return `${from}->${to}`
}

function usePlayer(total: number) {
  const [step, setStep] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
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
    reset: useCallback(() => { clear(); setPlaying(false); setStep(-1) }, [clear]),
    playPause: useCallback(() => {
      if (step >= total - 1) { setStep(-1); setPlaying(true) } else setPlaying((p) => !p)
    }, [step, total]),
    next: useCallback(() => { setPlaying(false); setStep((s) => Math.min(s + 1, total - 1)) }, [total]),
    prev: useCallback(() => { setPlaying(false); setStep((s) => Math.max(s - 1, -1)) }, []),
  }
}

function nodeClasses(color?: string, highlighted?: boolean) {
  if (highlighted) return 'stroke-amber-400 fill-amber-400/15'
  switch (color) {
    case 'red':
      return 'stroke-rose-400 fill-rose-500/20'
    case 'black':
      return 'stroke-gray-300 fill-gray-800'
    case 'blue':
      return 'stroke-sky-400 fill-sky-500/15'
    case 'green':
      return 'stroke-emerald-400 fill-emerald-500/15'
    default:
      return 'stroke-slate-500 fill-slate-800'
  }
}

function SnapshotView({ snapshot }: { snapshot: TreeSnapshot }) {
  const highlightNodeIds = new Set(snapshot.highlightNodeIds ?? [])
  const highlightEdgeKeys = new Set(snapshot.highlightEdgeKeys ?? [])
  const nodeMap = new Map(snapshot.nodes.map((n) => [n.id, n]))
  const width = 560
  const height = 300

  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="block w-full h-auto max-w-[560px]">
        <defs>
          <marker id="tree-arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
            <polygon points="0 0, 10 3.5, 0 7" className="fill-gray-600" />
          </marker>
          <marker id="leaf-arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
            <polygon points="0 0, 10 3.5, 0 7" className="fill-sky-400" />
          </marker>
        </defs>

        {snapshot.edges.map((edge) => {
          const from = nodeMap.get(edge.from)!
          const to = nodeMap.get(edge.to)!
          const key = edgeKey(edge.from, edge.to)
          const highlighted = highlightEdgeKeys.has(key)
          return (
            <line
              key={key}
              x1={from.x}
              y1={from.y + 16}
              x2={to.x}
              y2={to.y - 16}
              className={highlighted ? 'stroke-amber-400' : 'stroke-gray-700'}
              strokeWidth={highlighted ? 3 : 2}
            />
          )
        })}

        {snapshot.leafLinks?.map(([fromId, toId]) => {
          const from = nodeMap.get(fromId)!
          const to = nodeMap.get(toId)!
          return (
            <line
              key={`leaf-${fromId}-${toId}`}
              x1={from.x + 48}
              y1={from.y}
              x2={to.x - 48}
              y2={to.y}
              className="stroke-sky-400/80"
              strokeDasharray="6 4"
              strokeWidth={2}
              markerEnd="url(#leaf-arrow)"
            />
          )
        })}

        {snapshot.nodes.map((node) => {
          const highlighted = highlightNodeIds.has(node.id)
          return (
            <g key={node.id}>
              <rect x={node.x - 42} y={node.y - 18} rx={12} ry={12} width={84} height={36} className={nodeClasses(node.color, highlighted)} strokeWidth={2.5} />
              <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="central" className={`text-xs font-bold font-mono ${highlighted ? 'fill-amber-200' : node.color === 'black' ? 'fill-gray-200' : 'fill-gray-100'}`}>
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function NotesView({ snapshot }: { snapshot: TreeSnapshot }) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div className="bg-gray-950 rounded-lg border border-gray-800 p-3">
        <div className="text-xs text-gray-500 mb-1.5">本步要点</div>
        <div className="text-sm text-gray-300 leading-relaxed">{snapshot.desc}</div>
      </div>
      <div className="bg-gray-950 rounded-lg border border-gray-800 p-3">
        <div className="text-xs text-gray-500 mb-1.5">结构说明</div>
        <div className="text-sm text-gray-300 leading-relaxed">{snapshot.sideNote ?? '这一帧没有额外说明。'}</div>
      </div>
    </div>
  )
}

export default function TreeStructureAnimation({ config }: { config: TreeAnimationConfig }) {
  const snapshots = useRef(config.snapshots).current
  const player = usePlayer(snapshots.length)
  const cur = player.step >= 0 ? snapshots[player.step] : snapshots[0]

  return (
    <div className="space-y-3">
      <div className="bg-gray-950 rounded-lg border border-gray-800 px-4 py-3">
        <div className="text-xs text-gray-500">当前阶段</div>
        <div className="text-lg font-semibold text-white mt-1">{cur.title}</div>
      </div>

      <SnapshotView snapshot={cur} />
      <NotesView snapshot={cur} />

      {cur.table && (
        <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 overflow-x-auto">
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                {cur.table.headers.map((header) => (
                  <th key={header} className="px-4 py-2 text-left text-xs font-semibold text-gray-300 bg-gray-800 border border-gray-700">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cur.table.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={`${ri}-${ci}`} className="px-4 py-2 text-sm text-gray-400 border border-gray-700 font-mono">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <motion.div key={player.step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm bg-gray-800 rounded px-4 py-2 text-gray-200">
        {cur.desc}
      </motion.div>

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={player.prev} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300">上一步</button>
        <button onClick={player.playPause} className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded text-white font-medium min-w-16">{player.playing ? '暂停' : '播放'}</button>
        <button onClick={player.next} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300">下一步</button>
        <button onClick={player.reset} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300">重置</button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-gray-500">速度:</label>
          <input type="range" min={200} max={2400} step={100} value={2600 - player.speed} onChange={(e) => player.setSpeed(2600 - Number(e.target.value))} className="w-20 accent-indigo-500" />
        </div>
        <span className="text-xs text-gray-500">{player.step >= 0 ? player.step + 1 : 1} / {snapshots.length}</span>
      </div>
    </div>
  )
}
