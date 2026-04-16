import type { AlgorithmNode, AlgorithmContent, CodeEntry, TreeSnapshot } from './algorithms'

export function treeAlgorithms(): AlgorithmNode[] {
  return [
    {
      id: 'tree-search',
      label: '搜索树',
      children: [
        { id: 'tree-bst', label: '二叉搜索树', content: bst() },
        { id: 'tree-avl', label: 'AVL 树', content: avl() },
        { id: 'tree-red-black', label: '红黑树', content: redBlackTree() },
      ],
    },
    {
      id: 'tree-multiway',
      label: '多路树与索引结构',
      children: [
        { id: 'tree-b-tree', label: 'B 树', content: bTree() },
        { id: 'tree-b-plus', label: 'B+ 树', content: bPlusTree() },
        { id: 'tree-trie', label: 'Trie', content: trie() },
        { id: 'tree-skip-list', label: '跳表', content: skipList() },
      ],
    },
    {
      id: 'tree-range',
      label: '树状区间结构',
      children: [
        { id: 'tree-segment', label: '线段树', content: segmentTree() },
        { id: 'tree-fenwick', label: '树状数组', content: fenwickTree() },
      ],
    },
    {
      id: 'tree-disjoint',
      label: '集合结构',
      children: [
        { id: 'tree-union-find', label: '并查集', content: unionFind() },
        { id: 'tree-hash-table', label: '哈希表', content: hashTable() },
        { id: 'tree-lru-cache', label: 'LRU 缓存', content: lruCache() },
        { id: 'tree-heap', label: '堆 / 优先队列', content: heap() },
      ],
    },
  ]
}

function bst(): AlgorithmContent {
  return {
    title: '二叉搜索树 BST',
    description: [
      { type: 'text', content: 'BST 满足左子树键值小于根、右子树键值大于根。这里重点演示从空树开始，插入每个键后结构如何变化。' },
      { type: 'table', table: { headers: ['操作', '平均复杂度'], rows: [['查找', 'O(log n)'], ['插入', 'O(log n)'], ['最坏退化', 'O(n)']] } },
    ],
    approach: `**核心不变量**：每个节点左边都比它小，右边都比它大。

**构建过程**：
1. 从根开始比较
2. 小则向左，大则向右
3. 走到空位后创建新节点

**理解重点**：树是“一个一个插进去长出来的”，不是凭空生成最终结构。`,
    complexity: { time: '平均 O(log n)，最坏 O(n)', space: 'O(h)' },
    animation: { type: 'tree-structure', algorithm: 'bst', snapshots: bstSnapshots() },
    codes: treeCodes('bst'),
  }
}

function avl(): AlgorithmContent {
  return {
    title: 'AVL 树',
    description: [
      { type: 'text', content: 'AVL 是严格平衡的二叉搜索树。这里不只展示旋转结果，也展示“插入到哪里、何时失衡、为什么要旋转”。' },
      { type: 'table', table: { headers: ['失衡类型', '修复方式'], rows: [['LL', '右旋'], ['RR', '左旋'], ['LR', '先左后右'], ['RL', '先右后左']] } },
    ],
    approach: `**核心思想**：插入后自底向上检查平衡因子。

一旦某个节点左右子树高度差超过 1，就要旋转修复。

**理解重点**：旋转是对构建过程中局部形状的修正，而不是重建整棵树。`,
    complexity: { time: 'O(log n)', space: 'O(h)' },
    animation: { type: 'tree-structure', algorithm: 'avl', snapshots: avlSnapshots() },
    codes: treeCodes('avl'),
  }
}

function redBlackTree(): AlgorithmContent {
  return {
    title: '红黑树',
    description: [
      { type: 'text', content: '红黑树通过“颜色约束 + 旋转 + 染色”维持近似平衡。这里重点展示插入一个键以后，树如何逐步修复。' },
      { type: 'table', table: { headers: ['规则', '含义'], rows: [['根为黑', '根节点必须是黑色'], ['红节点限制', '红节点不能有红孩子'], ['黑高一致', '从任一点到叶子的黑节点数相同']] } },
    ],
    approach: `**插入通常先染红**，然后根据叔叔颜色决定是染色上推还是旋转修复。

**理解重点**：红黑树追求的是“近似平衡”，构建过程中每次修复都只影响局部。`,
    complexity: { time: 'O(log n)', space: 'O(h)' },
    animation: { type: 'tree-structure', algorithm: 'red-black-tree', snapshots: redBlackSnapshots() },
    codes: treeCodes('red-black-tree'),
  }
}

function bTree(): AlgorithmContent {
  return {
    title: 'B 树',
    description: [
      { type: 'text', content: 'B 树是多路平衡搜索树，内部节点既存键也存数据位置。重点是节点满了以后如何分裂，以及分隔键如何提升到父节点。' },
      { type: 'table', table: { headers: ['特点', '作用'], rows: [['多路分叉', '降低树高'], ['节点分裂', '保持平衡'], ['内部节点也存键', '与 B+ 树不同']] } },
    ],
    approach: `**构建关键点**：
1. 插入到目标叶子
2. 节点满了就分裂
3. 中间键提升到父节点
4. 父节点满了则继续向上分裂

**理解重点**：提升的是中间键，它在 B 树里留在父节点中。`,
    complexity: { time: 'O(log_m n)', space: 'O(n)' },
    animation: { type: 'tree-structure', algorithm: 'b-tree', snapshots: bTreeSnapshots() },
    codes: treeCodes('b-tree'),
  }
}

function bPlusTree(): AlgorithmContent {
  return {
    title: 'B+ 树',
    description: [
      { type: 'text', content: 'B+ 树是数据库和文件系统常见索引结构。这里重点演示叶子分裂、父节点导航键更新，以及叶子链的构建。' },
      { type: 'table', table: { headers: ['特点', '作用'], rows: [['多路分叉', '降低树高，减少 I/O'], ['叶子链表', '支持范围查询'], ['内部节点仅导航', '更高扇出']] } },
    ],
    approach: `**构建过程**：
1. 先定位到目标叶子
2. 插入键值
3. 叶子满则分裂
4. 把分隔键复制到父节点作导航
5. 保持叶子之间的有序链表

**理解重点**：范围查询主要靠叶子链，不靠回到内部节点。`,
    complexity: { time: 'O(log_m n)', space: 'O(n)' },
    animation: { type: 'tree-structure', algorithm: 'b-plus-tree', snapshots: bPlusSnapshots() },
    codes: treeCodes('b-plus-tree'),
  }
}

function trie(): AlgorithmContent {
  return {
    title: 'Trie 字典树',
    description: [
      { type: 'text', content: 'Trie 用公共前缀共享路径的方式存储字符串。这里重点演示多个单词是如何一层层插入并共用前缀的。' },
      { type: 'table', table: { headers: ['操作', '复杂度'], rows: [['插入', 'O(L)'], ['查找', 'O(L)'], ['前缀查询', 'O(L)']] } },
    ],
    approach: `**构建过程**：
1. 从根开始逐字符向下走
2. 没有对应孩子就创建节点
3. 字符串结束处打上结束标记

**理解重点**：多单词共享前缀时，结构不会重复造分支。`,
    complexity: { time: 'O(L)', space: '与字符总数相关' },
    animation: { type: 'tree-structure', algorithm: 'trie', snapshots: trieSnapshots() },
    codes: treeCodes('trie'),
  }
}

