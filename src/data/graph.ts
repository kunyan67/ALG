import type { AlgorithmNode, AlgorithmContent, GraphNode, GraphEdge, CodeEntry } from './algorithms'

export function graphAlgorithms(): AlgorithmNode[] {
  return [
    {
      id: 'graph-traversal',
      label: '图遍历',
      children: [
        { id: 'graph-bfs', label: 'BFS', content: bfs() },
        { id: 'graph-dfs', label: 'DFS', content: dfs() },
      ],
    },
    {
      id: 'graph-dag',
      label: 'DAG 与连通分量',
      children: [
        { id: 'graph-topo', label: '拓扑排序', content: topo() },
        { id: 'graph-tarjan', label: 'Tarjan SCC', content: tarjan() },
      ],
    },
    {
      id: 'shortest-path',
      label: '最短路径',
      children: [
        { id: 'graph-dijkstra', label: 'Dijkstra', content: dijkstra() },
        { id: 'graph-bellman-ford', label: 'Bellman-Ford', content: bellmanFord() },
        { id: 'graph-spfa', label: 'SPFA', content: spfa() },
        { id: 'graph-floyd', label: 'Floyd-Warshall', content: floyd() },
        { id: 'graph-astar', label: 'A*', content: astar() },
      ],
    },
  ]
}

// 共用的图结构（Dijkstra 和 Bellman-Ford 用）
const NODES: GraphNode[] = [
  { id: 'A', x: 80, y: 60 },
  { id: 'B', x: 240, y: 40 },
  { id: 'C', x: 240, y: 180 },
  { id: 'D', x: 400, y: 60 },
  { id: 'E', x: 400, y: 180 },
  { id: 'F', x: 520, y: 120 },
]

const EDGES: GraphEdge[] = [
  { from: 'A', to: 'B', weight: 4 },
  { from: 'A', to: 'C', weight: 2 },
  { from: 'B', to: 'C', weight: 1 },
  { from: 'B', to: 'D', weight: 5 },
  { from: 'C', to: 'D', weight: 8 },
  { from: 'C', to: 'E', weight: 10 },
  { from: 'D', to: 'E', weight: 2 },
  { from: 'D', to: 'F', weight: 6 },
  { from: 'E', to: 'F', weight: 3 },
]

// Floyd 用的小图（5 个节点，便于展示矩阵）
const FLOYD_NODES: GraphNode[] = [
  { id: '1', x: 100, y: 50 },
  { id: '2', x: 260, y: 50 },
  { id: '3', x: 420, y: 50 },
  { id: '4', x: 180, y: 170 },
  { id: '5', x: 340, y: 170 },
]

const FLOYD_EDGES: GraphEdge[] = [
  { from: '1', to: '2', weight: 3 },
  { from: '1', to: '4', weight: 7 },
  { from: '2', to: '3', weight: 2 },
  { from: '2', to: '4', weight: 5 },
  { from: '3', to: '5', weight: 1 },
  { from: '4', to: '5', weight: 2 },
  { from: '4', to: '3', weight: 4 },
]

const TRAVERSAL_NODES: GraphNode[] = [
  { id: 'A', x: 90, y: 60 },
  { id: 'B', x: 220, y: 40 },
  { id: 'C', x: 220, y: 160 },
  { id: 'D', x: 350, y: 40 },
  { id: 'E', x: 350, y: 160 },
  { id: 'F', x: 500, y: 70 },
  { id: 'G', x: 500, y: 180 },
]

const TRAVERSAL_EDGES: GraphEdge[] = [
  { from: 'A', to: 'B', weight: 1 },
  { from: 'A', to: 'C', weight: 1 },
  { from: 'B', to: 'D', weight: 1 },
  { from: 'B', to: 'E', weight: 1 },
  { from: 'C', to: 'E', weight: 1 },
  { from: 'D', to: 'F', weight: 1 },
  { from: 'E', to: 'F', weight: 1 },
  { from: 'E', to: 'G', weight: 1 },
]

const DAG_NODES: GraphNode[] = [
  { id: 'A', x: 80, y: 70 },
  { id: 'B', x: 200, y: 40 },
  { id: 'C', x: 200, y: 150 },
  { id: 'D', x: 340, y: 40 },
  { id: 'E', x: 340, y: 150 },
  { id: 'F', x: 500, y: 90 },
]

const DAG_EDGES: GraphEdge[] = [
  { from: 'A', to: 'B', weight: 1 },
  { from: 'A', to: 'C', weight: 1 },
  { from: 'B', to: 'D', weight: 1 },
  { from: 'C', to: 'D', weight: 1 },
  { from: 'C', to: 'E', weight: 1 },
  { from: 'D', to: 'F', weight: 1 },
  { from: 'E', to: 'F', weight: 1 },
]

const SCC_NODES: GraphNode[] = [
  { id: 'A', x: 90, y: 70 },
  { id: 'B', x: 220, y: 40 },
  { id: 'C', x: 220, y: 160 },
  { id: 'D', x: 360, y: 40 },
  { id: 'E', x: 360, y: 160 },
  { id: 'F', x: 520, y: 100 },
]

const SCC_EDGES: GraphEdge[] = [
  { from: 'A', to: 'B', weight: 1 },
  { from: 'B', to: 'C', weight: 1 },
  { from: 'C', to: 'A', weight: 1 },
  { from: 'B', to: 'D', weight: 1 },
  { from: 'D', to: 'E', weight: 1 },
  { from: 'E', to: 'D', weight: 1 },
  { from: 'E', to: 'F', weight: 1 },
]

// ==================== BFS ====================

function bfs(): AlgorithmContent {
  return {
    title: '广度优先搜索 BFS',
    description: [
      { type: 'text', content: 'BFS 从起点开始按“层”向外扩展。先访问距离起点 1 条边的点，再访问距离起点 2 条边的点，因此它天然适合求无权图最短路。' },
      { type: 'text', content: '理解重点不在“访问过哪些点”，而在“队列如何维持当前这一层和下一层的边界”。' },
      { type: 'table', table: { headers: ['概念', '含义'], rows: [['核心结构', '队列 FIFO'], ['访问顺序', '按层扩展'], ['典型用途', '无权最短路、分层搜索']] } },
    ],
    approach: `**核心思想**：谁先被发现，谁就先扩展它的邻居。

**流程**：
1. 起点入队并标记已访问
2. 反复取出队首节点 u
3. 按邻接顺序扫描 u 的邻居 v
4. 若 v 尚未访问，则标记、记录层数，并入队

**为什么是分层？**
因为队列先处理当前层先入队的节点，它们的邻居会统一排到队尾，形成下一层。`,
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    animation: { type: 'graph', algorithm: 'bfs', nodes: TRAVERSAL_NODES, edges: TRAVERSAL_EDGES, source: 'A' },
    codes: commonGraphCodes('bfs'),
  }
}

