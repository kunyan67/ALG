import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { SortAnimationConfig } from '../data/algorithms'

// ==================== 步骤类型 ====================

type HlType = 'compare' | 'swap' | 'sorted' | 'pivot' | 'active' | 'left' | 'right'

interface SortStep {
  array: number[]
  highlights: Map<number, HlType>
  desc: string
  heapSize?: number
  shellGap?: number
  shellGroups?: number[][]
  mergeBlocks?: { left: number[]; right: number[]; merged: number[]; l: number }
  partitionBlocks?: { leftArr: number[]; pivotVal: number; rightArr: number[] }
  // 计数排序：计数数组
  countArr?: number[]
  // 桶排序：桶内容
  bucketData?: number[][]
  // 基数排序：当前位
  radixExp?: number
}

function mkHl(entries: [number, HlType][]): Map<number, HlType> {
  return new Map(entries)
}

// ==================== 冒泡排序 ====================

function buildBubbleSteps(data: number[]): SortStep[] {
  const arr = [...data], n = arr.length, steps: SortStep[] = []
  const sd = new Set<number>()
  for (let i = 0; i < n - 1; i++) {
    let swapped = false
    for (let j = 0; j < n - 1 - i; j++) {
      const m = new Map<number, HlType>(); sd.forEach(s => m.set(s, 'sorted'))
      m.set(j, 'compare'); m.set(j + 1, 'compare')
      steps.push({ array: [...arr], highlights: m, desc: `比较 ${arr[j]} 和 ${arr[j + 1]}` })
      if (arr[j] > arr[j + 1]) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; swapped = true
        const m2 = new Map<number, HlType>(); sd.forEach(s => m2.set(s, 'sorted'))
        m2.set(j, 'swap'); m2.set(j + 1, 'swap')
        steps.push({ array: [...arr], highlights: m2, desc: `交换 → [${arr[j]}, ${arr[j + 1]}]` })
      }
    }
    sd.add(n - 1 - i)
    if (!swapped) { for (let k = 0; k < n; k++) sd.add(k); break }
  }
  sd.add(0)
  const fm = new Map<number, HlType>(); for (let i = 0; i < n; i++) fm.set(i, 'sorted')
  steps.push({ array: [...arr], highlights: fm, desc: '排序完成' })
  return steps
}

// ==================== 选择排序 ====================

function buildSelectionSteps(data: number[]): SortStep[] {
  const arr = [...data], n = arr.length, steps: SortStep[] = []
  const sd = new Set<number>()
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      const m = new Map<number, HlType>(); sd.forEach(s => m.set(s, 'sorted'))
      m.set(minIdx, 'active'); m.set(j, 'compare')
      steps.push({ array: [...arr], highlights: m, desc: `当前最小 ${arr[minIdx]}，比较 ${arr[j]}` })
      if (arr[j] < arr[minIdx]) minIdx = j
    }
    if (minIdx !== i) {
      ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
      const m = new Map<number, HlType>(); sd.forEach(s => m.set(s, 'sorted'))
      m.set(i, 'swap'); m.set(minIdx, 'swap')
      steps.push({ array: [...arr], highlights: m, desc: `最小值 ${arr[i]} 放到位置 ${i}` })
    }
    sd.add(i)
  }
  sd.add(n - 1)
  const fm = new Map<number, HlType>(); for (let i = 0; i < n; i++) fm.set(i, 'sorted')
  steps.push({ array: [...arr], highlights: fm, desc: '排序完成' })
  return steps
}

// ==================== 插入排序 ====================

function buildInsertionSteps(data: number[]): SortStep[] {
  const arr = [...data], n = arr.length, steps: SortStep[] = []
  for (let i = 1; i < n; i++) {
    const key = arr[i]
    steps.push({ array: [...arr], highlights: mkHl([[i, 'active']]), desc: `抽出 ${key}，在 [0..${i - 1}] 中找位置` })
    let j = i - 1
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j]
      steps.push({ array: [...arr], highlights: mkHl([[j, 'compare'], [j + 1, 'swap']]), desc: `${arr[j]} > ${key}，后移` })
      j--
    }
    arr[j + 1] = key
    steps.push({ array: [...arr], highlights: mkHl([[j + 1, 'active']]), desc: `插入 ${key} 到位置 ${j + 1}` })
  }
  const fm = new Map<number, HlType>(); for (let i = 0; i < n; i++) fm.set(i, 'sorted')
  steps.push({ array: [...arr], highlights: fm, desc: '排序完成' })
  return steps
}