function segmentTree(): AlgorithmContent {
  return {
    title: '线段树',
    description: [
      { type: 'text', content: '线段树通过不断二分区间来构建。这里重点展示从叶子往上合并，树是如何建出来的。' },
      { type: 'table', table: { headers: ['操作', '复杂度'], rows: [['建树', 'O(n)'], ['区间查询', 'O(log n)'], ['单点更新', 'O(log n)']] } },
    ],
    approach: `**构建过程**：
1. 叶子节点对应原数组单点
2. 父节点由左右孩子合并得到
3. 一直向上直到根

**理解重点**：线段树本质上是在缓存各层区间的合并结果。`,
    complexity: { time: '查询/更新 O(log n)', space: 'O(n)' },
    animation: { type: 'tree-structure', algorithm: 'segment-tree', snapshots: segmentTreeSnapshots() },
    codes: treeCodes('segment-tree'),
  }
}

function fenwickTree(): AlgorithmContent {
  return {
    title: '树状数组',
    description: [
      { type: 'text', content: '树状数组（Fenwick Tree）用数组模拟一棵隐式树，适合做前缀和查询与单点更新。重点在于 lowbit 如何决定每个节点负责的区间。' },
      { type: 'table', table: { headers: ['操作', '复杂度'], rows: [['前缀和', 'O(log n)'], ['单点更新', 'O(log n)'], ['空间', 'O(n)']] } },
    ],
    approach: `**核心思想**：tree[i] 维护一个以 i 结尾、长度为 lowbit(i) 的区间和。

**构建/更新**：
每次给位置 i 加值时，沿 i += lowbit(i) 向上跳，把受影响的节点都更新一遍。`,
    complexity: { time: 'O(log n)', space: 'O(n)' },
    animation: { type: 'tree-structure', algorithm: 'fenwick-tree', snapshots: fenwickSnapshots() },
    codes: treeCodes('fenwick-tree'),
  }
}

function unionFind(): AlgorithmContent {
  return {
    title: '并查集',
    description: [
      { type: 'text', content: '并查集用来维护若干不相交集合。重点不是一棵静态树，而是 parent 数组在合并和路径压缩后如何演变。' },
      { type: 'table', table: { headers: ['技巧', '作用'], rows: [['路径压缩', '加速 find'], ['按秩合并', '避免树太高']] } },
    ],
    approach: `**核心操作**：
1. find(x)：找到集合代表元
2. union(a,b)：把两个集合连接起来

**理解重点**：路径压缩会在查找时把沿途节点直接挂到根上，后续查询更快。`,
    complexity: { time: '均摊接近 O(1)', space: 'O(n)' },
    animation: { type: 'tree-structure', algorithm: 'union-find', snapshots: unionFindSnapshots() },
    codes: treeCodes('union-find'),
  }
}

function skipList(): AlgorithmContent {
  return {
    title: '跳表',
    description: [
      { type: 'text', content: '跳表用多层有序链表模拟平衡搜索结构。高层负责“跳着找”，底层负责精确定位。' },
      { type: 'table', table: { headers: ['特性', '作用'], rows: [['多层索引', '加速查找'], ['底层有序链表', '保证完整数据'], ['期望复杂度', 'O(log n)']] } },
    ],
    approach: `**核心思想**：在有序链表之上再叠加若干稀疏索引层。

查找时先在高层快速跳跃，发现再往前会超过目标时，就下降一层继续找。`,
    complexity: { time: '期望 O(log n)', space: 'O(n)' },
    animation: { type: 'tree-structure', algorithm: 'skip-list', snapshots: skipListSnapshots() },
    codes: treeCodes('skip-list'),
  }
}

function hashTable(): AlgorithmContent {
  return {
    title: '哈希表（拉链法）',
    description: [
      { type: 'text', content: '哈希表通过哈希函数把键映射到桶。这里重点展示建表过程、冲突和拉链。' },
      { type: 'table', table: { headers: ['概念', '说明'], rows: [['桶', '哈希槽位'], ['冲突处理', '拉链法'], ['平均复杂度', 'O(1)']] } },
    ],
    approach: `**核心思想**：先算桶位置，再处理冲突。

若两个键算到同一槽位，就把它们挂到同一条链表上。`,
    complexity: { time: '平均 O(1)，最坏 O(n)', space: 'O(n)' },
    animation: { type: 'tree-structure', algorithm: 'hash-table', snapshots: hashTableSnapshots() },
    codes: treeCodes('hash-table'),
  }
}

function lruCache(): AlgorithmContent {
  return {
    title: 'LRU 缓存',
    description: [
      { type: 'text', content: 'LRU 缓存保留最近访问的数据，淘汰最久未使用的数据。核心结构是“哈希表 + 双向链表”。' },
      { type: 'table', table: { headers: ['操作', '目标复杂度'], rows: [['get', 'O(1)'], ['put', 'O(1)'], ['淘汰', '删除尾部旧节点']] } },
    ],
    approach: `**哈希表**负责 O(1) 定位节点，**双向链表**负责维护最近使用顺序。

每次访问或写入都把节点移到表头，超容量时删除表尾。`,
    complexity: { time: 'O(1)', space: 'O(capacity)' },
    animation: { type: 'tree-structure', algorithm: 'lru-cache', snapshots: lruSnapshots() },
    codes: treeCodes('lru-cache'),
  }
}

function heap(): AlgorithmContent {
  return {
    title: '堆 / 优先队列',
    description: [
      { type: 'text', content: '堆是一棵满足堆序性质的完全二叉树。这里重点展示插入上浮和删除堆顶后的下沉。' },
      { type: 'table', table: { headers: ['类型', '性质'], rows: [['大顶堆', '父节点 >= 子节点'], ['小顶堆', '父节点 <= 子节点'], ['典型用途', '优先队列、TopK']] } },
    ],
    approach: `**插入**：先放到数组末尾，再不断与父节点比较并上浮。

**删除堆顶**：用最后一个元素顶上去，再不断向下沉到正确位置。`,
    complexity: { time: '插入/删除 O(log n)', space: 'O(n)' },
    animation: { type: 'tree-structure', algorithm: 'heap', snapshots: heapSnapshots() },
    codes: treeCodes('heap'),
  }
}

function bstSnapshots(): TreeSnapshot[] {
  return [
    {
      title: '从空树插入 8',
      desc: '第一个键直接成为根节点。',
      nodes: [{ id: '8', label: '8', x: 280, y: 50, color: 'green' }],
      edges: [],
      highlightNodeIds: ['8'],
      sideNote: '构建从空树开始。',
    },
    {
      title: '插入 3',
      desc: '3 < 8，所以挂到 8 的左边。',
      nodes: [{ id: '8', label: '8', x: 280, y: 40 }, { id: '3', label: '3', x: 180, y: 130, color: 'green' }],
      edges: [{ from: '8', to: '3' }],
      highlightEdgeKeys: ['8->3'],
      sideNote: '比较一次就确定插入方向。',
    },
    {
      title: '插入 10',
      desc: '10 > 8，所以挂到右边。',
      nodes: [{ id: '8', label: '8', x: 280, y: 40 }, { id: '3', label: '3', x: 180, y: 130 }, { id: '10', label: '10', x: 380, y: 130, color: 'green' }],
      edges: [{ from: '8', to: '3' }, { from: '8', to: '10' }],
      highlightEdgeKeys: ['8->10'],
      sideNote: '根的左右子树逐渐形成。',
    },
    {
      title: '继续插入到 10 个节点',
      desc: '插入 1、6、14、4、7、13、9 后，BST 已经长成一棵较完整的搜索树。',
      nodes: [
        { id: '8', label: '8', x: 280, y: 30 },
        { id: '3', label: '3', x: 160, y: 95 },
        { id: '10', label: '10', x: 400, y: 95 },
        { id: '1', label: '1', x: 90, y: 160 },
        { id: '6', label: '6', x: 230, y: 160 },
        { id: '14', label: '14', x: 470, y: 160 },
        { id: '4', label: '4', x: 180, y: 225 },
        { id: '7', label: '7', x: 280, y: 225 },
        { id: '13', label: '13', x: 420, y: 225 },
        { id: '9', label: '9', x: 350, y: 160, color: 'green' },
      ],
      edges: [
        { from: '8', to: '3' },
        { from: '8', to: '10' },
        { from: '3', to: '1' },
        { from: '3', to: '6' },
        { from: '6', to: '4' },
        { from: '6', to: '7' },
        { from: '10', to: '9' },
        { from: '10', to: '14' },
        { from: '14', to: '13' },
      ],
      highlightNodeIds: ['9'],
      sideNote: '新插入的 9 路径为 8 -> 10 -> 左侧空位。',
    },
  ]
}

