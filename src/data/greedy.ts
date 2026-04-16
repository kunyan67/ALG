import type { AlgorithmNode, AlgorithmContent, GraphNode, GraphEdge } from './algorithms'

export function greedyAlgorithms(): AlgorithmNode[] {
  return [
    {
      id: 'greedy-classic',
      label: '经典贪心',
      children: [
        { id: 'greedy-activity', label: '活动选择', content: activitySelection() },
        { id: 'greedy-fractional', label: '分数背包', content: fractionalKnapsack() },
        { id: 'greedy-huffman', label: 'Huffman 编码', content: huffman() },
      ],
    },
    {
      id: 'greedy-mst',
      label: '最小生成树',
      children: [
        { id: 'greedy-prim', label: 'Prim', content: prim() },
        { id: 'greedy-kruskal', label: 'Kruskal', content: kruskal() },
      ],
    },
  ]
}

// MST 共用图
const MST_NODES: GraphNode[] = [
  { id: 'A', x: 80, y: 50 }, { id: 'B', x: 240, y: 30 },
  { id: 'C', x: 160, y: 160 }, { id: 'D', x: 400, y: 50 },
  { id: 'E', x: 320, y: 160 }, { id: 'F', x: 480, y: 120 },
]
const MST_EDGES: GraphEdge[] = [
  { from: 'A', to: 'B', weight: 4 }, { from: 'A', to: 'C', weight: 3 },
  { from: 'B', to: 'C', weight: 5 }, { from: 'B', to: 'D', weight: 2 },
  { from: 'C', to: 'E', weight: 6 }, { from: 'D', to: 'E', weight: 1 },
  { from: 'D', to: 'F', weight: 8 }, { from: 'E', to: 'F', weight: 4 },
]

// ==================== 活动选择 ====================