// ==================== 希尔排序 ====================

function buildShellSteps(data: number[]): SortStep[] {
  const arr = [...data], n = arr.length, steps: SortStep[] = []

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    // 构造子序列分组
    const groups: number[][] = []
    for (let g = 0; g < gap; g++) {
      const group: number[] = []
      for (let s = g; s < n; s += gap) group.push(s)
      groups.push(group)
    }
    // 展示当前 gap 的分组
    const groupHl = new Map<number, HlType>()
    groups.forEach((group, gi) => {
      const colors: HlType[] = ['left', 'right', 'active', 'compare', 'pivot']
      group.forEach(idx => groupHl.set(idx, colors[gi % colors.length]))
    })
    steps.push({ array: [...arr], highlights: groupHl, shellGap: gap, shellGroups: groups, desc: `gap=${gap}，分为 ${gap} 组子序列` })

    for (let i = gap; i < n; i++) {
      const key = arr[i]
      let j = i - gap
      const curGroup: number[] = []
      for (let s = i % gap; s < n; s += gap) curGroup.push(s)
      const subHl = new Map<number, HlType>()
      curGroup.forEach(s => subHl.set(s, s === i ? 'active' : 'compare'))
      steps.push({ array: [...arr], highlights: subHl, shellGap: gap, shellGroups: groups, desc: `gap=${gap}: 取 ${key}(位置${i})` })

      while (j >= 0 && arr[j] > key) {
        arr[j + gap] = arr[j]
        steps.push({ array: [...arr], highlights: mkHl([[j, 'compare'], [j + gap, 'swap']]), shellGap: gap, shellGroups: groups, desc: `${arr[j + gap]}→位置${j + gap}` })
        j -= gap
      }
      arr[j + gap] = key
      steps.push({ array: [...arr], highlights: mkHl([[j + gap, 'active']]), shellGap: gap, shellGroups: groups, desc: `${key}→位置${j + gap}` })
    }
  }
  const fm = new Map<number, HlType>(); for (let i = 0; i < n; i++) fm.set(i, 'sorted')
  steps.push({ array: [...arr], highlights: fm, desc: '排序完成' })
  return steps
}

// ==================== 归并排序 ====================

function buildMergeSteps(data: number[]): SortStep[] {
  const arr = [...data], steps: SortStep[] = []

  function ms(l: number, r: number) {
    if (l >= r) return
    const m = l + Math.floor((r - l) / 2)
    const splitHl = new Map<number, HlType>()
    for (let i = l; i <= m; i++) splitHl.set(i, 'left')
    for (let i = m + 1; i <= r; i++) splitHl.set(i, 'right')
    steps.push({ array: [...arr], highlights: splitHl, desc: `拆分 [${l}..${r}] → 左[${l}..${m}] 右[${m + 1}..${r}]` })
    ms(l, m); ms(m + 1, r); merge(l, m, r)
  }

  function merge(l: number, m: number, r: number) {
    const leftArr = arr.slice(l, m + 1), rightArr = arr.slice(m + 1, r + 1)
    const rangeHl = new Map<number, HlType>()
    for (let i = l; i <= m; i++) rangeHl.set(i, 'left')
    for (let i = m + 1; i <= r; i++) rangeHl.set(i, 'right')
    steps.push({ array: [...arr], highlights: rangeHl, mergeBlocks: { left: [...leftArr], right: [...rightArr], merged: [], l }, desc: `合并 [${leftArr}] + [${rightArr}]` })

    let i = 0, j = 0, k = l
    const merged: number[] = []
    while (i < leftArr.length && j < rightArr.length) {
      const pick = leftArr[i] <= rightArr[j]
      const val = pick ? leftArr[i++] : rightArr[j++]
      arr[k] = val; merged.push(val)
      steps.push({ array: [...arr], highlights: mkHl([[k, 'swap']]), mergeBlocks: { left: [...leftArr], right: [...rightArr], merged: [...merged], l }, desc: `取 ${val} 放入` })
      k++
    }
    while (i < leftArr.length) { arr[k] = leftArr[i]; merged.push(leftArr[i]); steps.push({ array: [...arr], highlights: mkHl([[k, 'swap']]), mergeBlocks: { left: [...leftArr], right: [...rightArr], merged: [...merged], l }, desc: `放入剩余 ${leftArr[i]}` }); i++; k++ }
    while (j < rightArr.length) { arr[k] = rightArr[j]; merged.push(rightArr[j]); steps.push({ array: [...arr], highlights: mkHl([[k, 'swap']]), mergeBlocks: { left: [...leftArr], right: [...rightArr], merged: [...merged], l }, desc: `放入剩余 ${rightArr[j]}` }); j++; k++ }

    const doneHl = new Map<number, HlType>()
    for (let x = l; x <= r; x++) doneHl.set(x, 'sorted')
    steps.push({ array: [...arr], highlights: doneHl, mergeBlocks: { left: [...leftArr], right: [...rightArr], merged: [...merged], l }, desc: `合并完成 → [${merged}]` })
  }

  ms(0, arr.length - 1)
  const fm = new Map<number, HlType>(); for (let i = 0; i < arr.length; i++) fm.set(i, 'sorted')
  steps.push({ array: [...arr], highlights: fm, desc: '排序完成' })
  return steps
}

