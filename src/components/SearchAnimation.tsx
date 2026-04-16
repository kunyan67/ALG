import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { SearchAnimationConfig } from '../data/algorithms'

// ==================== 步骤类型 ====================

type HlType = 'current' | 'found' | 'eliminated' | 'left' | 'right' | 'range'

interface SearchStep {
  array: number[]
  highlights: Map<number, HlType>
  desc: string
  pointers?: { left?: number; right?: number; mid?: number }
  // 哈希专用
  hashTable?: number[][]
  hashHighlight?: { slot: number; chainIdx?: number; type: 'insert' | 'probe' | 'found' | 'conflict' }
  phase?: string
}

function mkHl(entries: [number, HlType][]): Map<number, HlType> { return new Map(entries) }

// ==================== 顺序查找 ====================

function buildSequentialSteps(data: number[], target: number): SearchStep[] {
  const arr = [...data], steps: SearchStep[] = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      steps.push({ array: arr, highlights: mkHl([[i, 'found']]), desc: `[${i}] ${arr[i]} == ${target}，找到!` })
      return steps
    }
    const h = new Map<number, HlType>()
    for (let j = 0; j < i; j++) h.set(j, 'eliminated')
    h.set(i, 'current')
    steps.push({ array: arr, highlights: h, desc: `[${i}] ${arr[i]} ≠ ${target}` })
  }
  const h = new Map<number, HlType>(); arr.forEach((_, i) => h.set(i, 'eliminated'))
  steps.push({ array: arr, highlights: h, desc: `遍历完毕，未找到 ${target}` })
  return steps
}

// ==================== 二分查找 ====================

function buildBinarySteps(data: number[], target: number): SearchStep[] {
  const arr = [...data], steps: SearchStep[] = []
  let left = 0, right = arr.length - 1, round = 0
  while (left <= right) {
    round++
    const mid = left + Math.floor((right - left) / 2)
    const h = new Map<number, HlType>()
    for (let i = 0; i < left; i++) h.set(i, 'eliminated')
    for (let i = right + 1; i < arr.length; i++) h.set(i, 'eliminated')
    for (let i = left; i <= right; i++) h.set(i, 'range')
    h.set(left, 'left'); h.set(right, 'right'); h.set(mid, 'current')
    steps.push({ array: arr, highlights: h, pointers: { left, right, mid }, desc: `第${round}轮: [${left}..${right}] 共${right - left + 1}个元素，mid=${mid}，arr[mid]=${arr[mid]}` })

    if (arr[mid] === target) {
      h.set(mid, 'found')
      steps.push({ array: arr, highlights: new Map(h), pointers: { left, right, mid }, desc: `${arr[mid]} == ${target}，找到! 共比较 ${round} 次` })
      return steps
    } else if (arr[mid] < target) {
      steps.push({ array: arr, highlights: h, pointers: { left, right, mid }, desc: `${arr[mid]} < ${target} → 排除左半，区间缩小到 [${mid + 1}..${right}]` })
      left = mid + 1
    } else {
      steps.push({ array: arr, highlights: h, pointers: { left, right, mid }, desc: `${arr[mid]} > ${target} → 排除右半，区间缩小到 [${left}..${mid - 1}]` })
      right = mid - 1
    }
  }
  const h = new Map<number, HlType>(); arr.forEach((_, i) => h.set(i, 'eliminated'))
  steps.push({ array: arr, highlights: h, desc: `区间为空，未找到 ${target}` })
  return steps
}

// ==================== 插值查找 ====================

function buildInterpolationSteps(data: number[], target: number): SearchStep[] {
  const arr = [...data], steps: SearchStep[] = []
  let left = 0, right = arr.length - 1, round = 0
  while (left <= right && target >= arr[left] && target <= arr[right]) {
    round++
    const ratio = (target - arr[left]) / (arr[right] - arr[left])
    const mid = left + Math.floor(ratio * (right - left))
    const h = new Map<number, HlType>()
    for (let i = 0; i < left; i++) h.set(i, 'eliminated')
    for (let i = right + 1; i < arr.length; i++) h.set(i, 'eliminated')
    for (let i = left; i <= right; i++) h.set(i, 'range')
    h.set(left, 'left'); h.set(right, 'right'); h.set(mid, 'current')
    steps.push({ array: arr, highlights: h, pointers: { left, right, mid }, desc: `第${round}轮: 插值比例 (${target}-${arr[left]})/(${arr[right]}-${arr[left]}) = ${(ratio * 100).toFixed(1)}%，mid=${mid}，arr[mid]=${arr[mid]}` })

    if (arr[mid] === target) {
      h.set(mid, 'found')
      steps.push({ array: arr, highlights: new Map(h), desc: `${arr[mid]} == ${target}，找到! 仅 ${round} 次` })
      return steps
    } else if (arr[mid] < target) {
      steps.push({ array: arr, highlights: h, desc: `${arr[mid]} < ${target} → 右移，[${mid + 1}..${right}]` })
      left = mid + 1
    } else {
      steps.push({ array: arr, highlights: h, desc: `${arr[mid]} > ${target} → 左移，[${left}..${mid - 1}]` })
      right = mid - 1
    }
  }
  const h = new Map<number, HlType>(); arr.forEach((_, i) => h.set(i, 'eliminated'))
  steps.push({ array: arr, highlights: h, desc: `未找到 ${target}` })
  return steps
}