function avlSnapshots(): TreeSnapshot[] {
  return [
    {
      title: '插入 30',
      desc: '空树时，30 直接成为根。',
      nodes: [{ id: '30', label: '30', x: 300, y: 50, color: 'green' }],
      edges: [],
      highlightNodeIds: ['30'],
    },
    {
      title: '插入 20',
      desc: '20 挂到 30 左侧，仍然平衡。',
      nodes: [{ id: '30', label: '30', x: 300, y: 40 }, { id: '20', label: '20', x: 220, y: 130, color: 'green' }],
      edges: [{ from: '30', to: '20' }],
      highlightEdgeKeys: ['30->20'],
    },
    {
      title: '插入 10 后出现 LL 失衡',
      desc: '30 左子树过高，形成 LL 结构。',
      nodes: [{ id: '30', label: '30', x: 300, y: 40 }, { id: '20', label: '20', x: 220, y: 120 }, { id: '10', label: '10', x: 140, y: 200, color: 'red' }],
      edges: [{ from: '30', to: '20' }, { from: '20', to: '10' }],
      highlightNodeIds: ['30', '20', '10'],
      sideNote: '平衡因子在 30 处变成 +2，需要右旋。',
    },
    {
      title: '继续插入直到形成 10 节点平衡树',
      desc: '再插入 25、40、5、15、35、50、27 后，树始终通过局部旋转保持平衡。',
      nodes: [
        { id: '20', label: '20', x: 280, y: 30, color: 'green' },
        { id: '10', label: '10', x: 160, y: 95 },
        { id: '30', label: '30', x: 400, y: 95 },
        { id: '5', label: '5', x: 100, y: 160 },
        { id: '15', label: '15', x: 220, y: 160 },
        { id: '25', label: '25', x: 340, y: 160 },
        { id: '40', label: '40', x: 460, y: 160 },
        { id: '27', label: '27', x: 380, y: 225 },
        { id: '35', label: '35', x: 430, y: 225 },
        { id: '50', label: '50', x: 510, y: 225 },
      ],
      edges: [
        { from: '20', to: '10' },
        { from: '20', to: '30' },
        { from: '10', to: '5' },
        { from: '10', to: '15' },
        { from: '30', to: '25' },
        { from: '30', to: '40' },
        { from: '25', to: '27' },
        { from: '40', to: '35' },
        { from: '40', to: '50' },
      ],
      highlightNodeIds: ['20'],
      sideNote: '尽管插入顺序可能不利，AVL 最终高度仍保持在 O(log n)。',
    },
  ]
}

function redBlackSnapshots(): TreeSnapshot[] {
  return [
    {
      title: '插入 10，先作黑根',
      desc: '根节点必须是黑色。',
      nodes: [{ id: '10', label: '10', x: 280, y: 50, color: 'black' }],
      edges: [],
      highlightNodeIds: ['10'],
    },
    {
      title: '插入 5，默认染红',
      desc: '新节点通常先染红，此时没有破坏红黑性质。',
      nodes: [{ id: '10', label: '10', x: 280, y: 40, color: 'black' }, { id: '5', label: '5', x: 200, y: 130, color: 'red' }],
      edges: [{ from: '10', to: '5' }],
      highlightNodeIds: ['5'],
    },
    {
      title: '插入 1，出现红红冲突',
      desc: '5 与 1 连续为红，且叔叔为空视为黑。',
      nodes: [{ id: '10', label: '10', x: 280, y: 40, color: 'black' }, { id: '5', label: '5', x: 200, y: 120, color: 'red' }, { id: '1', label: '1', x: 120, y: 200, color: 'red' }],
      edges: [{ from: '10', to: '5' }, { from: '5', to: '1' }],
      highlightNodeIds: ['5', '1'],
      sideNote: '叔叔黑且成直线，需要旋转。',
    },
    {
      title: '继续插入到 10 个节点后的稳定形态',
      desc: '再插入 7、40、50、30、60、55、45 后，树通过旋转和染色维持近似平衡。',
      nodes: [
        { id: '10', label: '10', x: 280, y: 30, color: 'black' },
        { id: '5', label: '5', x: 160, y: 95, color: 'black' },
        { id: '40', label: '40', x: 400, y: 95, color: 'black' },
        { id: '1', label: '1', x: 100, y: 160, color: 'black' },
        { id: '7', label: '7', x: 220, y: 160, color: 'black' },
        { id: '30', label: '30', x: 340, y: 160, color: 'red' },
        { id: '50', label: '50', x: 460, y: 160, color: 'red' },
        { id: '45', label: '45', x: 410, y: 225, color: 'black' },
        { id: '60', label: '60', x: 510, y: 225, color: 'black' },
        { id: '55', label: '55', x: 480, y: 285, color: 'red' },
      ],
      edges: [
        { from: '10', to: '5' },
        { from: '10', to: '40' },
        { from: '5', to: '1' },
        { from: '5', to: '7' },
        { from: '40', to: '30' },
        { from: '40', to: '50' },
        { from: '50', to: '45' },
        { from: '50', to: '60' },
        { from: '60', to: '55' },
      ],
      highlightNodeIds: ['40', '50', '60'],
      sideNote: '红黑树允许局部不完全平衡，但通过颜色约束控制整体高度。',
    },
  ]
}

function bTreeSnapshots(): TreeSnapshot[] {
  return [
    {
      title: '插入 10、20、30 到同一节点',
      desc: '开始时所有键都先落在根节点中。',
      nodes: [{ id: 'R', label: '[10 | 20 | 30]', x: 280, y: 70, color: 'blue' }],
      edges: [],
      highlightNodeIds: ['R'],
    },
    {
      title: '插入 40 导致根节点分裂',
      desc: '中间键 20 提升成为新根。',
      nodes: [{ id: 'P', label: '[20]', x: 280, y: 40, color: 'blue' }, { id: 'L', label: '[10]', x: 180, y: 140, color: 'green' }, { id: 'R', label: '[30 | 40]', x: 380, y: 140, color: 'green' }],
      edges: [{ from: 'P', to: 'L' }, { from: 'P', to: 'R' }],
      highlightNodeIds: ['P'],
      sideNote: 'B 树提升的是中间键本身。',
    },
  ]
}