// ==================== DFS ====================

function dfs(): AlgorithmContent {
  return {
    title: '深度优先搜索 DFS',
    description: [
      { type: 'text', content: 'DFS 会沿着一条路径尽可能向深处走，走不动时再回溯。它更像“先把一条路走到底，再回来换路”。' },
      { type: 'text', content: '理解 DFS 的关键，是调用栈或显式栈如何记录“回头以后还要处理谁”。' },
      { type: 'table', table: { headers: ['概念', '含义'], rows: [['核心结构', '递归栈 / 显式栈'], ['访问顺序', '先深后回溯'], ['典型用途', '连通性、拓扑、SCC、回溯']] } },
    ],
    approach: `**核心思想**：从当前节点出发，优先进入第一个未访问邻居。

**流程**：
1. 访问当前节点 u
2. 扫描邻居 v
3. 若 v 未访问，沿该边继续递归
4. 若所有邻居都处理完，则回溯到父节点

**为什么需要栈？**
因为当我们深入子节点时，必须记住“回来以后还要继续扫哪些邻居”。`,
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    animation: { type: 'graph', algorithm: 'dfs', nodes: TRAVERSAL_NODES, edges: TRAVERSAL_EDGES, source: 'A' },
    codes: commonGraphCodes('dfs'),
  }
}

// ==================== Topo ====================

function topo(): AlgorithmContent {
  return {
    title: '拓扑排序（Kahn 算法）',
    description: [
      { type: 'text', content: '拓扑排序只适用于 DAG（有向无环图）。它要求输出一个顺序，使得每条有向边 u→v 中，u 都排在 v 前面。' },
      { type: 'text', content: 'Kahn 算法的关键不是“排结果”，而是持续维护每个节点当前还剩多少前驱没有被处理。' },
      { type: 'table', table: { headers: ['概念', '含义'], rows: [['适用图', '有向无环图 DAG'], ['核心结构', '入度数组 + 队列'], ['判环方式', '最终输出节点数 < V']] } },
    ],
    approach: `**核心思想**：谁当前没有前驱依赖，谁就可以先输出。

**流程**：
1. 统计每个节点入度
2. 把所有入度为 0 的点入队
3. 反复出队一个节点 u，加入答案
4. 删除 u 的所有出边，使邻居入度减 1
5. 某邻居入度变成 0 时入队

**为什么能检测环？**
若图中有环，环上的点入度永远不会全部降到 0，最终输出数量会不足。`,
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    animation: { type: 'graph', algorithm: 'topo', nodes: DAG_NODES, edges: DAG_EDGES, source: 'A' },
    codes: commonGraphCodes('topo'),
  }
}

// ==================== Tarjan ====================

function tarjan(): AlgorithmContent {
  return {
    title: 'Tarjan 强连通分量算法',
    description: [
      { type: 'text', content: 'Tarjan 用一次 DFS 就能把有向图切分成若干个强连通分量。强连通分量中的任意两点都能互相到达。' },
      { type: 'text', content: '最关键的不是“DFS 访问了谁”，而是 `dfn`、`low` 和栈共同表达了“当前子树最早能回到哪里”。' },
      { type: 'table', table: { headers: ['概念', '含义'], rows: [['dfn[u]', 'u 被首次访问的时间戳'], ['low[u]', 'u 及其子树能追溯到的最小 dfn'], ['判定根', 'dfn[u] == low[u]']] } },
    ],
    approach: `**核心思想**：DFS 过程中，把当前搜索路径上的点压栈，并持续更新 low。

**流程**：
1. 首次访问 u，设置 dfn[u]=low[u]=time，并压栈
2. 枚举邻居 v：
   - 若 v 未访问，则递归 v，回溯后 low[u]=min(low[u], low[v])
   - 若 v 在栈中，则 low[u]=min(low[u], dfn[v])
3. 若 dfn[u] == low[u]，说明 u 是一个 SCC 的根，持续弹栈直到弹出 u

**直觉**：low 越小，代表这条 DFS 分支还能“绕回去”连接到越早的祖先。`,
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    animation: { type: 'graph', algorithm: 'tarjan', nodes: SCC_NODES, edges: SCC_EDGES, source: 'A' },
    codes: commonGraphCodes('tarjan'),
  }
}