// ==================== 快速排序 ====================

function buildQuickSteps(data: number[]): SortStep[] {
  const arr = [...data], steps: SortStep[] = []
  const sd = new Set<number>()

  function qs(l: number, r: number) {
    if (l >= r) { if (l === r) sd.add(l); return }
    const pivotVal = arr[r]
    const rangeHl = new Map<number, HlType>(); sd.forEach(s => rangeHl.set(s, 'sorted'))
    rangeHl.set(r, 'pivot')
    for (let x = l; x < r; x++) rangeHl.set(x, 'compare')
    steps.push({ array: [...arr], highlights: rangeHl, desc: `选 pivot=${pivotVal}，分区 [${l}..${r}]` })

    let i = l
    for (let j = l; j < r; j++) {
      const m = new Map<number, HlType>(); sd.forEach(s => m.set(s, 'sorted'))
      m.set(r, 'pivot'); m.set(j, 'compare')
      for (let x = l; x < i; x++) m.set(x, 'left')
      steps.push({ array: [...arr], highlights: m, desc: `${arr[j]} ${arr[j] < pivotVal ? '<' : '>='} pivot(${pivotVal})` })
      if (arr[j] < pivotVal) {
        if (i !== j) {
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          const sw = new Map<number, HlType>(); sd.forEach(s => sw.set(s, 'sorted'))
          sw.set(i, 'swap'); sw.set(j, 'swap'); sw.set(r, 'pivot')
          steps.push({ array: [...arr], highlights: sw, desc: `交换 ${arr[i]} ↔ ${arr[j]}` })
        }
        i++
      }
    }
    ;[arr[i], arr[r]] = [arr[r], arr[i]]
    sd.add(i)
    // 分区结果块
    const leftArr = arr.slice(l, i)
    const rightArr = arr.slice(i + 1, r + 1)
    const doneHl = new Map<number, HlType>(); sd.forEach(s => doneHl.set(s, 'sorted'))
    doneHl.set(i, 'active')
    for (let x = l; x < i; x++) if (!sd.has(x)) doneHl.set(x, 'left')
    for (let x = i + 1; x <= r; x++) if (!sd.has(x)) doneHl.set(x, 'right')
    steps.push({ array: [...arr], highlights: doneHl, partitionBlocks: { leftArr, pivotVal, rightArr }, desc: `pivot ${pivotVal} 归位 → 左[${leftArr}] | ${pivotVal} | 右[${rightArr}]` })
    qs(l, i - 1); qs(i + 1, r)
  }

  qs(0, arr.length - 1)
  const fm = new Map<number, HlType>(); for (let i = 0; i < arr.length; i++) fm.set(i, 'sorted')
  steps.push({ array: [...arr], highlights: fm, desc: '排序完成' })
  return steps
}

// ==================== 堆排序 ====================