function activitySelection(): AlgorithmContent {
  return {
    title: '活动选择问题（区间调度）',
    description: [
      { type: 'text', content: '有 n 个活动，每个活动有开始时间和结束时间，同一时间只能参加一个活动。求最多能参加多少个活动。' },
      { type: 'text', content: '这是贪心算法的入门经典：按结束时间排序，每次选最早结束的、且不与已选冲突的活动。' },
      { type: 'table', table: { headers: ['活动', '开始', '结束'], rows: [['A','1','4'],['B','3','5'],['C','0','6'],['D','5','7'],['E','3','9'],['F','5','9'],['G','6','10'],['H','8','11'],['I','8','12'],['J','2','14'],['K','12','16']] } },
    ],
    approach: `**贪心策略**：按结束时间升序排列，每次选最早结束且不冲突的。

**为什么正确？** 越早结束的活动，为后续活动留出的时间越多。可以用交换论证法严格证明。

**流程**：
1. 按 end 升序排序
2. 选第一个活动，记录其结束时间 lastEnd
3. 遍历剩余活动：若 start >= lastEnd，选中，更新 lastEnd`,
    complexity: { time: 'O(n log n)（排序）', space: 'O(1)' },
    animation: {
      type: 'greedy', algorithm: 'activity-selection',
      activities: [
        { name: 'A', start: 1, end: 4 }, { name: 'B', start: 3, end: 5 },
        { name: 'C', start: 0, end: 6 }, { name: 'D', start: 5, end: 7 },
        { name: 'E', start: 3, end: 9 }, { name: 'F', start: 5, end: 9 },
        { name: 'G', start: 6, end: 10 }, { name: 'H', start: 8, end: 11 },
        { name: 'I', start: 8, end: 12 }, { name: 'J', start: 2, end: 14 },
        { name: 'K', start: 12, end: 16 },
      ],
    },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#include <stdlib.h>

typedef struct { int start, end; char name; } Act;
int cmp(const void *a, const void *b) {
    return ((Act*)a)->end - ((Act*)b)->end;
}

// 贪心：按结束时间排序，选不冲突的
void activitySelect(Act acts[], int n) {
    qsort(acts, n, sizeof(Act), cmp);
    printf("选: %c", acts[0].name);
    int lastEnd = acts[0].end;
    for (int i = 1; i < n; i++) {
        if (acts[i].start >= lastEnd) {
            printf(", %c", acts[i].name);
            lastEnd = acts[i].end;
        }
    }
}` },
      { lang: 'Python', code: `def activity_selection(activities):
    """贪心：按结束时间排序，选不冲突的"""
    acts = sorted(activities, key=lambda a: a[2])  # 按 end 排序
    selected = [acts[0]]
    last_end = acts[0][2]
    for name, start, end in acts[1:]:
        if start >= last_end:  # 不冲突
            selected.append((name, start, end))
            last_end = end
    return selected

acts = [('A',1,4),('B',3,5),('C',0,6),('D',5,7),('E',3,9),
        ('F',5,9),('G',6,10),('H',8,11),('I',8,12),('J',2,14),('K',12,16)]
print([a[0] for a in activity_selection(acts)])` },
      { lang: 'JavaScript', code: `function activitySelection(activities) {
  const acts = [...activities].sort((a,b) => a.end - b.end);
  const selected = [acts[0]];
  let lastEnd = acts[0].end;
  for (let i = 1; i < acts.length; i++) {
    if (acts[i].start >= lastEnd) {
      selected.push(acts[i]);
      lastEnd = acts[i].end;
    }
  }
  return selected;
}` },
      { lang: 'TypeScript', code: `interface Activity { name: string; start: number; end: number }

function activitySelection(activities: Activity[]): Activity[] {
  const acts = [...activities].sort((a,b) => a.end - b.end);
  const selected = [acts[0]];
  let lastEnd = acts[0].end;
  for (let i = 1; i < acts.length; i++) {
    if (acts[i].start >= lastEnd) {
      selected.push(acts[i]);
      lastEnd = acts[i].end;
    }
  }
  return selected;
}` },
      { lang: 'Java', code: `import java.util.*;

public class ActivitySelection {
    public static List<int[]> solve(int[][] acts) {
        Arrays.sort(acts, (a,b) -> a[2]-b[2]); // 按 end 排序
        List<int[]> sel = new ArrayList<>();
        sel.add(acts[0]);
        int lastEnd = acts[0][2];
        for (int i = 1; i < acts.length; i++) {
            if (acts[i][1] >= lastEnd) {
                sel.add(acts[i]);
                lastEnd = acts[i][2];
            }
        }
        return sel;
    }
}` },
    ],
  }
}

// ==================== 分数背包 ====================

function fractionalKnapsack(): AlgorithmContent {
  return {
    title: '分数背包问题',
    description: [
      { type: 'text', content: '与 0-1 背包不同，分数背包允许取物品的一部分（如取半个）。贪心策略：按性价比（价值/重量）降序排列，优先装性价比最高的。' },
      { type: 'text', content: '0-1 背包必须用 DP，分数背包用贪心就能得到最优解。这是理解「贪心 vs DP」的最佳对比案例。' },
      { type: 'table', table: { headers: ['物品', '重量', '价值', '性价比'], rows: [['A','10','60','6.0'],['B','20','100','5.0'],['C','30','120','4.0']] } },
    ],
    approach: `**贪心策略**：按「单位重量价值」降序排列。

**流程**：
1. 计算每个物品的性价比 = value / weight
2. 按性价比降序排序
3. 依次装入：
   - 能全部装下 → 全装
   - 装不下 → 装一部分（剩余容量 / 物品重量 × 物品价值）

**为什么 0-1 背包不能贪心？**
因为不可分割，高性价比物品可能太重装不下，反而不如装几个小的。`,
    complexity: { time: 'O(n log n)', space: 'O(1)' },
    animation: {
      type: 'greedy', algorithm: 'fractional-knapsack',
      items: [{ weight: 10, value: 60 }, { weight: 20, value: 100 }, { weight: 30, value: 120 }],
      capacity: 50,
    },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#include <stdlib.h>

typedef struct { double w, v, ratio; } Item;
int cmp(const void *a, const void *b) {
    double d = ((Item*)b)->ratio - ((Item*)a)->ratio;
    return d > 0 ? 1 : d < 0 ? -1 : 0;
}

// 贪心：按性价比排序，能装全装，否则装一部分
double fractionalKnapsack(Item items[], int n, double cap) {
    qsort(items, n, sizeof(Item), cmp);
    double total = 0;
    for (int i = 0; i < n && cap > 0; i++) {
        if (items[i].w <= cap) {
            total += items[i].v;    // 全装
            cap -= items[i].w;
        } else {
            total += cap * items[i].ratio;  // 装一部分
            cap = 0;
        }
    }
    return total;
}` },
      { lang: 'Python', code: `def fractional_knapsack(items, capacity):
    """贪心：按性价比降序，能装全装，否则装一部分"""
    items = sorted(items, key=lambda x: x[1]/x[0], reverse=True)
    total = 0
    for w, v in items:
        if capacity <= 0: break
        if w <= capacity:
            total += v          # 全装
            capacity -= w
        else:
            total += capacity * (v / w)  # 装一部分
            capacity = 0
    return total

items = [(10,60), (20,100), (30,120)]
print(f"最大价值: {fractional_knapsack(items, 50)}")  # 240` },
      { lang: 'JavaScript', code: `function fractionalKnapsack(items, capacity) {
  items.sort((a,b) => b.v/b.w - a.v/a.w); // 性价比降序
  let total = 0;
  for (const {w, v} of items) {
    if (capacity <= 0) break;
    if (w <= capacity) { total += v; capacity -= w; }
    else { total += capacity * (v/w); capacity = 0; }
  }
  return total;
}` },
      { lang: 'TypeScript', code: `function fractionalKnapsack(items: {w:number,v:number}[], capacity: number): number {
  items.sort((a,b) => b.v/b.w - a.v/a.w);
  let total = 0;
  for (const {w, v} of items) {
    if (capacity <= 0) break;
    if (w <= capacity) { total += v; capacity -= w; }
    else { total += capacity * (v/w); capacity = 0; }
  }
  return total;
}` },
      { lang: 'Java', code: `import java.util.*;
public class FractionalKnapsack {
    public static double solve(double[][] items, double cap) {
        Arrays.sort(items, (a,b) -> Double.compare(b[1]/b[0], a[1]/a[0]));
        double total = 0;
        for (double[] it : items) {
            if (cap <= 0) break;
            if (it[0] <= cap) { total += it[1]; cap -= it[0]; }
            else { total += cap * (it[1]/it[0]); cap = 0; }
        }
        return total;
    }
}` },
    ],
  }
}