function commonGraphCodes(kind: 'bfs' | 'dfs' | 'topo' | 'tarjan') {
  const map = {
    bfs: {
      C: `#include <stdio.h>\n#define N 7\n\nvoid bfs(int g[N][N], int s) {\n    int q[N], h = 0, t = 0, vis[N] = {0};\n    vis[s] = 1; q[t++] = s;\n    while (h < t) {\n        int u = q[h++];\n        printf("%d ", u);\n        for (int v = 0; v < N; v++) {\n            if (g[u][v] && !vis[v]) {\n                vis[v] = 1;\n                q[t++] = v;\n            }\n        }\n    }\n}`,
      Python: `from collections import deque\n\ndef bfs(graph, start):\n    q = deque([start])\n    visited = {start}\n    order = []\n    while q:\n        u = q.popleft()\n        order.append(u)\n        for v in graph[u]:\n            if v not in visited:\n                visited.add(v)\n                q.append(v)\n    return order`,
      JavaScript: `function bfs(graph, start) {\n  const q = [start], visited = new Set([start]), order = [];\n  while (q.length) {\n    const u = q.shift();\n    order.push(u);\n    for (const v of graph[u]) {\n      if (!visited.has(v)) {\n        visited.add(v);\n        q.push(v);\n      }\n    }\n  }\n  return order;\n}`,
      TypeScript: `function bfs(graph: Record<string, string[]>, start: string): string[] {\n  const q = [start], visited = new Set([start]), order: string[] = [];\n  while (q.length) {\n    const u = q.shift()!;\n    order.push(u);\n    for (const v of graph[u]) {\n      if (!visited.has(v)) {\n        visited.add(v);\n        q.push(v);\n      }\n    }\n  }\n  return order;\n}`,
      Java: `import java.util.*;\nclass BFS {\n    static List<String> bfs(Map<String, List<String>> g, String s) {\n        Queue<String> q = new LinkedList<>();\n        Set<String> vis = new HashSet<>();\n        List<String> order = new ArrayList<>();\n        q.offer(s); vis.add(s);\n        while (!q.isEmpty()) {\n            String u = q.poll();\n            order.add(u);\n            for (String v : g.getOrDefault(u, List.of())) {\n                if (vis.add(v)) q.offer(v);\n            }\n        }\n        return order;\n    }\n}`,
    },
    dfs: {
      C: `#include <stdio.h>\n#define N 7\n\nvoid dfs(int g[N][N], int u, int vis[]) {\n    vis[u] = 1;\n    printf("%d ", u);\n    for (int v = 0; v < N; v++) {\n        if (g[u][v] && !vis[v]) dfs(g, v, vis);\n    }\n}`,
      Python: `def dfs(graph, start):\n    order = []\n    visited = set()\n\n    def walk(u):\n        visited.add(u)\n        order.append(u)\n        for v in graph[u]:\n            if v not in visited:\n                walk(v)\n\n    walk(start)\n    return order`,
      JavaScript: `function dfs(graph, start) {\n  const visited = new Set(), order = [];\n  function walk(u) {\n    visited.add(u);\n    order.push(u);\n    for (const v of graph[u]) if (!visited.has(v)) walk(v);\n  }\n  walk(start);\n  return order;\n}`,
      TypeScript: `function dfs(graph: Record<string, string[]>, start: string): string[] {\n  const visited = new Set<string>(), order: string[] = [];\n  function walk(u: string) {\n    visited.add(u);\n    order.push(u);\n    for (const v of graph[u]) if (!visited.has(v)) walk(v);\n  }\n  walk(start);\n  return order;\n}`,
      Java: `import java.util.*;\nclass DFS {\n    static void dfs(Map<String, List<String>> g, String u, Set<String> vis, List<String> order) {\n        vis.add(u); order.add(u);\n        for (String v : g.getOrDefault(u, List.of())) {\n            if (!vis.contains(v)) dfs(g, v, vis, order);\n        }\n    }\n}`,
    },
    topo: {
      C: `#include <stdio.h>\n#define N 6\n\nvoid topo(int g[N][N]) {\n    int indeg[N] = {0}, q[N], h = 0, t = 0;\n    for (int u = 0; u < N; u++)\n        for (int v = 0; v < N; v++) if (g[u][v]) indeg[v]++;\n    for (int i = 0; i < N; i++) if (indeg[i] == 0) q[t++] = i;\n    while (h < t) {\n        int u = q[h++];\n        printf("%d ", u);\n        for (int v = 0; v < N; v++) if (g[u][v] && --indeg[v] == 0) q[t++] = v;\n    }\n}`,
      Python: `from collections import deque\n\ndef topo_sort(graph):\n    indeg = {u: 0 for u in graph}\n    for u in graph:\n        for v in graph[u]:\n            indeg[v] += 1\n    q = deque([u for u in graph if indeg[u] == 0])\n    order = []\n    while q:\n        u = q.popleft()\n        order.append(u)\n        for v in graph[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0:\n                q.append(v)\n    return order`,
      JavaScript: `function topoSort(graph) {\n  const indeg = {};\n  for (const u in graph) indeg[u] ??= 0;\n  for (const u in graph) for (const v of graph[u]) indeg[v] = (indeg[v] ?? 0) + 1;\n  const q = Object.keys(indeg).filter(v => indeg[v] === 0), order = [];\n  while (q.length) {\n    const u = q.shift();\n    order.push(u);\n    for (const v of graph[u] ?? []) if (--indeg[v] === 0) q.push(v);\n  }\n  return order;\n}`,
      TypeScript: `function topoSort(graph: Record<string, string[]>): string[] {\n  const indeg: Record<string, number> = {};\n  for (const u in graph) indeg[u] ??= 0;\n  for (const u in graph) for (const v of graph[u]) indeg[v] = (indeg[v] ?? 0) + 1;\n  const q = Object.keys(indeg).filter((v) => indeg[v] === 0);\n  const order: string[] = [];\n  while (q.length) {\n    const u = q.shift()!;\n    order.push(u);\n    for (const v of graph[u] ?? []) if (--indeg[v] === 0) q.push(v);\n  }\n  return order;\n}`,
      Java: `import java.util.*;\nclass Topo {\n    static List<String> topoSort(Map<String, List<String>> g) {\n        Map<String, Integer> indeg = new HashMap<>();\n        for (String u : g.keySet()) indeg.putIfAbsent(u, 0);\n        for (String u : g.keySet()) for (String v : g.get(u)) indeg.put(v, indeg.getOrDefault(v, 0) + 1);\n        Queue<String> q = new LinkedList<>();\n        for (String u : indeg.keySet()) if (indeg.get(u) == 0) q.offer(u);\n        List<String> order = new ArrayList<>();\n        while (!q.isEmpty()) {\n            String u = q.poll(); order.add(u);\n            for (String v : g.getOrDefault(u, List.of())) if (indeg.merge(v, -1, Integer::sum) == 0) q.offer(v);\n        }\n        return order;\n    }\n}`,
    },
    tarjan: {
      C: `#include <stdio.h>\n#define N 6\nint dfn[N], low[N], st[N], top = 0, inSt[N], ts = 0;\nvoid tarjan(int g[N][N], int u) {\n    dfn[u] = low[u] = ++ts;\n    st[top++] = u; inSt[u] = 1;\n    for (int v = 0; v < N; v++) if (g[u][v]) {\n        if (!dfn[v]) { tarjan(g, v); if (low[v] < low[u]) low[u] = low[v]; }\n        else if (inSt[v] && dfn[v] < low[u]) low[u] = dfn[v];\n    }\n    if (dfn[u] == low[u]) while (1) { int x = st[--top]; inSt[x] = 0; if (x == u) break; }\n}`,
      Python: `def tarjan(graph):\n    dfn, low, stack, in_stack, time, scc = {}, {}, [], set(), 0, []\n\n    def dfs(u):\n        nonlocal time\n        time += 1\n        dfn[u] = low[u] = time\n        stack.append(u); in_stack.add(u)\n        for v in graph[u]:\n            if v not in dfn:\n                dfs(v)\n                low[u] = min(low[u], low[v])\n            elif v in in_stack:\n                low[u] = min(low[u], dfn[v])\n        if dfn[u] == low[u]:\n            comp = []\n            while True:\n                x = stack.pop(); in_stack.remove(x); comp.append(x)\n                if x == u: break\n            scc.append(comp)\n\n    for u in graph:\n        if u not in dfn: dfs(u)\n    return scc`,
      JavaScript: `function tarjan(graph) {\n  const dfn = {}, low = {}, stack = [], inStack = new Set(), scc = [];\n  let time = 0;\n  function dfs(u) {\n    dfn[u] = low[u] = ++time;\n    stack.push(u); inStack.add(u);\n    for (const v of graph[u]) {\n      if (!(v in dfn)) { dfs(v); low[u] = Math.min(low[u], low[v]); }\n      else if (inStack.has(v)) low[u] = Math.min(low[u], dfn[v]);\n    }\n    if (dfn[u] === low[u]) {\n      const comp = [];\n      while (true) { const x = stack.pop(); inStack.delete(x); comp.push(x); if (x === u) break; }\n      scc.push(comp);\n    }\n  }\n  for (const u in graph) if (!(u in dfn)) dfs(u);\n  return scc;\n}`,
      TypeScript: `function tarjan(graph: Record<string, string[]>): string[][] {\n  const dfn: Record<string, number> = {}, low: Record<string, number> = {};\n  const stack: string[] = [], inStack = new Set<string>(), scc: string[][] = [];\n  let time = 0;\n  function dfs(u: string) {\n    dfn[u] = low[u] = ++time;\n    stack.push(u); inStack.add(u);\n    for (const v of graph[u]) {\n      if (!(v in dfn)) { dfs(v); low[u] = Math.min(low[u], low[v]); }\n      else if (inStack.has(v)) low[u] = Math.min(low[u], dfn[v]);\n    }\n    if (dfn[u] === low[u]) {\n      const comp: string[] = [];\n      while (true) { const x = stack.pop()!; inStack.delete(x); comp.push(x); if (x === u) break; }\n      scc.push(comp);\n    }\n  }\n  for (const u in graph) if (!(u in dfn)) dfs(u);\n  return scc;\n}`,
      Java: `import java.util.*;\nclass Tarjan {\n    int time = 0;\n    Map<String, Integer> dfn = new HashMap<>(), low = new HashMap<>();\n    Deque<String> stack = new ArrayDeque<>();\n    Set<String> inStack = new HashSet<>();\n    List<List<String>> scc = new ArrayList<>();\n    void dfs(Map<String, List<String>> g, String u) {\n        dfn.put(u, ++time); low.put(u, time);\n        stack.push(u); inStack.add(u);\n        for (String v : g.getOrDefault(u, List.of())) {\n            if (!dfn.containsKey(v)) { dfs(g, v); low.put(u, Math.min(low.get(u), low.get(v))); }\n            else if (inStack.contains(v)) low.put(u, Math.min(low.get(u), dfn.get(v)));\n        }\n        if (dfn.get(u).equals(low.get(u))) {\n            List<String> comp = new ArrayList<>();\n            while (true) { String x = stack.pop(); inStack.remove(x); comp.add(x); if (x.equals(u)) break; }\n            scc.add(comp);\n        }\n    }\n}`,
    },
  } as const

  return [
    { lang: 'C', code: map[kind].C },
    { lang: 'Python', code: map[kind].Python },
    { lang: 'JavaScript', code: map[kind].JavaScript },
    { lang: 'TypeScript', code: map[kind].TypeScript },
    { lang: 'Java', code: map[kind].Java },
  ] satisfies CodeEntry[]
}