// ==================== 斐波那契查找 ====================

function buildFibonacciSteps(data: number[], target: number): SearchStep[] {
  const arr = [...data], n = arr.length, steps: SearchStep[] = []
  const fib = [0, 1]
  while (fib[fib.length - 1] < n) fib.push(fib.at(-1)! + fib.at(-2)!)
  let k = fib.length - 1
  const tmp = [...arr]
  while (tmp.length < fib[k]) tmp.push(arr[n - 1])
  let left = 0, right = n - 1, round = 0

  steps.push({ array: arr, highlights: new Map(), desc: `Fib 数列: [${fib.slice(0, k + 1)}]，F(${k})=${fib[k]} >= n=${n}，按黄金比例分割` })

  while (left <= right && k >= 1) {
    round++
    const mid = Math.min(left + fib[k - 1] - 1, n - 1)
    const h = new Map<number, HlType>()
    for (let i = 0; i < left; i++) h.set(i, 'eliminated')
    for (let i = right + 1; i < n; i++) h.set(i, 'eliminated')
    for (let i = left; i <= right; i++) h.set(i, 'range')
    h.set(left, 'left'); h.set(right, 'right'); h.set(mid, 'current')
    steps.push({ array: arr, highlights: h, pointers: { left, right, mid }, desc: `第${round}轮: F(${k - 1})=${fib[k - 1]}，分割点 mid=${mid}，arr[${mid}]=${arr[mid]}` })

    if (target < tmp[mid]) {
      steps.push({ array: arr, highlights: h, desc: `${target} < ${tmp[mid]} → 左区间 [${left}..${mid - 1}]，k=${k - 1}` })
      right = mid - 1; k -= 1
    } else if (target > tmp[mid]) {
      steps.push({ array: arr, highlights: h, desc: `${target} > ${tmp[mid]} → 右区间 [${mid + 1}..${right}]，k=${k - 2}` })
      left = mid + 1; k -= 2
    } else {
      h.set(mid, 'found')
      steps.push({ array: arr, highlights: new Map(h), desc: `arr[${mid}]=${arr[mid]} == ${target}，找到! 共 ${round} 次` })
      return steps
    }
  }
  const h = new Map<number, HlType>(); arr.forEach((_, i) => h.set(i, 'eliminated'))
  steps.push({ array: arr, highlights: h, desc: `未找到 ${target}` })
  return steps
}

// ==================== 哈希查找（建表 + 查找） ====================

