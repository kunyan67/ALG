import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { BacktrackingAnimationConfig } from '../data/algorithms'

interface BacktrackingStep {
  desc: string
  path: number[]
  depth: number
  current?: number
  candidates?: number[]
  used?: boolean[]
  board?: number[]
  conflictCols?: number[]
  solutions: number[][]
  remain?: number
  textPath?: string
  openCount?: number
  closeCount?: number
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
    reset: useCallback(() => { clear(); setPlaying(false); setStep(-1) }, [clear]),
    playPause: useCallback(() => {
      if (step >= total - 1) { setStep(-1); setPlaying(true) } else setPlaying((p) => !p)
    }, [step, total]),
    next: useCallback(() => { setPlaying(false); setStep((s) => Math.min(s + 1, total - 1)) }, [total]),
    prev: useCallback(() => { setPlaying(false); setStep((s) => Math.max(s - 1, -1)) }, []),
  }
}

function buildPermutationSteps(nums: number[]): BacktrackingStep[] {
  const steps: BacktrackingStep[] = []
  const used = new Array(nums.length).fill(false)
  const path: number[] = []
  const solutions: number[][] = []

  const dfs = (depth: number) => {
    steps.push({ desc: `来到第 ${depth} 层，当前前缀为 [${path.join(', ')}]，从未使用的数字里继续选`, path: [...path], depth, candidates: nums.filter((_, i) => !used[i]), used: [...used], solutions: solutions.map((s) => [...s]) })
    if (depth === nums.length) {
      solutions.push([...path])
      steps.push({ desc: `得到一个完整排列： [${path.join(', ')}]`, path: [...path], depth, used: [...used], solutions: solutions.map((s) => [...s]) })
      return
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue
      used[i] = true
      path.push(nums[i])
      steps.push({ desc: `选择 ${nums[i]} 进入路径，递归处理下一个位置`, path: [...path], depth: depth + 1, current: nums[i], candidates: nums.filter((_, j) => !used[j]), used: [...used], solutions: solutions.map((s) => [...s]) })
      dfs(depth + 1)
      path.pop()
      used[i] = false
      steps.push({ desc: `撤销 ${nums[i]}，恢复现场，尝试同层其它候选`, path: [...path], depth, current: nums[i], candidates: nums.filter((_, j) => !used[j]), used: [...used], solutions: solutions.map((s) => [...s]) })
    }
  }

  dfs(0)
  return steps
}

function buildNQueensSteps(n: number): BacktrackingStep[] {
  const steps: BacktrackingStep[] = []
  const board = new Array(n).fill(-1)
  const cols = new Set<number>()
  const diag1 = new Set<number>()
  const diag2 = new Set<number>()
  const solutions: number[][] = []

  const dfs = (row: number) => {
    if (row === n) {
      solutions.push([...board])
      steps.push({ desc: `前 ${n} 行都成功放置，得到一个解`, path: board.filter((v) => v >= 0), depth: row, board: [...board], solutions: solutions.map((s) => [...s]) })
      return
    }

    const conflictCols: number[] = []
    for (let c = 0; c < n; c++) {
      const blocked = cols.has(c) || diag1.has(row - c) || diag2.has(row + c)
      if (blocked) conflictCols.push(c)
    }
    steps.push({ desc: `处理第 ${row} 行，逐列检查能否放皇后`, path: board.filter((v) => v >= 0), depth: row, board: [...board], conflictCols, solutions: solutions.map((s) => [...s]) })

    for (let c = 0; c < n; c++) {
      if (cols.has(c) || diag1.has(row - c) || diag2.has(row + c)) {
        steps.push({ desc: `第 ${row} 行第 ${c} 列冲突，跳过`, path: board.filter((v) => v >= 0), depth: row, board: [...board], current: c, conflictCols: [c], solutions: solutions.map((s) => [...s]) })
        continue
      }
      board[row] = c
      cols.add(c)
      diag1.add(row - c)
      diag2.add(row + c)
      steps.push({ desc: `在 (${row}, ${c}) 放置皇后，继续下一行`, path: board.filter((v) => v >= 0), depth: row + 1, board: [...board], current: c, solutions: solutions.map((s) => [...s]) })
      dfs(row + 1)
      board[row] = -1
      cols.delete(c)
      diag1.delete(row - c)
      diag2.delete(row + c)
      steps.push({ desc: `从 (${row}, ${c}) 回溯，撤下皇后，尝试本行下一列`, path: board.filter((v) => v >= 0), depth: row, board: [...board], current: c, solutions: solutions.map((s) => [...s]) })
    }
  }

  dfs(0)
  return steps
}