function buildHeapSteps(data: number[]): SortStep[] {
  const arr = [...data], n = arr.length, steps: SortStep[] = []
  const sd = new Set<number>()

  function heapify(size: number, i: number, phase: string) {
    let largest = i
    const left = 2 * i + 1, right = 2 * i + 2
    if (left < size && arr[left] > arr[largest]) largest = left
    if (right < size && arr[right] > arr[largest]) largest = right
    if (largest !== i) {
      const ch = new Map<number, HlType>(); sd.forEach(s => ch.set(s, 'sorted'))
      ch.set(i, 'compare'); ch.set(largest, 'active')
      steps.push({ array: [...arr], highlights: ch, heapSize: size, desc: `${phase}: ${arr[i]}(节点${i}) < ${arr[largest]}(节点${largest})，下沉` })
      ;[arr[i], arr[largest]] = [arr[largest], arr[i]]
      const sw = new Map<number, HlType>(); sd.forEach(s => sw.set(s, 'sorted'))
      sw.set(i, 'swap'); sw.set(largest, 'swap')
      steps.push({ array: [...arr], highlights: sw, heapSize: size, desc: `${phase}: 交换 ${arr[i]} ↔ ${arr[largest]}` })
      heapify(size, largest, phase)
    }
  }

  steps.push({ array: [...arr], highlights: new Map(), heapSize: n, desc: '阶段一: 建大顶堆' })
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i, '建堆')
  steps.push({ array: [...arr], highlights: new Map(), heapSize: n, desc: `大顶堆建成，堆顶 = ${arr[0]}` })

  steps.push({ array: [...arr], highlights: new Map(), heapSize: n, desc: '阶段二: 逐个取出堆顶' })
  for (let i = n - 1; i > 0; i--) {
    ;[arr[0], arr[i]] = [arr[i], arr[0]]; sd.add(i)
    const sw = new Map<number, HlType>(); sd.forEach(s => sw.set(s, 'sorted')); sw.set(0, 'swap')
    steps.push({ array: [...arr], highlights: sw, heapSize: i, desc: `取出堆顶 ${arr[i]}，堆缩小到 ${i} 个` })
    if (i > 1) heapify(i, 0, '调整')
  }
  sd.add(0)
  const fm = new Map<number, HlType>(); for (let i = 0; i < n; i++) fm.set(i, 'sorted')
  steps.push({ array: [...arr], highlights: fm, heapSize: 0, desc: '排序完成' })
  return steps
}

// ==================== 计数排序 ====================

function buildCountingSteps(data: number[]): SortStep[] {
  const arr = [...data], n = arr.length, steps: SortStep[] = []
  const maxVal = Math.max(...arr)
  const count = new Array(maxVal + 1).fill(0)

  // 第一步：计数
  steps.push({ array: [...arr], highlights: new Map(), desc: '第一步：统计每个值出现次数', countArr: [...count] })
  for (let i = 0; i < n; i++) {
    count[arr[i]]++
    const h = mkHl([[i, 'active']])
    steps.push({ array: [...arr], highlights: h, desc: `count[${arr[i]}]++ → ${count[arr[i]]}`, countArr: [...count] })
  }

  // 第二步：前缀和
  steps.push({ array: [...arr], highlights: new Map(), desc: '第二步：前缀和', countArr: [...count] })
  for (let i = 1; i <= maxVal; i++) {
    count[i] += count[i - 1]
    steps.push({ array: [...arr], highlights: new Map(), desc: `count[${i}] += count[${i - 1}] → ${count[i]}`, countArr: [...count] })
  }

  // 第三步：放置
  const output = new Array(n).fill(0)
  steps.push({ array: [...output], highlights: new Map(), desc: '第三步：从右向左放置到输出数组', countArr: [...count] })
  for (let i = n - 1; i >= 0; i--) {
    const v = arr[i]
    const pos = count[v] - 1
    output[pos] = v
    count[v]--
    steps.push({ array: [...output], highlights: mkHl([[pos, 'swap']]), desc: `arr[${i}]=${v} → output[${pos}]`, countArr: [...count] })
  }

  const fm = new Map<number, HlType>(); for (let i = 0; i < n; i++) fm.set(i, 'sorted')
  steps.push({ array: [...output], highlights: fm, desc: '排序完成' })
  return steps
}

// ==================== 桶排序 ====================

function buildBucketSteps(data: number[]): SortStep[] {
  const arr = [...data], n = arr.length, steps: SortStep[] = []
  const maxVal = Math.max(...arr)
  const buckets: number[][] = Array.from({ length: n }, () => [])

  // 分桶
  steps.push({ array: [...arr], highlights: new Map(), desc: `分桶：${n} 个桶，映射公式 floor(v/${maxVal}*${n - 1})` })
  for (let i = 0; i < n; i++) {
    const bi = Math.floor(arr[i] * (n - 1) / maxVal)
    buckets[bi].push(arr[i])
    steps.push({ array: [...arr], highlights: mkHl([[i, 'active']]), desc: `${arr[i]} → 桶${bi}`, bucketData: buckets.map(b => [...b]) })
  }

  // 桶内排序
  for (let b = 0; b < n; b++) {
    if (buckets[b].length > 1) {
      steps.push({ array: [...arr], highlights: new Map(), desc: `桶${b} 内排序: [${buckets[b]}]`, bucketData: buckets.map(bk => [...bk]) })
      buckets[b].sort((a, b) => a - b)
      steps.push({ array: [...arr], highlights: new Map(), desc: `桶${b} 排序后: [${buckets[b]}]`, bucketData: buckets.map(bk => [...bk]) })
    }
  }

  // 合并
  const result: number[] = []
  for (let b = 0; b < n; b++) {
    for (const v of buckets[b]) {
      result.push(v)
    }
  }
  const fm = new Map<number, HlType>(); for (let i = 0; i < n; i++) fm.set(i, 'sorted')
  steps.push({ array: result, highlights: fm, desc: '合并所有桶，排序完成', bucketData: buckets.map(b => [...b]) })
  return steps
}