function buildHashSteps(data: number[], target: number): SearchStep[] {
  const TABLE_SIZE = 11, steps: SearchStep[] = []
  const table: number[][] = Array.from({ length: TABLE_SIZE }, () => [])

  steps.push({ array: data, highlights: new Map(), hashTable: table.map(s => [...s]), phase: '建表', desc: `=== 阶段一：建哈希表 === 大小=${TABLE_SIZE}，hash(key) = key % ${TABLE_SIZE}` })

  // 建表过程：逐个插入
  for (let i = 0; i < data.length; i++) {
    const v = data[i]
    const slot = v % TABLE_SIZE
    const hasConflict = table[slot].length > 0

    // 展示计算 hash
    steps.push({
      array: data, highlights: mkHl([[i, 'current']]),
      hashTable: table.map(s => [...s]),
      hashHighlight: { slot, type: 'probe' },
      phase: '建表',
      desc: `插入 ${v}: hash(${v}) = ${v} % ${TABLE_SIZE} = ${slot}${hasConflict ? `，槽位 ${slot} 已有 [${table[slot]}]，冲突!` : `，槽位 ${slot} 空闲`}`,
    })

    if (hasConflict) {
      // 展示冲突
      steps.push({
        array: data, highlights: mkHl([[i, 'current']]),
        hashTable: table.map(s => [...s]),
        hashHighlight: { slot, type: 'conflict' },
        phase: '建表',
        desc: `冲突处理: ${v} 追加到槽位 ${slot} 的链表尾部 → [${[...table[slot], v]}]`,
      })
    }

    table[slot].push(v)

    steps.push({
      array: data, highlights: mkHl([[i, 'found']]),
      hashTable: table.map(s => [...s]),
      hashHighlight: { slot, chainIdx: table[slot].length - 1, type: 'insert' },
      phase: '建表',
      desc: `${v} 已插入槽位 ${slot}，当前链: [${table[slot]}]`,
    })
  }

  steps.push({ array: data, highlights: new Map(), hashTable: table.map(s => [...s]), phase: '建表完成', desc: `哈希表建成! ${data.length} 个元素，${TABLE_SIZE} 个槽位，装载因子 α=${(data.length / TABLE_SIZE).toFixed(2)}` })

  // 查找过程
  const targetSlot = target % TABLE_SIZE
  steps.push({ array: data, highlights: new Map(), hashTable: table.map(s => [...s]), hashHighlight: { slot: targetSlot, type: 'probe' }, phase: '查找', desc: `=== 阶段二：查找 ${target} === hash(${target}) = ${target} % ${TABLE_SIZE} = ${targetSlot}` })

  const chain = table[targetSlot]
  if (chain.length === 0) {
    steps.push({ array: data, highlights: new Map(), hashTable: table.map(s => [...s]), hashHighlight: { slot: targetSlot, type: 'probe' }, phase: '查找', desc: `槽位 ${targetSlot} 为空，未找到 ${target}` })
  } else {
    for (let i = 0; i < chain.length; i++) {
      if (chain[i] === target) {
        steps.push({ array: data, highlights: new Map(), hashTable: table.map(s => [...s]), hashHighlight: { slot: targetSlot, chainIdx: i, type: 'found' }, phase: '查找', desc: `槽位 ${targetSlot} 链表[${i}] = ${chain[i]} == ${target}，找到!` })
        return steps
      }
      steps.push({ array: data, highlights: new Map(), hashTable: table.map(s => [...s]), hashHighlight: { slot: targetSlot, chainIdx: i, type: 'probe' }, phase: '查找', desc: `槽位 ${targetSlot} 链表[${i}] = ${chain[i]} ≠ ${target}，继续` })
    }
    steps.push({ array: data, highlights: new Map(), hashTable: table.map(s => [...s]), hashHighlight: { slot: targetSlot, type: 'probe' }, phase: '查找', desc: `槽位 ${targetSlot} 链表遍历完，未找到 ${target}` })
  }
  return steps
}

// ==================== 构建分派 ====================

