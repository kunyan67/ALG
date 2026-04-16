import { useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import AlgorithmPage from './components/AlgorithmPage'
import { algorithmCategories } from './data/algorithms'

export default function App() {
  const firstAlgo = algorithmCategories[0]?.children?.[0]?.children?.[0]
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200">
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200
          md:static md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar onNavigate={closeSidebar} />
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* 移动端顶栏 */}
        <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-gray-950/90 backdrop-blur border-b border-gray-800 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-bold text-white tracking-wide">ALG</span>
        </div>

        <Routes>
          <Route
            path="/"
            element={
              firstAlgo ? (
                <Navigate to={`/algorithm/${firstAlgo.id}`} replace />
              ) : (
                <div className="p-8">选择一个算法开始学习</div>
              )
            }
          />
          <Route path="/algorithm/:id" element={<AlgorithmPage />} />
        </Routes>
      </main>
    </div>
  )
}
