import { useParams } from 'react-router-dom'
import { findAlgorithm, type AnimationConfig } from '../data/algorithms'
import DPAnimation from './DPAnimation'
import DPClassicAnimation from './DPClassicAnimation'
import SortAnimation from './SortAnimation'
import SearchAnimation from './SearchAnimation'
import GraphAnimation from './GraphAnimation'
import GreedyAnimation from './GreedyAnimation'
import BacktrackingAnimation from './BacktrackingAnimation'
import TreeStructureAnimation from './TreeStructureAnimation'

/** 纯动画页面，供 Flutter iframe 嵌入，不带任何页面框架 */
export default function EmbedAnimation() {
  const { id } = useParams<{ id: string }>()
  const algo = id ? findAlgorithm(id) : undefined

  if (!algo) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-500">
        未找到该算法动画
      </div>
    )
  }

  return (
    <div className="bg-gray-950 min-h-screen p-4">
      <AnimationDispatcher key={id} config={algo.animation} />
    </div>
  )
}

function AnimationDispatcher({ config }: { config: AnimationConfig }) {
  if (config.type === 'sort') return <SortAnimation config={config} />
  if (config.type === 'search') return <SearchAnimation config={config} />
  if (config.type === 'graph') return <GraphAnimation config={config} />
  if (config.type === 'greedy') return <GreedyAnimation config={config} />
  if (config.type === 'dp-classic') return <DPClassicAnimation config={config} />
  if (config.type === 'backtracking') return <BacktrackingAnimation config={config} />
  if (config.type === 'tree-structure') return <TreeStructureAnimation config={config} />
  return <DPAnimation config={config} />
}