function bPlusSnapshots(): TreeSnapshot[] {
  return [
    {
      title: '先构建一个叶子页',
      desc: '插入 20、30、35 后，都还落在同一个叶子页中。',
      nodes: [{ id: 'L', label: '[20 | 30 | 35]', x: 280, y: 120, color: 'green' }],
      edges: [],
      highlightNodeIds: ['L'],
    },
    {
      title: '插入 25，叶子页已满',
      desc: '25 应插入这个叶子，但插入后需要分裂。',
      nodes: [{ id: 'R', label: '[20 | 40]', x: 280, y: 30, color: 'blue' }, { id: 'L1', label: '[5 | 10 | 15]', x: 120, y: 140, color: 'green' }, { id: 'L2', label: '[20 | 30 | 35]', x: 280, y: 140, color: 'green' }, { id: 'L3', label: '[40 | 50]', x: 440, y: 140, color: 'green' }],
      edges: [{ from: 'R', to: 'L1' }, { from: 'R', to: 'L2' }, { from: 'R', to: 'L3' }],
      leafLinks: [['L1', 'L2'], ['L2', 'L3']],
      highlightNodeIds: ['L2'],
    },
    {
      title: '叶子分裂并维护叶子链',
      desc: '分裂后父节点新增导航键 30，叶子链更新。',
      nodes: [{ id: 'R', label: '[20 | 30 | 40]', x: 280, y: 30, color: 'blue' }, { id: 'L1', label: '[5 | 10 | 15]', x: 80, y: 140, color: 'green' }, { id: 'L2', label: '[20 | 25]', x: 220, y: 140, color: 'green' }, { id: 'L4', label: '[30 | 35]', x: 340, y: 140, color: 'green' }, { id: 'L3', label: '[40 | 50]', x: 480, y: 140, color: 'green' }],
      edges: [{ from: 'R', to: 'L1' }, { from: 'R', to: 'L2' }, { from: 'R', to: 'L4' }, { from: 'R', to: 'L3' }],
      leafLinks: [['L1', 'L2'], ['L2', 'L4'], ['L4', 'L3']],
      highlightNodeIds: ['R', 'L2', 'L4'],
      sideNote: 'B+ 树把导航键复制到父节点，数据仍都留在叶子。',
    },
  ]
}

function trieSnapshots(): TreeSnapshot[] {
  return [
    {
      title: '插入 to',
      desc: '从根开始依次创建 t、o 两层路径。',
      nodes: [{ id: 'root', label: 'root', x: 260, y: 20, color: 'blue' }, { id: 't', label: 't', x: 260, y: 100 }, { id: 'o', label: 'o*', x: 260, y: 190, color: 'green' }],
      edges: [{ from: 'root', to: 't' }, { from: 't', to: 'o' }],
      highlightEdgeKeys: ['root->t', 't->o'],
    },
    {
      title: '继续插入 tea',
      desc: 't 前缀已存在，因此从 t 开始复用路径，再分叉出 e、a。',
      nodes: [{ id: 'root', label: 'root', x: 260, y: 20, color: 'blue' }, { id: 't', label: 't', x: 260, y: 90 }, { id: 'o', label: 'o*', x: 180, y: 170, color: 'green' }, { id: 'e', label: 'e', x: 320, y: 170, color: 'green' }, { id: 'a', label: 'a*', x: 320, y: 250, color: 'green' }],
      edges: [{ from: 'root', to: 't' }, { from: 't', to: 'o' }, { from: 't', to: 'e' }, { from: 'e', to: 'a' }],
      highlightNodeIds: ['t', 'e', 'a'],
      sideNote: '这一步最能体现“共享前缀”的意义。',
    },
    {
      title: '插入 ten 后形成兄弟分支',
      desc: '在 e 下新增 n 作为另一个单词结束。',
      nodes: [{ id: 'root', label: 'root', x: 260, y: 20, color: 'blue' }, { id: 't', label: 't', x: 260, y: 90 }, { id: 'o', label: 'o*', x: 180, y: 170, color: 'green' }, { id: 'e', label: 'e', x: 320, y: 170 }, { id: 'a', label: 'a*', x: 260, y: 250, color: 'green' }, { id: 'n', label: 'n*', x: 380, y: 250, color: 'green' }],
      edges: [{ from: 'root', to: 't' }, { from: 't', to: 'o' }, { from: 't', to: 'e' }, { from: 'e', to: 'a' }, { from: 'e', to: 'n' }],
      highlightNodeIds: ['e', 'n'],
    },
  ]
}

function segmentTreeSnapshots(): TreeSnapshot[] {
  return [
    {
      title: '先放叶子节点',
      desc: '每个叶子对应原数组一个位置。',
      nodes: [{ id: '0', label: '[0]=2', x: 100, y: 220, color: 'green' }, { id: '1', label: '[1]=1', x: 220, y: 220, color: 'green' }, { id: '2', label: '[2]=5', x: 340, y: 220, color: 'green' }, { id: '3', label: '[3]=3', x: 460, y: 220, color: 'green' }],
      edges: [],
      highlightNodeIds: ['0', '1', '2', '3'],
    },
    {
      title: '合并得到中间层区间',
      desc: '[0,1] 由 2 和 1 合并，[2,3] 由 5 和 3 合并。',
      nodes: [{ id: '0-1', label: '[0,1]=3', x: 160, y: 120, color: 'blue' }, { id: '2-3', label: '[2,3]=8', x: 400, y: 120, color: 'blue' }, { id: '0', label: '[0]=2', x: 100, y: 220 }, { id: '1', label: '[1]=1', x: 220, y: 220 }, { id: '2', label: '[2]=5', x: 340, y: 220 }, { id: '3', label: '[3]=3', x: 460, y: 220 }],
      edges: [{ from: '0-1', to: '0' }, { from: '0-1', to: '1' }, { from: '2-3', to: '2' }, { from: '2-3', to: '3' }],
      highlightNodeIds: ['0-1', '2-3'],
    },
    {
      title: '继续向上合并成根',
      desc: '根节点缓存整个区间 [0,3] 的和。',
      nodes: [{ id: '0-3', label: '[0,3]=11', x: 280, y: 30, color: 'green' }, { id: '0-1', label: '[0,1]=3', x: 160, y: 120 }, { id: '2-3', label: '[2,3]=8', x: 400, y: 120 }, { id: '0', label: '[0]=2', x: 100, y: 220 }, { id: '1', label: '[1]=1', x: 220, y: 220 }, { id: '2', label: '[2]=5', x: 340, y: 220 }, { id: '3', label: '[3]=3', x: 460, y: 220 }],
      edges: [{ from: '0-3', to: '0-1' }, { from: '0-3', to: '2-3' }, { from: '0-1', to: '0' }, { from: '0-1', to: '1' }, { from: '2-3', to: '2' }, { from: '2-3', to: '3' }],
      highlightNodeIds: ['0-3'],
    },
  ]
}

function fenwickSnapshots(): TreeSnapshot[] {
  return [
    {
      title: '原数组 [1,2,3,4] 对应的 lowbit 区间',
      desc: 'tree[i] 管理一个以 i 结尾、长度为 lowbit(i) 的区间。',
      nodes: [{ id: '1', label: '1:[1,1]', x: 100, y: 180, color: 'green' }, { id: '2', label: '2:[1,2]', x: 220, y: 130, color: 'green' }, { id: '3', label: '3:[3,3]', x: 340, y: 180, color: 'green' }, { id: '4', label: '4:[1,4]', x: 460, y: 80, color: 'blue' }],
      edges: [{ from: '2', to: '1' }, { from: '4', to: '2' }, { from: '4', to: '3' }],
      highlightNodeIds: ['2', '4'],
      sideNote: '4 的 lowbit 为 4，所以它覆盖 [1,4]。',
    },
    {
      title: '更新位置 3 时的传播路径',
      desc: '从 3 出发，不断跳到 i + lowbit(i)。',
      nodes: [{ id: '3', label: '3', x: 220, y: 160, color: 'green' }, { id: '4', label: '4', x: 360, y: 80, color: 'blue' }],
      edges: [{ from: '4', to: '3' }],
      highlightNodeIds: ['3', '4'],
      sideNote: '更新 3 会影响 tree[3] 和 tree[4]。',
    },
  ]
}