// ==================== Huffman 编码 ====================

function huffman(): AlgorithmContent {
  return {
    title: 'Huffman 编码',
    description: [
      { type: 'text', content: 'Huffman 编码是一种最优前缀编码算法。频率高的字符用短编码，频率低的用长编码，使得总编码长度最短。' },
      { type: 'text', content: '核心是构建 Huffman 树：每次合并频率最小的两个节点。这个过程本身就是贪心——总是先处理「代价最小」的。' },
      { type: 'table', table: { headers: ['字符', '频率'], rows: [['A','5'],['B','9'],['C','12'],['D','13'],['E','16'],['F','45']] } },
    ],
    approach: `**构建 Huffman 树**：
1. 每个字符作为一个叶子节点，权值=频率
2. 用最小堆维护所有节点
3. 每次取出权值最小的两个节点，合并为新节点（权值=两者之和）
4. 新节点放回堆中
5. 重复直到堆中只剩一个节点（根）

**编码**：从根到叶子，左走记 0，右走记 1。

**贪心正确性**：频率最低的两个字符应该在树的最深处，合并它们不会影响其他字符的编码长度。`,
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    animation: {
      type: 'greedy', algorithm: 'huffman',
      frequencies: [{ char: 'A', freq: 5 }, { char: 'B', freq: 9 }, { char: 'C', freq: 12 }, { char: 'D', freq: 13 }, { char: 'E', freq: 16 }, { char: 'F', freq: 45 }],
    },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#include <stdlib.h>

typedef struct Node { char ch; int freq; struct Node *left, *right; } Node;

// 简化：用数组模拟最小堆
Node* nodes[100]; int size = 0;
void push(Node* n) { nodes[size++] = n; }
Node* pop() {
    int mi = 0;
    for (int i = 1; i < size; i++) if (nodes[i]->freq < nodes[mi]->freq) mi = i;
    Node* r = nodes[mi]; nodes[mi] = nodes[--size]; return r;
}

// 构建 Huffman 树
Node* buildHuffman(char chars[], int freqs[], int n) {
    for (int i = 0; i < n; i++) {
        Node* nd = malloc(sizeof(Node));
        nd->ch = chars[i]; nd->freq = freqs[i]; nd->left = nd->right = NULL;
        push(nd);
    }
    while (size > 1) {
        Node *l = pop(), *r = pop();  // 取最小两个
        Node *parent = malloc(sizeof(Node));
        parent->ch = '\\0'; parent->freq = l->freq + r->freq;
        parent->left = l; parent->right = r;
        push(parent);  // 合并后放回
    }
    return pop();
}

void printCodes(Node* root, char code[], int depth) {
    if (!root->left && !root->right) {
        code[depth] = '\\0';
        printf("%c: %s\\n", root->ch, code);
        return;
    }
    code[depth] = '0'; printCodes(root->left, code, depth+1);
    code[depth] = '1'; printCodes(root->right, code, depth+1);
}` },
      { lang: 'Python', code: `import heapq

def huffman(freqs):
    """构建 Huffman 树并生成编码"""
    # 最小堆：(频率, 序号, 节点)
    heap = [(f, i, c) for i, (c, f) in enumerate(freqs)]
    heapq.heapify(heap)
    idx = len(freqs)
    tree = {}
    while len(heap) > 1:
        f1, _, n1 = heapq.heappop(heap)  # 取最小
        f2, _, n2 = heapq.heappop(heap)  # 取次小
        merged = (n1, n2)
        heapq.heappush(heap, (f1+f2, idx, merged))
        idx += 1

    # 生成编码
    def walk(node, code=""):
        if isinstance(node, str):
            tree[node] = code; return
        walk(node[0], code+"0")
        walk(node[1], code+"1")
    walk(heap[0][2])
    return tree

freqs = [('A',5),('B',9),('C',12),('D',13),('E',16),('F',45)]
for ch, code in sorted(huffman(freqs).items()):
    print(f"{ch}: {code}")` },
      { lang: 'JavaScript', code: `function huffman(freqs) {
  // 简易最小堆（数组排序模拟）
  let nodes = freqs.map(([ch,f]) => ({ch,freq:f,left:null,right:null}));
  while (nodes.length > 1) {
    nodes.sort((a,b) => a.freq - b.freq);
    const l = nodes.shift(), r = nodes.shift();
    nodes.push({ ch:null, freq:l.freq+r.freq, left:l, right:r });
  }
  // 生成编码
  const codes = {};
  function walk(node, code="") {
    if (node.ch) { codes[node.ch] = code; return; }
    walk(node.left, code+"0");
    walk(node.right, code+"1");
  }
  walk(nodes[0]);
  return codes;
}

console.log(huffman([['A',5],['B',9],['C',12],['D',13],['E',16],['F',45]]));` },
      { lang: 'TypeScript', code: `interface HNode { ch:string|null; freq:number; left:HNode|null; right:HNode|null }

function huffman(freqs: [string,number][]): Record<string,string> {
  let nodes: HNode[] = freqs.map(([ch,f]) => ({ch,freq:f,left:null,right:null}));
  while (nodes.length > 1) {
    nodes.sort((a,b) => a.freq - b.freq);
    const l = nodes.shift()!, r = nodes.shift()!;
    nodes.push({ch:null, freq:l.freq+r.freq, left:l, right:r});
  }
  const codes: Record<string,string> = {};
  function walk(n: HNode, code="") {
    if (n.ch) { codes[n.ch] = code; return; }
    if (n.left) walk(n.left, code+"0");
    if (n.right) walk(n.right, code+"1");
  }
  walk(nodes[0]);
  return codes;
}` },
      { lang: 'Java', code: `import java.util.*;

public class Huffman {
    static class Node implements Comparable<Node> {
        char ch; int freq; Node left, right;
        Node(char c,int f){ch=c;freq=f;}
        public int compareTo(Node o){return freq-o.freq;}
    }
    public static Map<Character,String> build(char[] chars, int[] freqs) {
        PriorityQueue<Node> pq = new PriorityQueue<>();
        for (int i = 0; i < chars.length; i++) pq.add(new Node(chars[i], freqs[i]));
        while (pq.size() > 1) {
            Node l=pq.poll(), r=pq.poll();
            Node p = new Node('\\0', l.freq+r.freq);
            p.left=l; p.right=r; pq.add(p);
        }
        Map<Character,String> codes = new HashMap<>();
        walk(pq.poll(), "", codes);
        return codes;
    }
    static void walk(Node n, String code, Map<Character,String> codes) {
        if (n.left==null && n.right==null) { codes.put(n.ch, code); return; }
        if (n.left!=null) walk(n.left, code+"0", codes);
        if (n.right!=null) walk(n.right, code+"1", codes);
    }
}` },
    ],
  }
}

// ==================== Prim ====================

function prim(): AlgorithmContent {
  return {
    title: 'Prim 最小生成树',
    description: [
      { type: 'text', content: 'Prim 算法从一个起点开始，每次选择连接「已选集合」和「未选集合」的最小权边，将新节点纳入已选集合。逐步扩展直到所有节点都被选中。' },
      { type: 'text', content: '类似 Dijkstra 的思路（贪心选最小），但 Prim 比较的是「边权」而非「总距离」。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['类型', '贪心'], ['适用', '无向连通图'], ['思路', '从一个点出发，每次选最小跨越边']] } },
    ],
    approach: `**初始化**：任选一个起点加入已选集合 S，其余在 V-S 中。

**重复**：
1. 找所有跨越 S 和 V-S 的边中权值最小的 (u,v)
2. 将 v 加入 S，将边 (u,v) 加入 MST
3. 直到 S = V

**贪心正确性（切割性质）**：对于任何将图分成两部分的切割，跨越切割的最小权边一定在某棵 MST 中。`,
    complexity: { time: 'O(V²) 朴素 / O(E log V) 优先队列', space: 'O(V)' },
    animation: { type: 'greedy', algorithm: 'prim', nodes: MST_NODES, edges: MST_EDGES },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#include <limits.h>
#define V 6
#define INF INT_MAX

// Prim：每次选最小跨越边
void prim(int graph[V][V]) {
    int inMST[V]={0}, key[V], parent[V];
    for(int i=0;i<V;i++){key[i]=INF;parent[i]=-1;}
    key[0]=0;
    for(int count=0;count<V;count++){
        int u=-1;
        for(int v=0;v<V;v++)
            if(!inMST[v]&&(u==-1||key[v]<key[u]))u=v;
        inMST[u]=1;
        for(int v=0;v<V;v++){
            if(graph[u][v]&&!inMST[v]&&graph[u][v]<key[v]){
                key[v]=graph[u][v]; parent[v]=u;
            }
        }
    }
    int total=0;
    for(int i=1;i<V;i++){printf("%c-%c: %d\\n",'A'+parent[i],'A'+i,key[i]);total+=key[i];}
    printf("总权值: %d\\n",total);
}` },
      { lang: 'Python', code: `import heapq

def prim(graph, start='A'):
    """Prim: 从 start 出发，每次选最小跨越边"""
    visited = set()
    mst = []
    edges = [(0, start, None)]  # (权值, 节点, 来源)
    total = 0
    while edges and len(visited) < len(graph):
        w, u, frm = heapq.heappop(edges)
        if u in visited: continue
        visited.add(u)
        if frm is not None:
            mst.append((frm, u, w))
            total += w
        for v, wt in graph[u]:
            if v not in visited:
                heapq.heappush(edges, (wt, v, u))
    return mst, total

graph = {'A':[('B',4),('C',3)],'B':[('A',4),('C',5),('D',2)],'C':[('A',3),('B',5),('E',6)],
         'D':[('B',2),('E',1),('F',8)],'E':[('C',6),('D',1),('F',4)],'F':[('D',8),('E',4)]}
mst, total = prim(graph)
for u,v,w in mst: print(f"{u}-{v}: {w}")
print(f"总权值: {total}")` },
      { lang: 'JavaScript', code: `function prim(graph) {
  const visited = new Set(), mst = [];
  const edges = [[0, 'A', null]]; // [weight, node, from]
  let total = 0;
  while (edges.length && visited.size < Object.keys(graph).length) {
    edges.sort((a,b) => a[0]-b[0]);
    const [w, u, frm] = edges.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    if (frm) { mst.push([frm,u,w]); total += w; }
    for (const [v, wt] of graph[u])
      if (!visited.has(v)) edges.push([wt, v, u]);
  }
  return { mst, total };
}` },
      { lang: 'TypeScript', code: `function prim(graph: Record<string,[string,number][]>) {
  const visited = new Set<string>(), mst: [string,string,number][] = [];
  const edges: [number,string,string|null][] = [[0,'A',null]];
  let total = 0;
  while (edges.length && visited.size < Object.keys(graph).length) {
    edges.sort((a,b) => a[0]-b[0]);
    const [w,u,frm] = edges.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    if (frm) { mst.push([frm,u,w]); total += w; }
    for (const [v,wt] of graph[u]) if (!visited.has(v)) edges.push([wt,v,u]);
  }
  return { mst, total };
}` },
      { lang: 'Java', code: `import java.util.*;
public class Prim {
    public static int solve(Map<String,List<int[]>> graph) {
        Set<String> vis = new HashSet<>();
        var pq = new PriorityQueue<int[]>(Comparator.comparingInt(a->a[0]));
        pq.offer(new int[]{0,'A',0}); int total=0;
        while (!pq.isEmpty()) {
            int[] e = pq.poll(); String u=String.valueOf((char)e[1]);
            if (vis.contains(u)) continue;
            vis.add(u); total+=e[0];
            for (int[] nb : graph.getOrDefault(u,List.of())) {
                String v=String.valueOf((char)nb[0]);
                if (!vis.contains(v)) pq.offer(new int[]{nb[1],nb[0],0});
            }
        }
        return total;
    }
}` },
    ],
  }
}