// ==================== Dijkstra ====================

function dijkstra(): AlgorithmContent {
  return {
    title: 'Dijkstra 最短路径算法',
    description: [
      { type: 'text', content: 'Dijkstra 算法是求单源最短路径的经典贪心算法。从起点出发，每次选择当前距离最小的未访问节点，用它去「松弛」（更新）邻居的距离。' },
      { type: 'text', content: '限制：不能处理负权边。因为贪心策略假设「已确定的节点距离不会再变小」，负权边会打破这一假设。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [
        ['适用范围', '非负权有向/无向图'],
        ['贪心策略', '每次取 dist 最小的未访问节点'],
        ['核心操作', '松弛: if dist[u]+w < dist[v] then dist[v] = dist[u]+w'],
      ] } },
    ],
    approach: `**初始化**：dist[source] = 0，其余 dist[v] = ∞，所有节点标记为未访问。

**主循环**（重复 n 次）：
1. 从未访问节点中选 dist 最小的节点 u（贪心）
2. 标记 u 为已访问
3. 遍历 u 的所有邻居 v，尝试**松弛**：
   - 若 dist[u] + w(u,v) < dist[v]，则更新 dist[v] = dist[u] + w(u,v)
   - 记录 prev[v] = u（路径回溯用）

**为什么贪心有效？** 因为所有边权非负，当节点 u 被选中时，不可能再有更短的路径到达 u。`,
    complexity: { time: 'O(V² ) 朴素 / O((V+E)logV) 优先队列', space: 'O(V)' },
    animation: { type: 'graph', algorithm: 'dijkstra', nodes: NODES, edges: EDGES, source: 'A' },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#include <limits.h>
#define V 6
#define INF INT_MAX

// Dijkstra：朴素实现
void dijkstra(int graph[V][V], int src) {
    int dist[V], visited[V] = {0}, prev[V];
    for (int i = 0; i < V; i++) { dist[i] = INF; prev[i] = -1; }
    dist[src] = 0;

    for (int count = 0; count < V; count++) {
        // 贪心：选 dist 最小的未访问节点
        int u = -1;
        for (int v = 0; v < V; v++)
            if (!visited[v] && (u == -1 || dist[v] < dist[u])) u = v;
        visited[u] = 1;
        // 松弛所有邻居
        for (int v = 0; v < V; v++) {
            if (graph[u][v] && !visited[v] && dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];  // 松弛
                prev[v] = u;
            }
        }
    }
    for (int i = 0; i < V; i++)
        printf("%c: dist=%d\\n", 'A'+i, dist[i]);
}` },
      { lang: 'Python', code: `import heapq

def dijkstra(graph: dict, src: str) -> dict:
    """Dijkstra: 优先队列实现"""
    dist = {v: float('inf') for v in graph}
    dist[src] = 0
    prev = {v: None for v in graph}
    pq = [(0, src)]  # (距离, 节点)

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue  # 跳过过期条目
        # 松弛所有邻居
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w  # 松弛
                prev[v] = u
                heapq.heappush(pq, (dist[v], v))
    return dist