function buildCombinationSumSteps(nums: number[], target: number): BacktrackingStep[] {
  const steps: BacktrackingStep[] = []
  const path: number[] = []
  const solutions: number[][] = []

  const dfs = (start: number, remain: number) => {
    steps.push({ desc: `当前组合 [${path.join(', ')}]，剩余目标值 ${remain}，从索引 ${start} 开始尝试`, path: [...path], depth: path.length, remain, candidates: nums.slice(start), solutions: solutions.map((s) => [...s]) })
    if (remain === 0) {
      solutions.push([...path])
      steps.push({ desc: `剩余值为 0，得到一个合法组合 [${path.join(', ')}]`, path: [...path], depth: path.length, remain, solutions: solutions.map((s) => [...s]) })
      return
    }

    for (let i = start; i < nums.length; i++) {
      const x = nums[i]
      if (x > remain) {
        steps.push({ desc: `${x} 已经大于剩余值 ${remain}，这一支直接剪枝`, path: [...path], depth: path.length, current: x, remain, candidates: nums.slice(i), solutions: solutions.map((s) => [...s]) })
        continue
      }
      path.push(x)
      steps.push({ desc: `选择 ${x}，剩余值变成 ${remain - x}，由于允许重复，下一层仍可从 ${i} 开始`, path: [...path], depth: path.length, current: x, remain: remain - x, candidates: nums.slice(i), solutions: solutions.map((s) => [...s]) })
      dfs(i, remain - x)
      path.pop()
      steps.push({ desc: `撤销 ${x}，回到上层继续尝试其它数字`, path: [...path], depth: path.length, current: x, remain, candidates: nums.slice(start), solutions: solutions.map((s) => [...s]) })
    }
  }

  dfs(0, target)
  return steps
}

function buildSubsetSteps(nums: number[]): BacktrackingStep[] {
  const steps: BacktrackingStep[] = []
  const path: number[] = []
  const solutions: number[][] = []

  const dfs = (index: number) => {
    steps.push({ desc: `处理索引 ${index}，当前子集为 [${path.join(', ')}]`, path: [...path], depth: index, current: nums[index], candidates: nums.slice(index), solutions: solutions.map((s) => [...s]) })
    if (index === nums.length) {
      solutions.push([...path])
      steps.push({ desc: `到达叶子节点，记录一个子集 [${path.join(', ')}]`, path: [...path], depth: index, solutions: solutions.map((s) => [...s]) })
      return
    }
    steps.push({ desc: `先走“不选 ${nums[index]}”这条分支`, path: [...path], depth: index, current: nums[index], candidates: nums.slice(index), solutions: solutions.map((s) => [...s]) })
    dfs(index + 1)
    path.push(nums[index])
    steps.push({ desc: `再走“选 ${nums[index]}”这条分支`, path: [...path], depth: index + 1, current: nums[index], candidates: nums.slice(index + 1), solutions: solutions.map((s) => [...s]) })
    dfs(index + 1)
    path.pop()
    steps.push({ desc: `撤销 ${nums[index]}，返回上一层`, path: [...path], depth: index, current: nums[index], candidates: nums.slice(index + 1), solutions: solutions.map((s) => [...s]) })
  }

  dfs(0)
  return steps
}