function buildSteps(config: SearchAnimationConfig): SearchStep[] {
  switch (config.algorithm) {
    case 'sequential':    return buildSequentialSteps(config.data, config.target)
    case 'binary':        return buildBinarySteps(config.data, config.target)
    case 'interpolation': return buildInterpolationSteps(config.data, config.target)
    case 'fibonacci':     return buildFibonacciSteps(config.data, config.target)
    case 'hash':          return buildHashSteps(config.data, config.target)
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

// ==================== 颜色 ====================

const CELL: Record<string, string> = {
  current: 'bg-amber-400 text-gray-900 border-amber-500 font-bold',
  found: 'bg-emerald-500 text-white border-emerald-600 font-bold',
  eliminated: 'bg-gray-800/40 text-gray-700 border-gray-800',
  left: 'bg-blue-500/25 text-blue-300 border-blue-500',
  right: 'bg-orange-500/25 text-orange-300 border-orange-500',
  range: 'bg-gray-700/60 text-gray-300 border-gray-600',
}

// ==================== 数组格子视图（适配 20+ 元素） ====================

function ArrayView({ array, highlights, pointers, target }: {
  array: number[]; highlights: Map<number, HlType>; pointers?: SearchStep['pointers']; target: number
}) {
  const isLarge = array.length > 14
  const cellW = isLarge ? 'w-9' : 'w-12'
  const cellH = isLarge ? 'h-11' : 'h-14'
  const textSize = isLarge ? 'text-[10px]' : 'text-sm'

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">
        查找目标: <span className="text-amber-400 font-bold text-sm">{target}</span>
        <span className="ml-3">数组长度: {array.length}</span>
      </div>
      <div className="flex gap-px flex-wrap">
        {array.map((val, idx) => {
          const h = highlights.get(idx)
          const cls = h ? CELL[h] : 'bg-gray-800 text-gray-400 border-gray-700'
          // 指针标记
          let ptr = ''
          if (pointers?.mid === idx) ptr = 'mid'
          else if (pointers?.left === idx) ptr = 'L'
          else if (pointers?.right === idx) ptr = 'R'

          return (
            <motion.div
              key={idx}
              animate={{ scale: h === 'current' || h === 'found' ? 1.08 : 1 }}
              transition={{ duration: 0.15 }}
              className={`${cellW} ${cellH} flex flex-col items-center justify-center border rounded font-mono ${textSize} ${cls} relative`}
            >
              <span className="font-bold">{val}</span>
              <span className="text-[7px] opacity-50">{idx}</span>
              {ptr && (
                <span className={`absolute -top-4 text-[9px] font-bold ${
                  ptr === 'mid' ? 'text-amber-400' : ptr === 'L' ? 'text-blue-400' : 'text-orange-400'
                }`}>{ptr}</span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== 哈希表视图（展示建表和查找过程） ====================

function HashTableView({ table, highlight, phase }: {
  table: number[][];
  highlight?: SearchStep['hashHighlight'];
  phase?: string;
}) {
  const TABLE_SIZE = table.length
  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 space-y-1.5">
      <div className="flex items-center gap-3 text-xs">
        <span className="text-gray-400 font-medium">哈希表 (size={TABLE_SIZE})</span>
        {phase && <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
          phase === '建表' ? 'bg-blue-500/20 text-blue-400' : phase === '查找' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
        }`}>{phase}</span>}
      </div>
      {table.map((chain, slotIdx) => {
        const isTargetSlot = highlight?.slot === slotIdx
        const slotBg = isTargetSlot
          ? highlight.type === 'conflict' ? 'bg-rose-500/10 border border-rose-500/30'
            : highlight.type === 'found' ? 'bg-emerald-500/10 border border-emerald-500/30'
            : 'bg-violet-500/10 border border-violet-500/30'
          : ''

        return (
          <div key={slotIdx} className={`flex items-center gap-1.5 px-2 py-1 rounded ${slotBg}`}>
            <span className={`text-[10px] font-mono w-7 shrink-0 text-right ${isTargetSlot ? 'text-violet-400 font-bold' : 'text-gray-600'}`}>[{slotIdx}]</span>
            <div className="w-px h-5 bg-gray-700" />
            {chain.length > 0 ? (
              <div className="flex gap-0.5 items-center flex-wrap">
                {chain.map((v, ci) => {
                  const isHighlighted = isTargetSlot && highlight.chainIdx === ci
                  let nodeCls = 'border-gray-600 bg-gray-800 text-gray-300'
                  if (isHighlighted) {
                    if (highlight.type === 'found') nodeCls = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400'
                    else if (highlight.type === 'insert') nodeCls = 'border-sky-500 bg-sky-500/20 text-sky-200 ring-1 ring-sky-400'
                    else if (highlight.type === 'probe') nodeCls = 'border-amber-500 bg-amber-500/20 text-amber-200 ring-1 ring-amber-400'
                  }
                  return (
                    <div key={ci} className="flex items-center gap-0.5">
                      {ci > 0 && <span className="text-gray-600 text-[10px]">→</span>}
                      <motion.span
                        animate={{ scale: isHighlighted ? 1.15 : 1 }}
                        className={`w-8 h-7 flex items-center justify-center text-xs font-mono font-bold rounded border ${nodeCls}`}
                      >{v}</motion.span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <span className="text-[10px] text-gray-700 italic">空</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ==================== 主组件 ====================

export default function SearchAnimation({ config }: { config: SearchAnimationConfig }) {
  const steps = useRef(buildSteps(config)).current
  const player = usePlayer(steps.length)
  const cur = player.step >= 0 ? steps[player.step] : null
  const highlights = cur?.highlights ?? new Map()
  const isHash = config.algorithm === 'hash'

  return (
    <div className="space-y-3">
      {/* 数组格子视图（非哈希）*/}
      {!isHash && (
        <ArrayView array={cur?.array ?? config.data} highlights={highlights} pointers={cur?.pointers} target={config.target} />
      )}

      {/* 哈希表视图 */}
      {isHash && cur?.hashTable && (
        <HashTableView table={cur.hashTable} highlight={cur.hashHighlight} phase={cur.phase} />
      )}

      {/* 图例 */}
      <div className="flex gap-3 text-[10px] text-gray-500 flex-wrap">
        {!isHash ? <>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400 mr-0.5 align-middle" /> 当前检查</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500 mr-0.5 align-middle" /> 找到</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500/50 mr-0.5 align-middle" /> L(左)</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-orange-500/50 mr-0.5 align-middle" /> R(右)</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-gray-700 mr-0.5 align-middle opacity-40" /> 已排除</span>
        </> : <>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-violet-500/50 mr-0.5 align-middle" /> 目标槽位</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-sky-500/50 mr-0.5 align-middle" /> 刚插入</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500/50 mr-0.5 align-middle" /> 冲突</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500/50 mr-0.5 align-middle" /> 探查中</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500 mr-0.5 align-middle" /> 找到</span>
        </>}
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
          <input type="range" min={100} max={1500} step={100} value={1600 - player.speed} onChange={e => player.setSpeed(1600 - Number(e.target.value))} className="w-20 accent-indigo-500" />
        </div>
        <span className="text-xs text-gray-500">{player.step + 1} / {steps.length}</span>
      </div>
    </div>
  )
}