graph = {
    'A': [('B',4),('C',2)], 'B': [('C',1),('D',5)],
    'C': [('D',8),('E',10)], 'D': [('E',2),('F',6)],
    'E': [('F',3)], 'F': []
}
print(dijkstra(graph, 'A'))` },
      { lang: 'JavaScript', code: `function dijkstra(graph, src) {
  const dist = {}, visited = new Set(), prev = {};
  for (const v in graph) { dist[v] = Infinity; prev[v] = null; }
  dist[src] = 0;

  while (visited.size < Object.keys(graph).length) {
    // 贪心：选 dist 最小的未访问节点
    let u = null;
    for (const v in dist)
      if (!visited.has(v) && (u === null || dist[v] < dist[u])) u = v;
    visited.add(u);
    // 松弛邻居
    for (const [v, w] of graph[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
      }
    }
  }
  return dist;
}

const graph = {
  A:[['B',4],['C',2]], B:[['C',1],['D',5]],
  C:[['D',8],['E',10]], D:[['E',2],['F',6]],
  E:[['F',3]], F:[]
};
console.log(dijkstra(graph, 'A'));` },
      { lang: 'TypeScript', code: `type Graph = Record<string, [string, number][]>;

function dijkstra(graph: Graph, src: string): Record<string, number> {
  const dist: Record<string, number> = {};
  const visited = new Set<string>();
  for (const v in graph) dist[v] = Infinity;
  dist[src] = 0;

  while (visited.size < Object.keys(graph).length) {
    let u: string | null = null;
    for (const v in dist)
      if (!visited.has(v) && (u === null || dist[v] < dist[u])) u = v;
    visited.add(u!);
    for (const [v, w] of graph[u!]) {
      if (dist[u!] + w < dist[v]) dist[v] = dist[u!] + w;
    }
  }
  return dist;
}` },
      { lang: 'Java', code: `import java.util.*;

public class Dijkstra {
    public static Map<String, Integer> dijkstra(
        Map<String, List<int[]>> graph, String src) {
        Map<String, Integer> dist = new HashMap<>();
        Set<String> visited = new HashSet<>();
        for (String v : graph.keySet()) dist.put(v, Integer.MAX_VALUE);
        dist.put(src, 0);
        PriorityQueue<int[]> pq = new PriorityQueue<>((a,b)->a[1]-b[1]);
        pq.offer(new int[]{src.charAt(0), 0});
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            String u = String.valueOf((char)cur[0]);
            if (visited.contains(u)) continue;
            visited.add(u);
            for (int[] e : graph.getOrDefault(u, List.of())) {
                String v = String.valueOf((char)e[0]);
                int w = e[1];
                if (dist.get(u) + w < dist.get(v)) {
                    dist.put(v, dist.get(u) + w);
                    pq.offer(new int[]{e[0], dist.get(v)});
                }
            }
        }
        return dist;
    }
}` },
    ],
  }
}

// ==================== Bellman-Ford ====================

function bellmanFord(): AlgorithmContent {
  return {
    title: 'Bellman-Ford 最短路径算法',
    description: [
      { type: 'text', content: 'Bellman-Ford 算法也求单源最短路径，但能处理负权边，还能检测负权环。代价是比 Dijkstra 慢（O(VE)）。' },
      { type: 'text', content: '核心思想：最短路径最多经过 V-1 条边，所以对所有边做 V-1 轮松弛就够了。如果第 V 轮还能松弛，说明存在负权环。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [
        ['适用范围', '可处理负权边'],
        ['负权环检测', '第 V 轮还能松弛 → 有负权环'],
        ['核心操作', '对所有边重复 V-1 轮松弛'],
      ] } },
    ],
    approach: `**初始化**：dist[source] = 0，其余 = ∞

**主循环**（V-1 轮）：
每轮遍历所有边 (u, v, w)：
- 若 dist[u] + w < dist[v]，则 dist[v] = dist[u] + w（松弛）

**为什么 V-1 轮？**
最短路径最多经过 V-1 条边。第 k 轮松弛保证了经过 ≤k 条边的最短距离正确。

**负权环检测**：
第 V 轮再遍历所有边，若还能松弛，说明存在负权环（距离可以无限缩小）。`,
    complexity: { time: 'O(V * E)', space: 'O(V)' },
    animation: { type: 'graph', algorithm: 'bellman-ford', nodes: NODES, edges: EDGES, source: 'A' },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#include <limits.h>
#define V 6
#define E 9
#define INF INT_MAX

typedef struct { int u, v, w; } Edge;

// Bellman-Ford：V-1 轮松弛所有边
int bellmanFord(Edge edges[], int src, int dist[]) {
    for (int i = 0; i < V; i++) dist[i] = INF;
    dist[src] = 0;
    // V-1 轮松弛
    for (int round = 0; round < V - 1; round++) {
        for (int j = 0; j < E; j++) {
            int u = edges[j].u, v = edges[j].v, w = edges[j].w;
            if (dist[u] != INF && dist[u] + w < dist[v])
                dist[v] = dist[u] + w;  // 松弛
        }
    }
    // 检测负权环
    for (int j = 0; j < E; j++) {
        if (dist[edges[j].u] != INF &&
            dist[edges[j].u] + edges[j].w < dist[edges[j].v])
            return 0;  // 有负权环
    }
    return 1;
}` },
      { lang: 'Python', code: `def bellman_ford(nodes, edges, src):
    """Bellman-Ford: V-1 轮松弛所有边"""
    dist = {v: float('inf') for v in nodes}
    dist[src] = 0
    prev = {v: None for v in nodes}
    # V-1 轮松弛
    for _ in range(len(nodes) - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w  # 松弛
                prev[v] = u
    # 负权环检测
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            raise ValueError("存在负权环")
    return dist

nodes = ['A','B','C','D','E','F']
edges = [('A','B',4),('A','C',2),('B','C',1),('B','D',5),
         ('C','D',8),('C','E',10),('D','E',2),('D','F',6),('E','F',3)]
print(bellman_ford(nodes, edges, 'A'))` },
      { lang: 'JavaScript', code: `function bellmanFord(nodes, edges, src) {
  const dist = {}, prev = {};
  for (const v of nodes) { dist[v] = Infinity; prev[v] = null; }
  dist[src] = 0;
  // V-1 轮松弛
  for (let i = 0; i < nodes.length - 1; i++) {
    for (const [u, v, w] of edges) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
      }
    }
  }
  // 负权环检测
  for (const [u, v, w] of edges) {
    if (dist[u] + w < dist[v]) throw new Error("负权环");
  }
  return dist;
}` },
      { lang: 'TypeScript', code: `function bellmanFord(
  nodes: string[], edges: [string,string,number][], src: string
): Record<string, number> {
  const dist: Record<string, number> = {};
  for (const v of nodes) dist[v] = Infinity;
  dist[src] = 0;
  for (let i = 0; i < nodes.length - 1; i++) {
    for (const [u, v, w] of edges) {
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
  }
  for (const [u, v, w] of edges) {
    if (dist[u] + w < dist[v]) throw new Error("负权环");
  }
  return dist;
}` },
      { lang: 'Java', code: `import java.util.*;

public class BellmanFord {
    public static Map<String, Integer> solve(
        String[] nodes, int[][] edges, String[] names, int src) {
        int V = nodes.length;
        int[] dist = new int[V];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;
        for (int i = 0; i < V - 1; i++) {
            for (int[] e : edges) {
                if (dist[e[0]] != Integer.MAX_VALUE &&
                    dist[e[0]] + e[2] < dist[e[1]])
                    dist[e[1]] = dist[e[0]] + e[2];
            }
        }
        Map<String, Integer> result = new HashMap<>();
        for (int i = 0; i < V; i++) result.put(names[i], dist[i]);
        return result;
    }
}` },
    ],
  }
}