function buildCombinationSteps(n: number, k: number): BacktrackingStep[] {
  const steps: BacktrackingStep[] = []
  const path: number[] = []
  const solutions: number[][] = []

  const dfs = (start: number) => {
    steps.push({ desc: `当前组合 [${path.join(', ')}]，下一次从 ${start} 开始选`, path: [...path], depth: path.length, candidates: Array.from({ length: n - start + 1 }, (_, i) => start + i).filter((x) => x >= start && x <= n), solutions: solutions.map((s) => [...s]) })
    if (path.length === k) {
      solutions.push([...path])
      steps.push({ desc: `长度达到 ${k}，记录组合 [${path.join(', ')}]`, path: [...path], depth: path.length, solutions: solutions.map((s) => [...s]) })
      return
    }
    for (let x = start; x <= n; x++) {
      path.push(x)
      steps.push({ desc: `选择 ${x}，继续从 ${x + 1} 往后选`, path: [...path], depth: path.length, current: x, candidates: Array.from({ length: n - x }, (_, i) => x + 1 + i), solutions: solutions.map((s) => [...s]) })
      dfs(x + 1)
      path.pop()
      steps.push({ desc: `撤销 ${x}，尝试更大的起点`, path: [...path], depth: path.length, current: x, candidates: Array.from({ length: n - x }, (_, i) => x + 1 + i), solutions: solutions.map((s) => [...s]) })
    }
  }

  dfs(1)
  return steps
}

function buildParenthesesSteps(n: number): BacktrackingStep[] {
  const steps: BacktrackingStep[] = []
  const solutions: number[][] = []

  const dfs = (path: string, openCount: number, closeCount: number) => {
    steps.push({ desc: `当前串为 ${path || '空串'}，左括号 ${openCount} 个，右括号 ${closeCount} 个`, path: [], depth: path.length, textPath: path, openCount, closeCount, solutions: solutions.map((s) => [...s]) })
    if (openCount === n && closeCount === n) {
      solutions.push([solutions.length + 1])
      steps.push({ desc: `形成一个合法括号串：${path}`, path: [], depth: path.length, textPath: path, openCount, closeCount, solutions: solutions.map((s) => [...s]) })
      return
    }
    if (openCount < n) {
      steps.push({ desc: `还能放左括号，扩展为 ${path}(`, path: [], depth: path.length + 1, textPath: path + '(', openCount: openCount + 1, closeCount, solutions: solutions.map((s) => [...s]) })
      dfs(path + '(', openCount + 1, closeCount)
    }
    if (closeCount < openCount) {
      steps.push({ desc: `当前前缀合法，可以补右括号为 ${path})`, path: [], depth: path.length + 1, textPath: path + ')', openCount, closeCount: closeCount + 1, solutions: solutions.map((s) => [...s]) })
      dfs(path + ')', openCount, closeCount + 1)
    }
  }

  dfs('', 0, 0)
  return steps
}

function buildSteps(config: BacktrackingAnimationConfig): BacktrackingStep[] {
  switch (config.algorithm) {
    case 'permutations':
      return buildPermutationSteps(config.nums ?? [1, 2, 3])
    case 'subsets':
      return buildSubsetSteps(config.nums ?? [1, 2, 3])
    case 'combinations':
      return buildCombinationSteps(config.n ?? 4, config.k ?? 2)
    case 'n-queens':
      return buildNQueensSteps(config.n ?? 4)
    case 'generate-parentheses':
      return buildParenthesesSteps(config.n ?? 3)
    case 'combination-sum':
      return buildCombinationSumSteps(config.nums ?? [2, 3, 6, 7], config.target ?? 7)
  }
}

function CandidateChips({ values, current, title }: { values?: number[]; current?: number; title: string }) {
  if (!values) return null
  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3">
      <div className="text-xs text-gray-500 mb-1.5">{title}</div>
      <div className="flex gap-1.5 flex-wrap">
        {values.length > 0 ? values.map((value, i) => (
          <span key={`${title}-${i}-${value}`} className={`px-2.5 py-1 rounded border text-xs font-mono ${value === current ? 'border-amber-400 bg-amber-400/15 text-amber-300' : 'border-gray-700 bg-gray-800 text-gray-300'}`}>
            {value}
          </span>
        )) : <span className="text-[10px] text-gray-600 italic">空</span>}
      </div>
    </div>
  )
}