// ==================== 基数排序 ====================

function buildRadixSteps(data: number[]): SortStep[] {
  let arr = [...data], steps: SortStep[] = []
  const maxVal = Math.max(...arr)
  const n = arr.length

  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    const digitName = exp === 1 ? '个' : exp === 10 ? '十' : exp === 100 ? '百' : `${exp}`
    steps.push({ array: [...arr], highlights: new Map(), desc: `按${digitName}位排序 (exp=${exp})`, radixExp: exp })

    // 展示当前位的数字
    const digits = arr.map(v => Math.floor(v / exp) % 10)
    const h = new Map<number, HlType>(); arr.forEach((_, i) => h.set(i, 'compare'))
    steps.push({ array: [...arr], highlights: h, desc: `各元素的${digitName}位: [${digits}]`, radixExp: exp })

    // 计数排序
    const count = new Array(10).fill(0)
    for (const v of arr) count[Math.floor(v / exp) % 10]++
    for (let i = 1; i < 10; i++) count[i] += count[i - 1]
    const output = new Array(n)
    for (let i = n - 1; i >= 0; i--) {
      const d = Math.floor(arr[i] / exp) % 10
      output[count[d] - 1] = arr[i]
      count[d]--
    }
    arr = output
    steps.push({ array: [...arr], highlights: new Map(), desc: `按${digitName}位排序后: [${arr}]`, radixExp: exp })
  }

  const fm = new Map<number, HlType>(); for (let i = 0; i < n; i++) fm.set(i, 'sorted')
  steps.push({ array: [...arr], highlights: fm, desc: '排序完成' })
  return steps
}

// ==================== 构建分派 ====================

function buildSteps(config: SortAnimationConfig): SortStep[] {
  switch (config.algorithm) {
    case 'bubble':    return buildBubbleSteps(config.data)
    case 'selection': return buildSelectionSteps(config.data)
    case 'insertion': return buildInsertionSteps(config.data)
    case 'shell':     return buildShellSteps(config.data)
    case 'merge':     return buildMergeSteps(config.data)
    case 'quick':     return buildQuickSteps(config.data)
    case 'heap':      return buildHeapSteps(config.data)
    case 'counting':  return buildCountingSteps(config.data)
    case 'bucket':    return buildBucketSteps(config.data)
    case 'radix':     return buildRadixSteps(config.data)
  }
}

// ==================== 播放器 ====================