// ==================== Floyd-Warshall ====================

function floyd(): AlgorithmContent {
  return {
    title: 'Floyd-Warshall 全源最短路径算法',
    description: [
      { type: 'text', content: 'Floyd-Warshall 算法求所有点对之间的最短路径。三重循环，逐个引入「中间节点」来尝试缩短任意两点间的距离。' },
      { type: 'text', content: '能处理负权边（但不能有负权环）。适合节点数不多（V ≤ 几百）的稠密图。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [
        ['适用范围', '全源最短路径，可处理负权'],
        ['核心思想', '逐个引入中间节点 k 更新所有 (i,j) 对'],
        ['结果', 'V×V 的距离矩阵'],
      ] } },
    ],
    approach: `**初始化**：
dist[i][j] = w(i,j) 如果有边，否则 = ∞
dist[i][i] = 0

**三重循环**：
for k = 1 to V:       （中间节点）
  for i = 1 to V:     （起点）
    for j = 1 to V:   （终点）
      dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])

**直觉**：「从 i 到 j，要不要经过 k？」
经过 k 的距离 = dist[i][k] + dist[k][j]
不经过 k 的距离 = dist[i][j]
取较小值。`,
    complexity: { time: 'O(V³)', space: 'O(V²)' },
    animation: { type: 'graph', algorithm: 'floyd', nodes: FLOYD_NODES, edges: FLOYD_EDGES, source: '1' },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#define V 5
#define INF 99999

// Floyd-Warshall：三重循环
void floyd(int dist[V][V]) {
    // k = 中间节点
    for (int k = 0; k < V; k++)
        for (int i = 0; i < V; i++)
            for (int j = 0; j < V; j++)
                // 经过 k 是否更短？
                if (dist[i][k] + dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k] + dist[k][j];
}

int main() {
    int dist[V][V] = {
        {0,3,INF,7,INF}, {INF,0,2,5,INF},
        {INF,INF,0,INF,1}, {INF,INF,4,0,2},
        {INF,INF,INF,INF,0}
    };
    floyd(dist);
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++)
            printf("%4d", dist[i][j] >= INF ? -1 : dist[i][j]);
        printf("\\n");
    }
}` },
      { lang: 'Python', code: `def floyd_warshall(n: int, edges: list) -> list:
    """Floyd-Warshall: 三重循环"""
    INF = float('inf')
    dist = [[INF]*n for _ in range(n)]
    for i in range(n): dist[i][i] = 0
    for u, v, w in edges: dist[u][v] = w

    # k = 中间节点
    for k in range(n):
        for i in range(n):
            for j in range(n):
                # 经过 k 是否更短？
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    return dist

edges = [(0,1,3),(0,3,7),(1,2,2),(1,3,5),(2,4,1),(3,4,2),(3,2,4)]
result = floyd_warshall(5, edges)
for row in result: print(row)` },
      { lang: 'JavaScript', code: `function floydWarshall(n, edges) {
  const INF = Infinity;
  const dist = Array.from({length:n}, (_,i) =>
    Array.from({length:n}, (_,j) => i===j ? 0 : INF));
  for (const [u,v,w] of edges) dist[u][v] = w;

  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (dist[i][k] + dist[k][j] < dist[i][j])
          dist[i][j] = dist[i][k] + dist[k][j];
  return dist;
}

const edges = [[0,1,3],[0,3,7],[1,2,2],[1,3,5],[2,4,1],[3,4,2],[3,2,4]];
console.log(floydWarshall(5, edges));` },
      { lang: 'TypeScript', code: `function floydWarshall(n: number, edges: [number,number,number][]): number[][] {
  const dist = Array.from({length:n}, (_,i) =>
    Array.from({length:n}, (_,j) => i===j ? 0 : Infinity));
  for (const [u,v,w] of edges) dist[u][v] = w;

  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (dist[i][k] + dist[k][j] < dist[i][j])
          dist[i][j] = dist[i][k] + dist[k][j];
  return dist;
}` },
      { lang: 'Java', code: `public class FloydWarshall {
    static final int INF = 99999;
    public static void floyd(int[][] dist, int V) {
        for (int k = 0; k < V; k++)
            for (int i = 0; i < V; i++)
                for (int j = 0; j < V; j++)
                    if (dist[i][k] + dist[k][j] < dist[i][j])
                        dist[i][j] = dist[i][k] + dist[k][j];
    }
    public static void main(String[] args) {
        int[][] dist = {
            {0,3,INF,7,INF}, {INF,0,2,5,INF},
            {INF,INF,0,INF,1}, {INF,INF,4,0,2},
            {INF,INF,INF,INF,0}
        };
        floyd(dist, 5);
        for (int[] row : dist) {
            for (int v : row) System.out.printf("%4d", v>=INF?-1:v);
            System.out.println();
        }
    }
}` },
    ],
  }
}

// ==================== SPFA ====================

function spfa(): AlgorithmContent {
  return {
    title: 'SPFA（队列优化 Bellman-Ford）',
    description: [
      { type: 'text', content: 'SPFA 是 Bellman-Ford 的队列优化版。只有距离被更新过的节点，其邻居才可能被进一步松弛，用队列维护「待处理」节点，避免每轮暴力遍历全部边。' },
      { type: 'text', content: '平均 O(kE)，但最坏退化到 O(VE)。能处理负权边，某节点入队超过 V 次说明有负权环。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['本质', 'BF + 队列优化'], ['负权', '支持'], ['负权环', '入队次数 > V']] } },
    ],
    approach: `**初始化**：dist[source]=0，其余=∞，source 入队。

**主循环**：
1. 队首取出 u，标记不在队中
2. 松弛 u 的邻居 v：若 dist[u]+w < dist[v] 则更新
3. 若 v 不在队中，入队
4. 队空结束