function PathView({ step }: { step: BacktrackingStep | null }) {
  if (!step) return null
  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3">
      <div className="text-xs text-gray-500 mb-1.5">当前递归路径</div>
      {step.textPath !== undefined && (
        <div className="mb-2 text-sm text-indigo-300 font-mono">{step.textPath || '空串'}</div>
      )}
      <div className="flex gap-1.5 flex-wrap items-center">
        {step.path.length > 0 ? step.path.map((value, i) => (
          <span key={`path-${i}-${value}`} className={`px-2.5 py-1 rounded border text-xs font-mono ${i === step.path.length - 1 ? 'border-indigo-400 bg-indigo-500/15 text-indigo-300' : 'border-gray-700 bg-gray-800 text-gray-300'}`}>
            {value}
          </span>
        )) : <span className="text-[10px] text-gray-600 italic">根节点</span>}
      </div>
    </div>
  )
}

function SolutionsView({ solutions }: { solutions: number[][] }) {
  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3">
      <div className="text-xs text-gray-500 mb-1.5">已找到的答案</div>
      <div className="flex gap-1.5 flex-wrap">
        {solutions.length > 0 ? solutions.map((solution, i) => (
          <span key={`sol-${i}`} className="px-2.5 py-1 rounded border text-xs font-mono border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
            [{solution.join(', ')}]
          </span>
        )) : <span className="text-[10px] text-gray-600 italic">暂无</span>}
      </div>
    </div>
  )
}

function NQueensBoard({ board, current, conflictCols }: { board?: number[]; current?: number; conflictCols?: number[] }) {
  if (!board) return null
  const n = board.length
  return (
    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 overflow-x-auto">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${n}, 44px)` }}>
        {Array.from({ length: n }, (_, r) =>
          Array.from({ length: n }, (_, c) => {
            const hasQueen = board[r] === c
            const isConflict = conflictCols?.includes(c) && board[r] === -1
            const isCurrent = current === c && board[r] === c
            return (
              <div
                key={`${r}-${c}`}
                className={`h-11 w-11 rounded flex items-center justify-center text-lg border ${(r + c) % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'} ${hasQueen ? (isCurrent ? 'border-amber-400 text-amber-300' : 'border-indigo-400 text-indigo-300') : isConflict ? 'border-rose-400/60 text-rose-300' : 'border-gray-600 text-gray-500'}`}
              >
                {hasQueen ? 'Q' : ''}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}

export default function BacktrackingAnimation({ config }: { config: BacktrackingAnimationConfig }) {
  const steps = useRef(buildSteps(config)).current
  const player = usePlayer(steps.length)
  const cur = player.step >= 0 ? steps[player.step] : null

  return (
    <div className="space-y-3">
      <PathView step={cur} />
      <CandidateChips values={cur?.candidates} current={cur?.current} title={config.algorithm === 'combination-sum' ? '本层可选候选' : '当前候选'} />
      {config.algorithm === 'n-queens' && <NQueensBoard board={cur?.board} current={cur?.current} conflictCols={cur?.conflictCols} />}
      {config.algorithm === 'combination-sum' && cur && (
        <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 text-sm text-gray-300">
          剩余目标值：<span className="font-mono text-indigo-300">{cur.remain}</span>
        </div>
      )}
      {config.algorithm === 'generate-parentheses' && cur && (
        <div className="bg-gray-950 rounded-lg border border-gray-800 p-3 text-sm text-gray-300 flex gap-6">
          <span>左括号：<span className="font-mono text-indigo-300">{cur.openCount}</span></span>
          <span>右括号：<span className="font-mono text-indigo-300">{cur.closeCount}</span></span>
        </div>
      )}
      <SolutionsView solutions={cur?.solutions ?? []} />

      {cur && (
        <motion.div key={player.step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm bg-gray-800 rounded px-4 py-2 text-gray-200">
          {cur.desc}
        </motion.div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={player.prev} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded text-gray-300">上一步</button>
        <button onClick={player.playPause} className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded text-white font-medium min-w-16">{player.playing ? '暂停' : '播放'}</button>
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