// ==================== Kruskal ====================

function kruskal(): AlgorithmContent {
  return {
    title: 'Kruskal 最小生成树',
    description: [
      { type: 'text', content: 'Kruskal 算法从全局视角出发：将所有边按权值排序，从小到大依次加入，只要加入后不形成环（用并查集判断）。' },
      { type: 'text', content: 'Prim 是「以点为中心扩展」，Kruskal 是「以边为中心筛选」。Kruskal 更适合稀疏图。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['类型', '贪心'], ['适用', '无向连通图'], ['思路', '边排序，依次加入不成环的最小边']] } },
    ],
    approach: `**初始化**：每个节点自成一个连通分量（并查集）。

**流程**：
1. 将所有边按权值升序排序
2. 遍历每条边 (u, v, w)：
   - 若 u 和 v 不在同一连通分量 → 加入 MST，合并两个分量
   - 若 u 和 v 已连通 → 跳过（加入会成环）
3. 选了 V-1 条边后结束

**并查集**：用于 O(α(n)) 判断两点是否连通，以及合并连通分量。`,
    complexity: { time: 'O(E log E)', space: 'O(V)（并查集）' },
    animation: { type: 'greedy', algorithm: 'kruskal', nodes: MST_NODES, edges: MST_EDGES },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#include <stdlib.h>
#define V 6

int parent[V];
int find(int x) { return parent[x]==x ? x : (parent[x]=find(parent[x])); }
void unite(int a,int b) { parent[find(a)]=find(b); }

typedef struct { int u,v,w; } Edge;
int cmp(const void*a,const void*b){return ((Edge*)a)->w-((Edge*)b)->w;}

// Kruskal：边排序 + 并查集
void kruskal(Edge edges[], int E) {
    for(int i=0;i<V;i++) parent[i]=i;
    qsort(edges, E, sizeof(Edge), cmp);
    int total=0, count=0;
    for(int i=0;i<E && count<V-1;i++){
        if(find(edges[i].u)!=find(edges[i].v)){
            unite(edges[i].u,edges[i].v);
            printf("%c-%c: %d\\n",'A'+edges[i].u,'A'+edges[i].v,edges[i].w);
            total+=edges[i].w; count++;
        }
    }
    printf("总权值: %d\\n",total);
}` },
      { lang: 'Python', code: `class UnionFind:
    def __init__(self, n): self.p = list(range(n))
    def find(self, x):
        while self.p[x] != x: self.p[x]=self.p[self.p[x]]; x=self.p[x]
        return x
    def union(self, a, b): self.p[self.find(a)]=self.find(b)
    def connected(self, a, b): return self.find(a)==self.find(b)

def kruskal(n, edges):
    """Kruskal: 边排序 + 并查集"""
    edges.sort(key=lambda e: e[2])  # 按权值排序
    uf = UnionFind(n)
    mst, total = [], 0
    for u, v, w in edges:
        if not uf.connected(u, v):  # 不成环
            uf.union(u, v)
            mst.append((u, v, w))
            total += w
    return mst, total

edges = [(0,1,4),(0,2,3),(1,2,5),(1,3,2),(2,4,6),(3,4,1),(3,5,8),(4,5,4)]
mst, total = kruskal(6, edges)
for u,v,w in mst: print(f"{chr(65+u)}-{chr(65+v)}: {w}")
print(f"总权值: {total}")` },
      { lang: 'JavaScript', code: `class UnionFind {
  constructor(n) { this.p = Array.from({length:n},(_,i)=>i); }
  find(x) { while(this.p[x]!==x){this.p[x]=this.p[this.p[x]];x=this.p[x];} return x; }
  union(a,b) { this.p[this.find(a)]=this.find(b); }
  connected(a,b) { return this.find(a)===this.find(b); }
}

function kruskal(n, edges) {
  edges.sort((a,b) => a[2]-b[2]);
  const uf = new UnionFind(n), mst = [];
  let total = 0;
  for (const [u,v,w] of edges) {
    if (!uf.connected(u,v)) { uf.union(u,v); mst.push([u,v,w]); total+=w; }
  }
  return { mst, total };
}` },
      { lang: 'TypeScript', code: `class UnionFind {
  p: number[];
  constructor(n: number) { this.p = Array.from({length:n},(_,i)=>i); }
  find(x: number): number { while(this.p[x]!==x){this.p[x]=this.p[this.p[x]];x=this.p[x];}return x; }
  union(a:number,b:number) { this.p[this.find(a)]=this.find(b); }
  connected(a:number,b:number) { return this.find(a)===this.find(b); }
}

function kruskal(n: number, edges: [number,number,number][]) {
  edges.sort((a,b)=>a[2]-b[2]);
  const uf=new UnionFind(n), mst: [number,number,number][]=[];
  let total=0;
  for (const [u,v,w] of edges) {
    if (!uf.connected(u,v)){uf.union(u,v);mst.push([u,v,w]);total+=w;}
  }
  return {mst, total};
}` },
      { lang: 'Java', code: `import java.util.*;
public class Kruskal {
    static int[] parent;
    static int find(int x){return parent[x]==x?x:(parent[x]=find(parent[x]));}
    static void union(int a,int b){parent[find(a)]=find(b);}
    public static int solve(int V, int[][] edges) {
        parent=new int[V]; for(int i=0;i<V;i++) parent[i]=i;
        Arrays.sort(edges,(a,b)->a[2]-b[2]);
        int total=0,cnt=0;
        for(int[] e:edges){
            if(find(e[0])!=find(e[1])){
                union(e[0],e[1]); total+=e[2]; cnt++;
                if(cnt==V-1) break;
            }
        }
        return total;
    }
}` },
    ],
  }
}