**vs Bellman-Ford**：BF 每轮遍历全部边，SPFA 只处理被更新过的节点。`,
    complexity: { time: '平均 O(kE)，最坏 O(VE)', space: 'O(V)' },
    animation: { type: 'graph', algorithm: 'spfa', nodes: NODES, edges: EDGES, source: 'A' },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#include <limits.h>
#define V 6
#define INF INT_MAX

void spfa(int adj[V][V], int src) {
    int dist[V], inQ[V]={0}, queue[V*V], h=0, t=0;
    for(int i=0;i<V;i++) dist[i]=INF;
    dist[src]=0; queue[t++]=src; inQ[src]=1;
    while(h<t) {
        int u=queue[h++]; inQ[u]=0;
        for(int v=0;v<V;v++) {
            if(adj[u][v] && dist[u]+adj[u][v]<dist[v]) {
                dist[v]=dist[u]+adj[u][v];
                if(!inQ[v]){queue[t++]=v;inQ[v]=1;}
            }
        }
    }
    for(int i=0;i<V;i++) printf("%c:%d\\n",'A'+i,dist[i]);
}` },
      { lang: 'Python', code: `from collections import deque


def spfa(graph, src):
    dist = {v: float('inf') for v in graph}
    in_q = {v: False for v in graph}

    dist[src] = 0
    q = deque([src])
    in_q[src] = True

    while q:
        u = q.popleft()
        in_q[u] = False

        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                if not in_q[v]:
                    q.append(v)
                    in_q[v] = True

    return dist


graph = {
    'A': [('B', 4), ('C', 2)],
    'B': [('C', 1), ('D', 5)],
    'C': [('D', 8), ('E', 10)],
    'D': [('E', 2), ('F', 6)],
    'E': [('F', 3)],
    'F': [],
}

print(spfa(graph, 'A'))` },
      { lang: 'JavaScript', code: `function spfa(graph, src) {
  const dist = {}, inQ = {};
  for (const v in graph) { dist[v]=Infinity; inQ[v]=false; }
  dist[src]=0; const q=[src]; inQ[src]=true;
  while (q.length) {
    const u=q.shift(); inQ[u]=false;
    for (const [v,w] of graph[u]) {
      if (dist[u]+w < dist[v]) {
        dist[v]=dist[u]+w;
        if (!inQ[v]) { q.push(v); inQ[v]=true; }
      }
    }
  }
  return dist;
}` },
      { lang: 'TypeScript', code: `function spfa(graph: Record<string,[string,number][]>, src: string) {
  const dist: Record<string,number> = {}, inQ: Record<string,boolean> = {};
  for (const v in graph) { dist[v]=Infinity; inQ[v]=false; }
  dist[src]=0; const q=[src]; inQ[src]=true;
  while (q.length) {
    const u=q.shift()!; inQ[u]=false;
    for (const [v,w] of graph[u]) {
      if (dist[u]+w<dist[v]) { dist[v]=dist[u]+w; if(!inQ[v]){q.push(v);inQ[v]=true;} }
    }
  }
  return dist;
}` },
      { lang: 'Java', code: `import java.util.*;
public class SPFA {
    public static Map<String,Integer> spfa(Map<String,List<int[]>> g, String src) {
        var dist = new HashMap<String,Integer>();
        var inQ = new HashSet<String>();
        for (var v : g.keySet()) dist.put(v, Integer.MAX_VALUE);
        dist.put(src,0); var q = new LinkedList<String>();
        q.add(src); inQ.add(src);
        while (!q.isEmpty()) {
            String u=q.poll(); inQ.remove(u);
            for (var e : g.getOrDefault(u,List.of())) {
                String v=String.valueOf((char)e[0]); int w=e[1];
                if (dist.get(u)+w<dist.get(v)) {
                    dist.put(v,dist.get(u)+w);
                    if (!inQ.contains(v)){q.add(v);inQ.add(v);}
                }
            }
        }
        return dist;
    }
}` },
    ],
  }
}

// ==================== A* ====================

const ASTAR_GRID = [
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,1,0,0,1,0,0],
  [0,0,1,0,1,0,0,1,0,0],
  [0,0,1,0,0,0,0,1,0,0],
  [0,0,0,0,0,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
]