function usePlayer(total: number) {
  const [step, setStep] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
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

const BAR_COLORS: Record<string, string> = {
  compare: 'bg-amber-400', swap: 'bg-rose-500', sorted: 'bg-emerald-500',
  pivot: 'bg-violet-500', active: 'bg-sky-400', left: 'bg-blue-400', right: 'bg-orange-400',
}
const NODE_STROKE: Record<string, string> = {
  compare: 'stroke-amber-400 fill-amber-400/20', swap: 'stroke-rose-500 fill-rose-500/20',
  sorted: 'stroke-emerald-500 fill-emerald-500/20', active: 'stroke-sky-400 fill-sky-400/20',
}
const NODE_TEXT: Record<string, string> = {
  compare: 'fill-amber-300', swap: 'fill-rose-300', sorted: 'fill-emerald-300', active: 'fill-sky-300',
}
const BLOCK_COLORS: Record<string, string> = {
  left: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  right: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
  pivot: 'bg-violet-500/20 border-violet-500/50 text-violet-300',
  sorted: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
  swap: 'bg-rose-500/20 border-rose-500/50 text-rose-300',
}

// ==================== 柱状图（通用） ====================

function BarChart({ array, highlights, maxVal }: { array: number[]; highlights: Map<number, HlType>; maxVal: number }) {
  return (
    <div className="flex items-end gap-1.5 h-44 px-4 pt-5 pb-2 bg-gray-950 rounded-lg border border-gray-800">
      {array.map((val, idx) => {
        // 纯线性映射，最大值=95%，最小值按比例缩，让差距真实可见
        const pct = Math.max((val / maxVal) * 95, 2)
        const h = highlights.get(idx)
        const color = h ? (BAR_COLORS[h] || 'bg-slate-600') : 'bg-slate-600'
        return (
          <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full max-w-12">
            <span className={`text-[10px] font-mono font-semibold mb-0.5 ${h ? 'text-white' : 'text-gray-500'}`}>{val}</span>
            <motion.div
              className={`w-full rounded-t-sm ${color}`}
              animate={{ height: `${pct}%` }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          </div>
        )
      })}
    </div>
  )
}

// ==================== 堆排序树形图 + 数组对照 ====================

function HeapTreeView({ array, highlights, heapSize }: { array: number[]; highlights: Map<number, HlType>; heapSize: number }) {
  const size = Math.min(heapSize, array.length)
  if (size <= 0) return null

  const depth = Math.floor(Math.log2(size)) + 1
  const W = 560, nodeR = 16, layerH = 56
  const H = depth * layerH + 30

  // 节点位置：每层均匀分布
  const pos: { x: number; y: number }[] = []
  for (let i = 0; i < size; i++) {
    const d = Math.floor(Math.log2(i + 1))
    const inLevel = i - (2 ** d - 1)
    const count = 2 ** d
    const gap = W / (count + 1)
    pos.push({ x: gap * (inLevel + 1), y: 24 + d * layerH })
  }

  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 space-y-3">
      {/* 树形图 */}
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full h-auto max-w-[560px]">
        {/* 连线 */}
        {pos.map(({ x, y }, idx) => {
          const nodes: React.ReactNode[] = []
          const li = 2 * idx + 1, ri = 2 * idx + 2
          if (li < size) nodes.push(<line key={`l${idx}`} x1={x} y1={y + nodeR} x2={pos[li].x} y2={pos[li].y - nodeR} className="stroke-gray-700" strokeWidth={1.5} />)
          if (ri < size) nodes.push(<line key={`r${idx}`} x1={x} y1={y + nodeR} x2={pos[ri].x} y2={pos[ri].y - nodeR} className="stroke-gray-700" strokeWidth={1.5} />)
          return nodes
        })}
        {/* 节点 */}
        {pos.map(({ x, y }, idx) => {
          const h = highlights.get(idx)
          return (
            <g key={idx}>
              <circle cx={x} cy={y} r={nodeR} className={h ? (NODE_STROKE[h] || 'stroke-slate-500 fill-slate-800') : 'stroke-slate-500 fill-slate-800'} strokeWidth={2} />
              <text x={x} y={y + 5} textAnchor="middle" className={`text-xs font-bold font-mono ${h ? (NODE_TEXT[h] || 'fill-gray-300') : 'fill-gray-300'}`}>{array[idx]}</text>
              <text x={x} y={y + nodeR + 12} textAnchor="middle" className="fill-gray-600 text-[8px] font-mono">{idx}</text>
            </g>
          )
        })}
      </svg>

      {/* 数组对照 */}
      <div className="flex gap-0.5 justify-center">
        {array.map((val, idx) => {
          const inHeap = idx < size
          const h = highlights.get(idx)
          const bg = h === 'sorted' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
            : h === 'swap' ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
            : h === 'compare' ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
            : h === 'active' ? 'bg-sky-400/20 border-sky-400/50 text-sky-300'
            : inHeap ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-900 border-gray-800 text-gray-600'
          return (
            <div key={idx} className={`w-10 h-10 flex flex-col items-center justify-center border rounded text-xs font-mono ${bg}`}>
              <span className="font-bold">{val}</span>
              <span className="text-[8px] opacity-60">[{idx}]</span>
            </div>
          )
        })}
      </div>
      <div className="text-[10px] text-gray-600 text-center">
        {size < array.length ? `堆范围 [0..${size - 1}] | 已排序 [${size}..${array.length - 1}]` : `堆范围 [0..${size - 1}]`}
      </div>
    </div>
  )
}

// ==================== 希尔排序子序列分组视图 ====================

function ShellGroupsView({ array, gap, groups, highlights }: { array: number[]; gap: number; groups: number[][]; highlights: Map<number, HlType> }) {
  const colors = ['border-blue-400 text-blue-300', 'border-orange-400 text-orange-300', 'border-sky-400 text-sky-300', 'border-amber-400 text-amber-300', 'border-violet-400 text-violet-300']
  const bgColors = ['bg-blue-500/10', 'bg-orange-500/10', 'bg-sky-500/10', 'bg-amber-500/10', 'bg-violet-500/10']
  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 space-y-2">
      <div className="text-xs text-gray-400 font-medium">gap = {gap} → {groups.length} 组子序列</div>
      <div className="space-y-1">
        {groups.map((group, gi) => (
          <div key={gi} className={`flex items-center gap-1 px-2 py-1 rounded ${bgColors[gi % bgColors.length]}`}>
            <span className={`text-[10px] font-mono w-10 shrink-0 ${colors[gi % colors.length]}`}>组{gi}:</span>
            <div className="flex gap-0.5 flex-wrap">
              {group.map(idx => {
                const h = highlights.get(idx)
                const isActive = h === 'active' || h === 'swap'
                return (
                  <div key={idx} className={`w-8 h-8 flex flex-col items-center justify-center rounded border text-[10px] font-mono ${
                    isActive ? 'bg-sky-400/30 border-sky-400 text-sky-200 font-bold' : `border-gray-700 ${colors[gi % colors.length]}`
                  }`}>
                    <span>{array[idx]}</span>
                    <span className="text-[7px] opacity-50">{idx}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== 归并排序合并块视图 ====================

function MergeBlocksView({ blocks }: { blocks: { left: number[]; right: number[]; merged: number[] } }) {
  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 space-y-2">
      <div className="text-xs text-gray-400 font-medium">合并过程</div>
      <div className="flex items-center gap-3 flex-wrap">
        {/* 左 */}
        <div className={`flex gap-0.5 px-2 py-1 rounded border ${BLOCK_COLORS.left}`}>
          <span className="text-[10px] mr-1 self-center">左:</span>
          {blocks.left.map((v, i) => <span key={i} className="w-7 h-7 flex items-center justify-center text-xs font-mono font-bold border border-blue-500/30 rounded bg-blue-500/10">{v}</span>)}
        </div>
        <span className="text-gray-600">+</span>
        {/* 右 */}
        <div className={`flex gap-0.5 px-2 py-1 rounded border ${BLOCK_COLORS.right}`}>
          <span className="text-[10px] mr-1 self-center">右:</span>
          {blocks.right.map((v, i) => <span key={i} className="w-7 h-7 flex items-center justify-center text-xs font-mono font-bold border border-orange-500/30 rounded bg-orange-500/10">{v}</span>)}
        </div>
        <span className="text-gray-600">→</span>
        {/* 已合并 */}
        <div className={`flex gap-0.5 px-2 py-1 rounded border ${BLOCK_COLORS.sorted}`}>
          {blocks.merged.length > 0 ? blocks.merged.map((v, i) => <span key={i} className="w-7 h-7 flex items-center justify-center text-xs font-mono font-bold border border-emerald-500/30 rounded bg-emerald-500/10">{v}</span>) : <span className="text-[10px] text-gray-500">...</span>}
        </div>
      </div>
    </div>
  )
}

// ==================== 快排分区块视图 ====================

function PartitionBlocksView({ blocks }: { blocks: { leftArr: number[]; pivotVal: number; rightArr: number[] } }) {
  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 space-y-2">
      <div className="text-xs text-gray-400 font-medium">分区结果</div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className={`flex gap-0.5 px-2 py-1 rounded border ${BLOCK_COLORS.left}`}>
          <span className="text-[10px] mr-1 self-center">&lt;pivot:</span>
          {blocks.leftArr.length > 0 ? blocks.leftArr.map((v, i) => <span key={i} className="w-7 h-7 flex items-center justify-center text-xs font-mono font-bold rounded border border-blue-500/30 bg-blue-500/10">{v}</span>) : <span className="text-[10px] text-gray-600">空</span>}
        </div>
        <div className={`flex gap-0.5 px-2 py-1 rounded border ${BLOCK_COLORS.pivot}`}>
          <span className="w-7 h-7 flex items-center justify-center text-xs font-mono font-bold rounded border border-violet-500/30 bg-violet-500/20">{blocks.pivotVal}</span>
        </div>
        <div className={`flex gap-0.5 px-2 py-1 rounded border ${BLOCK_COLORS.right}`}>
          <span className="text-[10px] mr-1 self-center">&gt;=pivot:</span>
          {blocks.rightArr.length > 0 ? blocks.rightArr.map((v, i) => <span key={i} className="w-7 h-7 flex items-center justify-center text-xs font-mono font-bold rounded border border-orange-500/30 bg-orange-500/10">{v}</span>) : <span className="text-[10px] text-gray-600">空</span>}
        </div>
      </div>
    </div>
  )
}

// ==================== 主组件 ====================

export default function SortAnimation({ config }: { config: SortAnimationConfig }) {
  const steps = useRef(buildSteps(config)).current
  const player = usePlayer(steps.length)
  const cur = player.step >= 0 ? steps[player.step] : null
  const displayArr = cur ? cur.array : config.data
  const highlights = cur?.highlights ?? new Map()
  const maxVal = Math.max(...config.data)

  return (
    <div className="space-y-3">
      {/* 柱状图 */}
      <BarChart array={displayArr} highlights={highlights} maxVal={maxVal} />

      {/* 堆排序：树形 + 数组对照 */}
      {config.algorithm === 'heap' && (
        <HeapTreeView array={displayArr} highlights={highlights} heapSize={cur?.heapSize ?? config.data.length} />
      )}

      {/* 希尔排序：子序列分组 */}
      {config.algorithm === 'shell' && cur?.shellGap && cur.shellGroups && (
        <ShellGroupsView array={displayArr} gap={cur.shellGap} groups={cur.shellGroups} highlights={highlights} />
      )}

      {/* 归并排序：合并块 */}
      {config.algorithm === 'merge' && cur?.mergeBlocks && (
        <MergeBlocksView blocks={cur.mergeBlocks} />
      )}

      {/* 快排：分区块 */}
      {config.algorithm === 'quick' && cur?.partitionBlocks && (
        <PartitionBlocksView blocks={cur.partitionBlocks} />
      )}

      {/* 计数排序：计数数组 */}
      {config.algorithm === 'counting' && cur?.countArr && (
        <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 space-y-2">
          <div className="text-xs text-gray-400 font-medium">计数数组 count[]</div>
          <div className="flex gap-0.5 flex-wrap">
            {cur.countArr.map((c, i) => (
              <div key={i} className={`w-9 h-12 flex flex-col items-center justify-center rounded border text-[10px] font-mono ${c > 0 ? 'border-sky-500/50 bg-sky-500/10 text-sky-300' : 'border-gray-700 bg-gray-800 text-gray-600'}`}>
                <span className="font-bold text-xs">{c}</span>
                <span className="text-[8px] opacity-60">[{i}]</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 桶排序：桶内容 */}
      {config.algorithm === 'bucket' && cur?.bucketData && (
        <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 space-y-1.5">
          <div className="text-xs text-gray-400 font-medium">桶内容</div>
          {cur.bucketData.map((bucket, bi) => (
            bucket.length > 0 && (
              <div key={bi} className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/5">
                <span className="text-[10px] font-mono w-10 shrink-0 text-blue-300">桶{bi}:</span>
                <div className="flex gap-0.5">
                  {bucket.map((v, vi) => (
                    <span key={vi} className="w-8 h-7 flex items-center justify-center text-xs font-mono font-bold rounded border border-blue-500/30 bg-blue-500/10 text-blue-200">{v}</span>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* 基数排序：当前位提示 */}
      {config.algorithm === 'radix' && cur?.radixExp && (
        <div className="bg-gray-950 rounded-lg border border-gray-800 p-3">
          <div className="text-xs text-gray-400">
            当前按 <span className="text-violet-400 font-bold">{cur.radixExp === 1 ? '个' : cur.radixExp === 10 ? '十' : cur.radixExp === 100 ? '百' : cur.radixExp + ''}</span> 位排序 (exp={cur.radixExp})
          </div>
          <div className="flex gap-0.5 mt-2">
            {displayArr.map((v, i) => {
              const digit = Math.floor(v / cur.radixExp!) % 10
              return (
                <div key={i} className="flex-1 max-w-12 flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-mono text-gray-400">{v}</span>
                  <span className="w-7 h-7 flex items-center justify-center rounded border border-violet-500/40 bg-violet-500/10 text-violet-300 text-xs font-bold font-mono">{digit}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 图例 */}
      <div className="flex gap-3 text-[10px] text-gray-500 flex-wrap">
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400 mr-0.5 align-middle" /> 比较</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500 mr-0.5 align-middle" /> 交换</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-sky-400 mr-0.5 align-middle" /> 当前</span>
        {config.algorithm === 'quick' && <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-violet-500 mr-0.5 align-middle" /> Pivot</span>}
        {(config.algorithm === 'quick' || config.algorithm === 'merge') && <>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-400 mr-0.5 align-middle" /> 左区</span>
          <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-orange-400 mr-0.5 align-middle" /> 右区</span>
        </>}
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500 mr-0.5 align-middle" /> 已排好</span>
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