function unionFindSnapshots(): TreeSnapshot[] {
  return [
    {
      title: '初始时每个元素自成集合',
      desc: 'parent[i] = i，所有点都是各自的代表元。',
      nodes: [{ id: '1', label: '1', x: 80, y: 120, color: 'green' }, { id: '2', label: '2', x: 180, y: 120, color: 'green' }, { id: '3', label: '3', x: 280, y: 120, color: 'green' }, { id: '4', label: '4', x: 380, y: 120, color: 'green' }],
      edges: [],
      sideNote: '每个元素都是一棵单节点树。',
    },
    {
      title: '执行 union(1,2) 和 union(3,4)',
      desc: '两个集合各自合并成一棵小树。',
      nodes: [{ id: '1', label: '1', x: 120, y: 70, color: 'blue' }, { id: '2', label: '2', x: 120, y: 170, color: 'green' }, { id: '3', label: '3', x: 320, y: 70, color: 'blue' }, { id: '4', label: '4', x: 320, y: 170, color: 'green' }],
      edges: [{ from: '1', to: '2' }, { from: '3', to: '4' }],
      highlightNodeIds: ['1', '3'],
    },
    {
      title: '再执行 union(2,4)',
      desc: '两棵小树通过代表元连接成一个集合。',
      nodes: [{ id: '1', label: '1', x: 220, y: 50, color: 'blue' }, { id: '2', label: '2', x: 140, y: 140 }, { id: '3', label: '3', x: 300, y: 140 }, { id: '4', label: '4', x: 300, y: 230 }],
      edges: [{ from: '1', to: '2' }, { from: '1', to: '3' }, { from: '3', to: '4' }],
      highlightNodeIds: ['1', '3'],
      sideNote: '后续 find(4) 时还可以做路径压缩。',
    },
  ]
}

function skipListSnapshots(): TreeSnapshot[] {
  return [
    {
      title: '先构建底层有序链表',
      desc: '所有元素一定都在最底层。',
      nodes: [{ id: 'h0', label: 'head', x: 70, y: 220, color: 'blue' }, { id: '10', label: '10', x: 170, y: 220, color: 'green' }, { id: '20', label: '20', x: 290, y: 220, color: 'green' }, { id: '30', label: '30', x: 410, y: 220, color: 'green' }],
      edges: [{ from: 'h0', to: '10' }, { from: '10', to: '20' }, { from: '20', to: '30' }],
      sideNote: '底层链表保证完整有序。',
    },
    {
      title: '为部分节点建立上层索引',
      desc: '高层只保留稀疏节点，用来快速跳跃。',
      nodes: [{ id: 'h1', label: 'head', x: 70, y: 110, color: 'blue' }, { id: '20u', label: '20', x: 290, y: 110, color: 'green' }, { id: 'h0', label: 'head', x: 70, y: 220, color: 'blue' }, { id: '10', label: '10', x: 170, y: 220 }, { id: '20', label: '20', x: 290, y: 220 }, { id: '30', label: '30', x: 410, y: 220 }],
      edges: [{ from: 'h1', to: '20u' }, { from: 'h0', to: '10' }, { from: '10', to: '20' }, { from: '20', to: '30' }, { from: 'h1', to: 'h0' }, { from: '20u', to: '20' }],
      sideNote: '查找时优先在高层向右跳，无法继续时再下落。',
    },
  ]
}

function hashTableSnapshots(): TreeSnapshot[] {
  return [
    {
      title: '建立空桶数组',
      desc: '哈希表先准备若干个槽位。',
      nodes: [{ id: 'b0', label: '0', x: 100, y: 70, color: 'blue' }, { id: 'b1', label: '1', x: 100, y: 140, color: 'blue' }, { id: 'b2', label: '2', x: 100, y: 210, color: 'blue' }],
      edges: [],
      sideNote: '示例中用 3 个桶。',
    },
    {
      title: '插入 key=10 和 key=13',
      desc: '10 % 3 = 1，13 % 3 = 1，发生冲突，挂到同一条链上。',
      nodes: [{ id: 'b0', label: '0', x: 100, y: 70, color: 'blue' }, { id: 'b1', label: '1', x: 100, y: 140, color: 'blue' }, { id: 'b2', label: '2', x: 100, y: 210, color: 'blue' }, { id: '10', label: '10', x: 240, y: 140, color: 'green' }, { id: '13', label: '13', x: 360, y: 140, color: 'green' }],
      edges: [{ from: 'b1', to: '10' }, { from: '10', to: '13' }],
      highlightNodeIds: ['b1', '10', '13'],
      sideNote: '这就是拉链法处理冲突。',
    },
  ]
}

function lruSnapshots(): TreeSnapshot[] {
  return [
    {
      title: 'put(1), put(2) 后的状态',
      desc: '最近使用的节点放在链表头部。',
      nodes: [{ id: 'H', label: 'HEAD', x: 80, y: 140, color: 'blue' }, { id: '2', label: '2', x: 200, y: 140, color: 'green' }, { id: '1', label: '1', x: 320, y: 140, color: 'green' }, { id: 'T', label: 'TAIL', x: 440, y: 140, color: 'blue' }],
      edges: [{ from: 'H', to: '2' }, { from: '2', to: '1' }, { from: '1', to: 'T' }],
      sideNote: '链表顺序表示新旧顺序：越靠前越新。',
    },
    {
      title: '访问 get(1) 后移动到表头',
      desc: '被访问的节点重新变成“最近使用”。',
      nodes: [{ id: 'H', label: 'HEAD', x: 80, y: 140, color: 'blue' }, { id: '1', label: '1', x: 200, y: 140, color: 'green' }, { id: '2', label: '2', x: 320, y: 140, color: 'green' }, { id: 'T', label: 'TAIL', x: 440, y: 140, color: 'blue' }],
      edges: [{ from: 'H', to: '1' }, { from: '1', to: '2' }, { from: '2', to: 'T' }],
      highlightNodeIds: ['1'],
      sideNote: '哈希表保证能 O(1) 找到节点，链表负责 O(1) 移动。',
    },
    {
      title: 'put(3) 超容量，淘汰最久未使用的 2',
      desc: '新节点插到头部，旧尾节点被删除。',
      nodes: [{ id: 'H', label: 'HEAD', x: 80, y: 140, color: 'blue' }, { id: '3', label: '3', x: 200, y: 140, color: 'green' }, { id: '1', label: '1', x: 320, y: 140, color: 'green' }, { id: 'T', label: 'TAIL', x: 440, y: 140, color: 'blue' }],
      edges: [{ from: 'H', to: '3' }, { from: '3', to: '1' }, { from: '1', to: 'T' }],
      highlightNodeIds: ['3'],
      sideNote: '表尾前面的节点就是最久未使用数据。',
    },
  ]
}