function astar(): AlgorithmContent {
  return {
    title: 'A* 启发式最短路径算法',
    description: [
      { type: 'text', content: 'A* 是 Dijkstra 的启发式扩展。选择下一个节点时，不仅看已走距离 g(n)，还加上到目标的预估距离 h(n)，优先探索最有希望的方向。' },
      { type: 'text', content: 'h(n)=0 时退化为 Dijkstra。h(n) 越接近真实距离效率越高。常用曼哈顿距离、欧几里得距离。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['核心', 'f(n)=g(n)+h(n)'], ['g(n)', '起点到 n 实际距离'], ['h(n)', '启发估计（不高估）'], ['场景', '游戏寻路、地图导航']] } },
    ],
    approach: `**f(n) = g(n) + h(n)**

**流程**：
1. 起点入 open 集（按 f 排序的优先队列）
2. 取 f 最小的节点 n：
   - n == 终点 → 回溯路径
   - n 移入 closed 集
   - 遍历 n 的四方向邻居，计算 g' = g(n)+1
   - 若更优则更新，入 open
3. open 空 → 无路径

**vs Dijkstra**：Dijkstra 向所有方向均匀扩展（圆形），A* 被 h(n) 引导朝目标扩展（椭圆形），探索节点少。`,
    complexity: { time: '取决于 h 质量，最优 O(E)', space: 'O(V)' },
    animation: { type: 'graph', algorithm: 'astar', nodes: [], edges: [], source: '0,0', goal: '6,9', grid: ASTAR_GRID },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#include <stdlib.h>
#define ROWS 7
#define COLS 10

typedef struct { int r,c,g,f; } Node;
int h(int r,int c,int er,int ec){return abs(r-er)+abs(c-ec);}

int astar(int grid[ROWS][COLS],int sr,int sc,int er,int ec){
    int cl[ROWS][COLS]={0},g[ROWS][COLS];
    for(int i=0;i<ROWS;i++)for(int j=0;j<COLS;j++)g[i][j]=99999;
    g[sr][sc]=0;
    Node op[ROWS*COLS]; int n=0;
    op[n++]=(Node){sr,sc,0,h(sr,sc,er,ec)};
    int dr[]={-1,1,0,0},dc[]={0,0,-1,1};
    while(n>0){
        int mi=0; for(int i=1;i<n;i++) if(op[i].f<op[mi].f)mi=i;
        Node cur=op[mi]; op[mi]=op[--n];
        if(cur.r==er&&cur.c==ec)return cur.g;
        if(cl[cur.r][cur.c])continue;
        cl[cur.r][cur.c]=1;
        for(int d=0;d<4;d++){
            int nr=cur.r+dr[d],nc=cur.c+dc[d];
            if(nr<0||nr>=ROWS||nc<0||nc>=COLS||grid[nr][nc]||cl[nr][nc])continue;
            int ng=cur.g+1;
            if(ng<g[nr][nc]){g[nr][nc]=ng;op[n++]=(Node){nr,nc,ng,ng+h(nr,nc,er,ec)};}
        }
    }
    return -1;
}` },
      { lang: 'Python', code: `import heapq

def astar(grid, start, end):
    rows, cols = len(grid), len(grid[0])
    sr, sc = start; er, ec = end
    h = lambda r,c: abs(r-er)+abs(c-ec)
    g = {(sr,sc): 0}
    pq = [(h(sr,sc), sr, sc)]
    closed = set(); prev = {}
    while pq:
        f, r, c = heapq.heappop(pq)
        if (r,c)==(er,ec):
            path = []; 
            while (r,c) in prev: path.append((r,c)); r,c=prev[(r,c)]
            path.append(start); return path[::-1]
        if (r,c) in closed: continue
        closed.add((r,c))
        for dr,dc in [(-1,0),(1,0),(0,-1),(0,1)]:
            nr,nc = r+dr,c+dc
            if 0<=nr<rows and 0<=nc<cols and grid[nr][nc]==0 and (nr,nc) not in closed:
                ng = g[(r,c)]+1
                if ng < g.get((nr,nc), float('inf')):
                    g[(nr,nc)]=ng; prev[(nr,nc)]=(r,c)
                    heapq.heappush(pq, (ng+h(nr,nc), nr, nc))
    return None

grid = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,1,1,0,0,0,0,0],[0,0,0,0,1,0,0,1,0,0],
        [0,0,1,0,1,0,0,1,0,0],[0,0,1,0,0,0,0,1,0,0],[0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]]
print(astar(grid,(0,0),(6,9)))` },
      { lang: 'JavaScript', code: `function astar(grid, start, end) {
  const [sr,sc]=start,[er,ec]=end,rows=grid.length,cols=grid[0].length;
  const h=(r,c)=>Math.abs(r-er)+Math.abs(c-ec);
  const g={}, closed=new Set(), prev={}, key=(r,c)=>r+','+c;
  g[key(sr,sc)]=0;
  const open=[{r:sr,c:sc,f:h(sr,sc)}];
  while(open.length){
    open.sort((a,b)=>a.f-b.f);
    const {r,c}=open.shift(), k=key(r,c);
    if(r===er&&c===ec){ // 回溯路径
      const path=[k]; let cur=k;
      while(prev[cur]){cur=prev[cur];path.unshift(cur);} return path;
    }
    if(closed.has(k))continue; closed.add(k);
    for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
      const nr=r+dr,nc=c+dc,nk=key(nr,nc);
      if(nr<0||nr>=rows||nc<0||nc>=cols||grid[nr][nc]||closed.has(nk))continue;
      const ng=g[k]+1;
      if(ng<(g[nk]??Infinity)){g[nk]=ng;prev[nk]=k;open.push({r:nr,c:nc,f:ng+h(nr,nc)});}
    }
  }
  return null;
}` },
      { lang: 'TypeScript', code: `function astar(grid:number[][],start:[number,number],end:[number,number]) {
  const [sr,sc]=start,[er,ec]=end;
  const h=(r:number,c:number)=>Math.abs(r-er)+Math.abs(c-ec);
  const g:Record<string,number>={},closed=new Set<string>(),prev:Record<string,string>={};
  const key=(r:number,c:number)=>\`\${r},\${c}\`;
  g[key(sr,sc)]=0;
  const open=[{r:sr,c:sc,f:h(sr,sc)}];
  while(open.length){
    open.sort((a,b)=>a.f-b.f);
    const {r,c}=open.shift()!,k=key(r,c);
    if(r===er&&c===ec){const p=[k];let c2=k;while(prev[c2]){c2=prev[c2];p.unshift(c2);}return p;}
    if(closed.has(k))continue; closed.add(k);
    for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
      const nr=r+dr,nc=c+dc,nk=key(nr,nc);
      if(nr<0||nr>=grid.length||nc<0||nc>=grid[0].length||grid[nr][nc]||closed.has(nk))continue;
      const ng=g[k]+1;
      if(ng<(g[nk]??Infinity)){g[nk]=ng;prev[nk]=k;open.push({r:nr,c:nc,f:ng+h(nr,nc)});}
    }
  }
  return null;
}` },
      { lang: 'Java', code: `import java.util.*;
public class AStar {
    static int[] dr={-1,1,0,0},dc={0,0,-1,1};
    public static List<int[]> solve(int[][] grid,int[] s,int[] e){
        int rows=grid.length,cols=grid[0].length,er=e[0],ec=e[1];
        var g=new HashMap<String,Integer>();
        var prev=new HashMap<String,String>();
        var closed=new HashSet<String>();
        var pq=new PriorityQueue<int[]>(Comparator.comparingInt(a->a[2]));
        String sk=s[0]+","+s[1]; g.put(sk,0);
        pq.offer(new int[]{s[0],s[1],Math.abs(s[0]-er)+Math.abs(s[1]-ec)});
        while(!pq.isEmpty()){
            int[] c=pq.poll(); String k=c[0]+","+c[1];
            if(c[0]==er&&c[1]==ec){var p=new ArrayList<int[]>();String x=k;
                while(x!=null){var a=x.split(",");p.add(0,new int[]{Integer.parseInt(a[0]),Integer.parseInt(a[1])});x=prev.get(x);}return p;}
            if(closed.contains(k))continue; closed.add(k);
            for(int d=0;d<4;d++){int nr=c[0]+dr[d],nc=c[1]+dc[d];
                if(nr<0||nr>=rows||nc<0||nc>=cols||grid[nr][nc]==1)continue;
                String nk=nr+","+nc; if(closed.contains(nk))continue;
                int ng=g.get(k)+1;
                if(ng<g.getOrDefault(nk,Integer.MAX_VALUE)){g.put(nk,ng);prev.put(nk,k);
                    pq.offer(new int[]{nr,nc,ng+Math.abs(nr-er)+Math.abs(nc-ec)});}}
        }
        return null;
    }
}` },
    ],
  }
}