function heapSnapshots(): TreeSnapshot[] {
  return [
    {
      title: '插入 50 作为初始堆顶',
      desc: '第一个元素直接放在根。',
      nodes: [{ id: '50', label: '50', x: 280, y: 50, color: 'green' }],
      edges: [],
    },
    {
      title: '插入 30 到下一空位',
      desc: '30 <= 50，不需要上浮。',
      nodes: [{ id: '50', label: '50', x: 280, y: 40, color: 'blue' }, { id: '30', label: '30', x: 200, y: 130, color: 'green' }],
      edges: [{ from: '50', to: '30' }],
    },
    {
      title: '插入 80 并上浮到堆顶',
      desc: '80 大于父节点 50，所以交换上浮。',
      nodes: [{ id: '80', label: '80', x: 280, y: 40, color: 'green' }, { id: '30', label: '30', x: 200, y: 130 }, { id: '50', label: '50', x: 360, y: 130, color: 'blue' }],
      edges: [{ from: '80', to: '30' }, { from: '80', to: '50' }],
      highlightNodeIds: ['80', '50'],
      sideNote: '这一步体现的是“上浮”操作。',
    },
    {
      title: '删除堆顶后最后元素下沉',
      desc: '把最后元素放到根，再与更大的孩子交换。',
      nodes: [{ id: '50', label: '50', x: 280, y: 40, color: 'green' }, { id: '30', label: '30', x: 200, y: 130 }, { id: '40', label: '40', x: 360, y: 130 }],
      edges: [{ from: '50', to: '30' }, { from: '50', to: '40' }],
      sideNote: '删除堆顶的核心是“下沉”恢复堆序。',
    },
  ]
}

function treeCodes(kind: 'bst' | 'avl' | 'red-black-tree' | 'b-tree' | 'b-plus-tree' | 'trie' | 'segment-tree' | 'fenwick-tree' | 'union-find' | 'skip-list' | 'heap' | 'hash-table' | 'lru-cache'): CodeEntry[] {
  const codes = {
    bst: {
      C: `typedef struct Node {
    int val;
    struct Node* left;
    struct Node* right;
} Node;

Node* insert(Node* root, int x) {
    if (!root) return create(x);
    if (x < root->val) root->left = insert(root->left, x);
    else if (x > root->val) root->right = insert(root->right, x);
    return root;
}`,
      'C++': `struct Node {
    int val;
    Node* left;
    Node* right;
    explicit Node(int v) : val(v), left(nullptr), right(nullptr) {}
};

Node* insert(Node* root, int x) {
    if (!root) return new Node(x);
    if (x < root->val) root->left = insert(root->left, x);
    else if (x > root->val) root->right = insert(root->right, x);
    return root;
}`,
      Python: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def insert(root, x):
    if not root:
        return Node(x)
    if x < root.val:
        root.left = insert(root.left, x)
    elif x > root.val:
        root.right = insert(root.right, x)
    return root`,
      JavaScript: `function insert(root, x) {
  if (!root) {
    return { val: x, left: null, right: null };
  }
  if (x < root.val) {
    root.left = insert(root.left, x);
  } else if (x > root.val) {
    root.right = insert(root.right, x);
  }
  return root;
}`,
      TypeScript: `type Node = {
  val: number;
  left: Node | null;
  right: Node | null;
}

function insert(root: Node | null, x: number): Node {
  if (!root) {
    return { val: x, left: null, right: null }
  }
  if (x < root.val) {
    root.left = insert(root.left, x)
  } else if (x > root.val) {
    root.right = insert(root.right, x)
  }
  return root
}`,
      Java: `class Node {
    int val;
    Node left;
    Node right;

    Node(int v) {
        val = v;
    }
}

Node insert(Node root, int x) {
    if (root == null) return new Node(x);
    if (x < root.val) root.left = insert(root.left, x);
    else if (x > root.val) root.right = insert(root.right, x);
    return root;
}`,
    },
    avl: {
      C: `Node* rightRotate(Node* y) {
    Node* x = y->left;
    y->left = x->right;
    x->right = y;
    return x;
}`,
      'C++': `Node* rightRotate(Node* y) {
    Node* x = y->left;
    y->left = x->right;
    x->right = y;
    return x;
}`,
      Python: `def right_rotate(y):
    x = y.left
    y.left = x.right
    x.right = y
    return x`,
      JavaScript: `function rightRotate(y) {
  const x = y.left;
  y.left = x.right;
  x.right = y;
  return x;
}`,
      TypeScript: `function rightRotate(y: AVLNode): AVLNode {
  const x = y.left!;
  y.left = x.right;
  x.right = y;
  return x;
}`,
      Java: `Node rightRotate(Node y) {
    Node x = y.left;
    y.left = x.right;
    x.right = y;
    return x;
}`,
    },
    'red-black-tree': {
      C: `void fixInsert(Node** root, Node* z) {
    while (z->parent && z->parent->color == RED) {
        Node* gp = z->parent->parent;
        if (z->parent == gp->left) {
            Node* uncle = gp->right;
            if (uncle && uncle->color == RED) {
                z->parent->color = BLACK;
                uncle->color = BLACK;
                gp->color = RED;
                z = gp;
            } else {
                break;
            }
        } else {
            break;
        }
    }
    (*root)->color = BLACK;
}`,
      'C++': `void fixInsert(Node*& root, Node* z) {
    while (z->parent && z->parent->color == RED) {
        Node* gp = z->parent->parent;
        if (z->parent == gp->left) {
            Node* uncle = gp->right;
            if (uncle && uncle->color == RED) {
                z->parent->color = BLACK;
                uncle->color = BLACK;
                gp->color = RED;
                z = gp;
            } else {
                break;
            }
        } else {
            break;
        }
    }
    root->color = BLACK;
}`,
      Python: `def fix_insert(root, z):
    while z.parent and z.parent.color == 'R':
        gp = z.parent.parent
        if z.parent == gp.left:
            uncle = gp.right
            if uncle and uncle.color == 'R':
                z.parent.color = 'B'
                uncle.color = 'B'
                gp.color = 'R'
                z = gp
            else:
                break
        else:
            break
    root.color = 'B'
    return root`,
      JavaScript: `function fixInsert(root, z) {
  while (z.parent && z.parent.color === 'R') {
    const gp = z.parent.parent;
    if (z.parent === gp.left) {
      const uncle = gp.right;
      if (uncle && uncle.color === 'R') {
        z.parent.color = 'B';
        uncle.color = 'B';
        gp.color = 'R';
        z = gp;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  root.color = 'B';
  return root;
}`,
      TypeScript: `function fixInsert(root: RBNode, z: RBNode): RBNode {
  while (z.parent && z.parent.color === 'R') {
    const gp = z.parent.parent!;
    if (z.parent === gp.left) {
      const uncle = gp.right;
      if (uncle && uncle.color === 'R') {
        z.parent.color = 'B';
        uncle.color = 'B';
        gp.color = 'R';
        z = gp;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  root.color = 'B';
  return root;
}`,
      Java: `void fixInsert(Node root, Node z) {
    while (z.parent != null && z.parent.color == 'R') {
        Node gp = z.parent.parent;
        if (z.parent == gp.left) {
            Node uncle = gp.right;
            if (uncle != null && uncle.color == 'R') {
                z.parent.color = 'B';
                uncle.color = 'B';
                gp.color = 'R';
                z = gp;
            } else {
                break;
            }
        } else {
            break;
        }
    }
    root.color = 'B';
}`,
    },
    'b-tree': {
      C: `void insertNonFull(BTreeNode* node, int key) {
    int i = node->n - 1;
    while (i >= 0 && key < node->keys[i]) {
        node->keys[i + 1] = node->keys[i];
        i--;
    }
    node->keys[i + 1] = key;
    node->n++;
}`,
      'C++': `void insertNonFull(BTreeNode* node, int key) {
    int i = static_cast<int>(node->keys.size()) - 1;
    node->keys.push_back(0);
    while (i >= 0 && key < node->keys[i]) {
        node->keys[i + 1] = node->keys[i];
        --i;
    }
    node->keys[i + 1] = key;
}`,
      Python: `def insert_non_full(node, key):
    i = len(node.keys) - 1
    node.keys.append(0)
    while i >= 0 and key < node.keys[i]:
        node.keys[i + 1] = node.keys[i]
        i -= 1
    node.keys[i + 1] = key`,
      JavaScript: `function insertNonFull(node, key) {
  let i = node.keys.length - 1;
  node.keys.push(0);
  while (i >= 0 && key < node.keys[i]) {
    node.keys[i + 1] = node.keys[i];
    i--;
  }
  node.keys[i + 1] = key;
}`,
      TypeScript: `function insertNonFull(node: BTreeNode, key: number): void {
  let i = node.keys.length - 1;
  node.keys.push(0);
  while (i >= 0 && key < node.keys[i]) {
    node.keys[i + 1] = node.keys[i];
    i--;
  }
  node.keys[i + 1] = key;
}`,
      Java: `void insertNonFull(BTreeNode node, int key) {
    int i = node.keys.size() - 1;
    node.keys.add(0);
    while (i >= 0 && key < node.keys.get(i)) {
        node.keys.set(i + 1, node.keys.get(i));
        i--;
    }
    node.keys.set(i + 1, key);
}`,
    },
    'b-plus-tree': {
      C: `void insertIntoLeaf(LeafNode* leaf, int key) {
    int i = leaf->n - 1;
    while (i >= 0 && key < leaf->keys[i]) {
        leaf->keys[i + 1] = leaf->keys[i];
        i--;
    }
    leaf->keys[i + 1] = key;
    leaf->n++;
}`,
      'C++': `void insertIntoLeaf(LeafNode* leaf, int key) {
    auto it = std::lower_bound(leaf->keys.begin(), leaf->keys.end(), key);
    leaf->keys.insert(it, key);
}`,
      Python: `def insert_into_leaf(leaf, key):
    i = 0
    while i < len(leaf.keys) and leaf.keys[i] < key:
        i += 1
    leaf.keys.insert(i, key)`,
      JavaScript: `function insertIntoLeaf(leaf, key) {
  let i = 0;
  while (i < leaf.keys.length && leaf.keys[i] < key) {
    i++;
  }
  leaf.keys.splice(i, 0, key);
}`,
      TypeScript: `function insertIntoLeaf(leaf: BPlusLeafNode, key: number): void {
  let i = 0;
  while (i < leaf.keys.length && leaf.keys[i] < key) {
    i++;
  }
  leaf.keys.splice(i, 0, key);
}`,
      Java: `void insertIntoLeaf(LeafNode leaf, int key) {
    int i = 0;
    while (i < leaf.keys.size() && leaf.keys.get(i) < key) {
        i++;
    }
    leaf.keys.add(i, key);
}`,
    },
    trie: {
      C: `void insert(Trie* root, char* s) {
    for (int i = 0; s[i]; i++) {
        int k = s[i] - 'a';
        if (!root->next[k]) {
            root->next[k] = createNode();
        }
        root = root->next[k];
    }
    root->end = 1;
}`,
      Python: `def insert(root, word):\n    node = root\n    for ch in word: node = node.next.setdefault(ch, TrieNode())\n    node.end = True`,
      JavaScript: `function insert(root, word) {
  let node = root;
  for (const ch of word) {
    node.next[ch] ??= { next: {}, end: false };
    node = node.next[ch];
  }
  node.end = true;
}`,
      TypeScript: `function insert(root: TrieNode, word: string): void {
  let node = root;
  for (const ch of word) {
    node.next[ch] ??= { next: {}, end: false };
    node = node.next[ch];
  }
  node.end = true;
}`,
      Java: `void insert(TrieNode root, String word) {
    TrieNode node = root;
    for (char ch : word.toCharArray()) {
        node.next.putIfAbsent(ch, new TrieNode());
        node = node.next.get(ch);
    }
    node.end = true;
}`,
    },
    'segment-tree': {
      C: `void build(int idx, int l, int r, int* arr, int* tree) {
    if (l == r) {
        tree[idx] = arr[l];
        return;
    }
    int m = (l + r) / 2;
    build(idx * 2, l, m, arr, tree);
    build(idx * 2 + 1, m + 1, r, arr, tree);
    tree[idx] = tree[idx * 2] + tree[idx * 2 + 1];
}`,
      Python: `def build(idx, l, r, arr, tree):\n    if l == r: tree[idx] = arr[l]; return\n    m = (l + r) // 2\n    build(idx * 2, l, m, arr, tree)\n    build(idx * 2 + 1, m + 1, r, arr, tree)\n    tree[idx] = tree[idx * 2] + tree[idx * 2 + 1]`,
      JavaScript: `function build(idx, l, r, arr, tree) {
  if (l === r) {
    tree[idx] = arr[l];
    return;
  }
  const m = (l + r) >> 1;
  build(idx * 2, l, m, arr, tree);
  build(idx * 2 + 1, m + 1, r, arr, tree);
  tree[idx] = tree[idx * 2] + tree[idx * 2 + 1];
}`,
      TypeScript: `function build(idx: number, l: number, r: number, arr: number[], tree: number[]): void {
  if (l === r) {
    tree[idx] = arr[l];
    return;
  }
  const m = (l + r) >> 1;
  build(idx * 2, l, m, arr, tree);
  build(idx * 2 + 1, m + 1, r, arr, tree);
  tree[idx] = tree[idx * 2] + tree[idx * 2 + 1];
}`,
      Java: `void build(int idx, int l, int r, int[] arr, int[] tree) {
    if (l == r) {
        tree[idx] = arr[l];
        return;
    }
    int m = (l + r) / 2;
    build(idx * 2, l, m, arr, tree);
    build(idx * 2 + 1, m + 1, r, arr, tree);
    tree[idx] = tree[idx * 2] + tree[idx * 2 + 1];
}`,
    },
    'fenwick-tree': {
      C: `int lowbit(int x) {\n    return x & -x;\n}\n\nvoid add(int i, int delta, int n) {\n    for (; i <= n; i += lowbit(i)) {\n        tree[i] += delta;\n    }\n}`,
      Python: `def add(tree, i, delta):\n    n = len(tree) - 1\n    while i <= n:\n        tree[i] += delta\n        i += i & -i`,
      JavaScript: `function add(tree, i, delta) {\n  const n = tree.length - 1;\n  while (i <= n) {\n    tree[i] += delta;\n    i += i & -i;\n  }\n}`,
      TypeScript: `function add(tree: number[], i: number, delta: number): void {\n  const n = tree.length - 1;\n  while (i <= n) {\n    tree[i] += delta;\n    i += i & -i;\n  }\n}`,
      Java: `void add(int[] tree, int i, int delta) {\n    while (i < tree.length) {\n        tree[i] += delta;\n        i += i & -i;\n    }\n}`,
    },
    'union-find': {
      C: `int find(int x) {\n    return parent[x] == x ? x : (parent[x] = find(parent[x]));\n}\n\nvoid unite(int a, int b) {\n    parent[find(a)] = find(b);\n}`,
      Python: `def find(parent, x):\n    if parent[x] != x: parent[x] = find(parent, parent[x])\n    return parent[x]\ndef union(parent, a, b):\n    parent[find(parent, a)] = find(parent, b)`,
      JavaScript: `function find(parent, x) {\n  if (parent[x] !== x) {\n    parent[x] = find(parent, parent[x]);\n  }\n  return parent[x];\n}\n\nfunction union(parent, a, b) {\n  parent[find(parent, a)] = find(parent, b);\n}`,
      TypeScript: `function find(parent: number[], x: number): number {\n  if (parent[x] !== x) {\n    parent[x] = find(parent, parent[x]);\n  }\n  return parent[x];\n}\n\nfunction union(parent: number[], a: number, b: number): void {\n  parent[find(parent, a)] = find(parent, b);\n}`,
      Java: `int find(int[] parent, int x) {\n    if (parent[x] != x) {\n        parent[x] = find(parent, parent[x]);\n    }\n    return parent[x];\n}\n\nvoid union(int[] parent, int a, int b) {\n    parent[find(parent, a)] = find(parent, b);\n}`,
    },
    'skip-list': {
      C: `SkipNode* search(SkipNode* head, int key, int level) {
    SkipNode* cur = head;
    for (int i = level - 1; i >= 0; i--) {
        while (cur->next[i] && cur->next[i]->val < key) {
            cur = cur->next[i];
        }
    }
    cur = cur->next[0];
    return (cur && cur->val == key) ? cur : NULL;
}`,
      'C++': `#include <vector>

struct SkipNode {
    int val;
    std::vector<SkipNode*> next;

    SkipNode(int v, int level) : val(v), next(level, nullptr) {}
};`,
      Python: `class SkipNode:
    def __init__(self, val, level):
        self.val = val
        self.next = [None] * level


def search(head, key, level):
    cur = head
    for i in range(level - 1, -1, -1):
        while cur.next[i] and cur.next[i].val < key:
            cur = cur.next[i]
    cur = cur.next[0]
    return cur if cur and cur.val == key else None`,
      JavaScript: `class SkipNode {
  constructor(val, level) {
    this.val = val;
    this.next = Array(level).fill(null);
  }
}

function search(head, key, level) {
  let cur = head;
  for (let i = level - 1; i >= 0; i--) {
    while (cur.next[i] && cur.next[i].val < key) {
      cur = cur.next[i];
    }
  }
  cur = cur.next[0];
  return cur && cur.val === key ? cur : null;
}`,
      TypeScript: `class SkipNode {
  val: number;
  next: Array<SkipNode | null>;

  constructor(val: number, level: number) {
    this.val = val;
    this.next = Array(level).fill(null);
  }
}

function search(head: SkipNode, key: number, level: number): SkipNode | null {
  let cur: SkipNode | null = head;
  for (let i = level - 1; i >= 0; i--) {
    while (cur?.next[i] && cur.next[i]!.val < key) {
      cur = cur.next[i];
    }
  }
  cur = cur?.next[0] ?? null;
  return cur && cur.val === key ? cur : null;
}`,
      Java: `class SkipNode {
    int val;
    SkipNode[] next;

    SkipNode(int v, int level) {
        val = v;
        next = new SkipNode[level];
    }
}

SkipNode search(SkipNode head, int key, int level) {
    SkipNode cur = head;
    for (int i = level - 1; i >= 0; i--) {
        while (cur.next[i] != null && cur.next[i].val < key) {
            cur = cur.next[i];
        }
    }
    cur = cur.next[0];
    return cur != null && cur.val == key ? cur : null;
}`,
    },
    heap: {
      C: `void push(int* heap, int* n, int x) {
    int i = ++(*n);
    heap[i] = x;
    while (i > 1 && heap[i] > heap[i / 2]) {
        int t = heap[i];
        heap[i] = heap[i / 2];
        heap[i / 2] = t;
        i /= 2;
    }
}`,
      'C++': `#include <vector>
#include <algorithm>

class MaxHeap {
public:
    void push(int x) {
        data.push_back(x);
        int i = static_cast<int>(data.size()) - 1;
        while (i > 0) {
            int p = (i - 1) / 2;
            if (data[p] >= data[i]) break;
            std::swap(data[p], data[i]);
            i = p;
        }
    }

private:
    std::vector<int> data;
};`,
      Python: `import heapq\nh = []\nheapq.heappush(h, 3)\nheapq.heappush(h, 1)\nheapq.heappush(h, 5)`,
      JavaScript: `class MaxHeap {
  constructor() {
    this.a = [];
  }

  push(x) {
    this.a.push(x);
    let i = this.a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.a[p] >= this.a[i]) break;
      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }
}`,
      TypeScript: `class MaxHeap {
  a: number[] = [];

  push(x: number): void {
    this.a.push(x);
    let i = this.a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.a[p] >= this.a[i]) break;
      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }
}`,
      Java: `class MaxHeap {
    List<Integer> a = new ArrayList<>();

    void push(int x) {
        a.add(x);
        int i = a.size() - 1;
        while (i > 0) {
            int p = (i - 1) / 2;
            if (a.get(p) >= a.get(i)) break;
            Collections.swap(a, p, i);
            i = p;
        }
    }
}`,
    },
    'hash-table': {
      C: `int h(int key, int m) { return key % m; }`,
      'C++': `#include <vector>

void insert(std::vector<std::vector<int>>& table, int key) {
    int idx = key % static_cast<int>(table.size());
    table[idx].push_back(key);
}`,
      Python: `def insert(table, key):\n    idx = key % len(table)\n    table[idx].append(key)`,
      JavaScript: `function insert(table, key) {
  const idx = key % table.length;
  table[idx].push(key);
}`,
      TypeScript: `function insert(table: number[][], key: number): void {
  const idx = key % table.length;
  table[idx].push(key);
}`,
      Java: `void insert(List<List<Integer>> table, int key) {
    int idx = key % table.size();
    table.get(idx).add(key);
}`,
    },
    'lru-cache': {
      C: `void moveToFront(Node** head, Node* node) {
    if (*head == node) return;
    if (node->prev) node->prev->next = node->next;
    if (node->next) node->next->prev = node->prev;
    node->prev = NULL;
    node->next = *head;
    if (*head) (*head)->prev = node;
    *head = node;
}`,
      'C++': `#include <list>
#include <unordered_map>

class LRUCache {
public:
    explicit LRUCache(int cap) : capacity(cap) {}

    int get(int key) {
        auto it = pos.find(key);
        if (it == pos.end()) return -1;
        cache.splice(cache.begin(), cache, it->second);
        return it->second->second;
    }

private:
    int capacity;
    std::list<std::pair<int, int>> cache;
    std::unordered_map<int, std::list<std::pair<int, int>>::iterator> pos;
};`,
      Python: `from collections import OrderedDict


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key, last=False)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache[key] = value
            self.cache.move_to_end(key, last=False)
        else:
            self.cache[key] = value
            self.cache.move_to_end(key, last=False)
            if len(self.cache) > self.capacity:
                self.cache.popitem(last=True)`,
      JavaScript: `class LRUCache {
  constructor(cap) {
    this.cap = cap;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    this.map.set(key, value);
    if (this.map.size > this.cap) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
  }
}`,
      TypeScript: `class LRUCache {
  cap: number;
  map = new Map<number, number>();

  constructor(cap: number) {
    this.cap = cap;
  }

  get(key: number): number {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  put(key: number, value: number): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    this.map.set(key, value);
    if (this.map.size > this.cap) {
      const oldestKey = this.map.keys().next().value as number;
      this.map.delete(oldestKey);
    }
  }
}`,
      Java: `class LRUCache extends LinkedHashMap<Integer, Integer> {
    int cap;

    LRUCache(int cap) {
        super(cap, 0.75f, true);
        this.cap = cap;
    }

    public int getValue(int key) {
        return getOrDefault(key, -1);
    }

    public void putValue(int key, int value) {
        put(key, value);
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> e) {
        return size() > cap;
    }
}`,
    },
  } as const

  return [
    { lang: 'C', code: codes[kind].C },
    { lang: 'C++', code: (codes[kind] as { C: string; 'C++'?: string })['C++'] ?? codes[kind].C },
    { lang: 'Python', code: codes[kind].Python },
    { lang: 'JavaScript', code: codes[kind].JavaScript },
    { lang: 'TypeScript', code: codes[kind].TypeScript },
    { lang: 'Java', code: codes[kind].Java },
  ]
}
