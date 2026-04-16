import type { AlgorithmNode, AlgorithmContent } from './algorithms'

export function sortingAlgorithms(): AlgorithmNode[] {
  return [
    {
      id: 'compare-sort',
      label: '比较类排序',
      children: [
        { id: 'sort-bubble', label: '冒泡排序', content: bubbleSort() },
        { id: 'sort-selection', label: '选择排序', content: selectionSort() },
        { id: 'sort-insertion', label: '插入排序', content: insertionSort() },
        { id: 'sort-shell', label: '希尔排序', content: shellSort() },
        { id: 'sort-merge', label: '归并排序', content: mergeSort() },
        { id: 'sort-quick', label: '快速排序', content: quickSort() },
        { id: 'sort-heap', label: '堆排序', content: heapSort() },
      ],
    },
    {
      id: 'non-compare-sort',
      label: '非比较类排序',
      children: [
        { id: 'sort-counting', label: '计数排序', content: countingSort() },
        { id: 'sort-bucket', label: '桶排序', content: bucketSort() },
        { id: 'sort-radix', label: '基数排序', content: radixSort() },
      ],
    },
  ]
}

// ==================== 冒泡排序 ====================

function bubbleSort(): AlgorithmContent {
  return {
    title: '冒泡排序',
    description: [
      { type: 'text', content: '冒泡排序是最基础的排序算法。它重复地遍历数组，每次比较相邻两个元素，如果顺序错误就交换它们。每一轮遍历会把当前未排序部分的最大值「冒泡」到末尾。' },
      { type: 'text', content: '名字由来：较大的元素像气泡一样逐步「浮」到数组末端。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['稳定性', '稳定'], ['是否原地', '是'], ['适用场景', '小规模数据、教学演示']] } },
    ],
    approach: `**基本流程**：
1. 外层循环 i 从 0 到 n-2，表示第几轮
2. 内层循环 j 从 0 到 n-2-i，比较 arr[j] 和 arr[j+1]
3. 如果 arr[j] > arr[j+1]，交换两者
4. 每轮结束后，末尾的 i+1 个元素已经有序

**优化**：如果某一轮没有发生任何交换，说明数组已经有序，可以提前退出。`,
    complexity: { time: '最好 O(n)，平均/最坏 O(n²)', space: 'O(1)' },
    animation: { type: 'sort', algorithm: 'bubble', data: [38, 27, 43, 3, 9, 82, 10] },
    codes: [
      { lang: 'C', code: `#include <stdio.h>

/**
 * 冒泡排序
 * 每一轮把最大值冒泡到末尾
 */
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int swapped = 0;  // 优化标记
        for (int j = 0; j < n - 1 - i; j++) {
            // 相邻元素比较，逆序则交换
            if (arr[j] > arr[j + 1]) {
                int tmp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = tmp;
                swapped = 1;
            }
        }
        // 本轮无交换，数组已有序
        if (!swapped) break;
    }
}

int main() {
    int arr[] = {38, 27, 43, 3, 9, 82, 10};
    int n = 7;
    bubbleSort(arr, n);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}` },
      { lang: 'Python', code: `def bubble_sort(arr: list[int]) -> list[int]:
    """
    冒泡排序
    每一轮把最大值冒泡到末尾
    """
    n = len(arr)
    for i in range(n - 1):
        swapped = False  # 优化标记
        for j in range(n - 1 - i):
            # 相邻元素比较，逆序则交换
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        # 本轮无交换，数组已有序
        if not swapped:
            break
    return arr

print(bubble_sort([38, 27, 43, 3, 9, 82, 10]))` },
      { lang: 'JavaScript', code: `/**
 * 冒泡排序
 * 每一轮把最大值冒泡到末尾
 */
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false; // 优化标记
    for (let j = 0; j < n - 1 - i; j++) {
      // 相邻元素比较，逆序则交换
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    // 本轮无交换，数组已有序
    if (!swapped) break;
  }
  return arr;
}

console.log(bubbleSort([38, 27, 43, 3, 9, 82, 10]));` },
      { lang: 'TypeScript', code: `function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false; // 优化标记
    for (let j = 0; j < n - 1 - i; j++) {
      // 相邻元素比较，逆序则交换
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return arr;
}

console.log(bubbleSort([38, 27, 43, 3, 9, 82, 10]));` },
      { lang: 'Java', code: `public class BubbleSort {
    /**
     * 冒泡排序
     * 每一轮把最大值冒泡到末尾
     */
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false; // 优化标记
            for (int j = 0; j < n - 1 - i; j++) {
                // 相邻元素比较，逆序则交换
                if (arr[j] > arr[j + 1]) {
                    int tmp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = tmp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }

    public static void main(String[] args) {
        int[] arr = {38, 27, 43, 3, 9, 82, 10};
        bubbleSort(arr);
        for (int v : arr) System.out.print(v + " ");
    }
}` },
    ],
  }
}

// ==================== 选择排序 ====================

function selectionSort(): AlgorithmContent {
  return {
    title: '选择排序',
    description: [
      { type: 'text', content: '选择排序的思路非常直观：每一轮从未排序区间中找到最小值，然后把它放到已排序区间的末尾。' },
      { type: 'text', content: '与冒泡排序不同，选择排序每轮只做一次交换（而非多次），但比较次数是固定的。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['稳定性', '不稳定'], ['是否原地', '是'], ['适用场景', '小规模数据、对交换次数敏感的场景']] } },
    ],
    approach: `**基本流程**：
1. 外层循环 i 从 0 到 n-2
2. 在 [i, n) 区间内找到最小值的索引 minIdx
3. 将 arr[minIdx] 与 arr[i] 交换
4. 此时 [0, i] 已有序

**不稳定原因**：交换操作可能打乱相等元素的相对顺序。
例如 [5a, 5b, 3]，第一轮会把 3 和 5a 交换，5a 跑到了 5b 后面。`,
    complexity: { time: 'O(n²)（固定）', space: 'O(1)' },
    animation: { type: 'sort', algorithm: 'selection', data: [64, 25, 12, 22, 11, 90] },
    codes: [
      { lang: 'C', code: `#include <stdio.h>

/**
 * 选择排序
 * 每轮从未排序区间找最小值，放到已排序区间末尾
 */
void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;  // 记录最小值索引
        // 在 [i+1, n) 中寻找更小的元素
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        // 将最小值交换到位置 i
        if (minIdx != i) {
            int tmp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = tmp;
        }
    }
}

int main() {
    int arr[] = {64, 25, 12, 22, 11, 90};
    int n = 6;
    selectionSort(arr, n);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}` },
      { lang: 'Python', code: `def selection_sort(arr: list[int]) -> list[int]:
    """
    选择排序
    每轮从未排序区间找最小值，放到已排序区间末尾
    """
    n = len(arr)
    for i in range(n - 1):
        min_idx = i  # 记录最小值索引
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        # 将最小值交换到位置 i
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

print(selection_sort([64, 25, 12, 22, 11, 90]))` },
      { lang: 'JavaScript', code: `/**
 * 选择排序
 * 每轮从未排序区间找最小值，放到已排序区间末尾
 */
function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i; // 记录最小值索引
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    // 将最小值交换到位置 i
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}

console.log(selectionSort([64, 25, 12, 22, 11, 90]));` },
      { lang: 'TypeScript', code: `function selectionSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}

console.log(selectionSort([64, 25, 12, 22, 11, 90]));` },
      { lang: 'Java', code: `public class SelectionSort {
    /**
     * 选择排序
     * 每轮从未排序区间找最小值，放到已排序区间末尾
     */
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            if (minIdx != i) {
                int tmp = arr[i];
                arr[i] = arr[minIdx];
                arr[minIdx] = tmp;
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 25, 12, 22, 11, 90};
        selectionSort(arr);
        for (int v : arr) System.out.print(v + " ");
    }
}` },
    ],
  }
}

// ==================== 插入排序 ====================

function insertionSort(): AlgorithmContent {
  return {
    title: '插入排序',
    description: [
      { type: 'text', content: '插入排序的思路类似打扑克牌时整理手牌：每次从未排序区间取出一个元素，在已排序区间中找到合适的位置插入。' },
      { type: 'text', content: '它在数据近乎有序时效率极高（接近 O(n)），也是许多高级排序算法（如 Tim Sort）的组成部分。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['稳定性', '稳定'], ['是否原地', '是'], ['适用场景', '小规模或近乎有序的数据']] } },
    ],
    approach: `**基本流程**：
1. 从第二个元素开始（i=1），将 arr[i] 作为待插入的 key
2. 在已排序区间 [0, i-1] 中从右向左扫描
3. 遇到比 key 大的元素就向右移一位
4. 找到 key 应该插入的位置后放入

**关键理解**：已排序区间像一个有序的「牌堆」，每次抽出一张新牌插到正确位置。`,
    complexity: { time: '最好 O(n)，平均/最坏 O(n²)', space: 'O(1)' },
    animation: { type: 'sort', algorithm: 'insertion', data: [12, 11, 13, 5, 6, 7] },
    codes: [
      { lang: 'C', code: `#include <stdio.h>

/**
 * 插入排序
 * 将每个元素插入到已排序区间的正确位置
 */
void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];  // 待插入元素
        int j = i - 1;
        // 将比 key 大的元素逐个后移
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        // 插入 key 到正确位置
        arr[j + 1] = key;
    }
}

int main() {
    int arr[] = {12, 11, 13, 5, 6, 7};
    int n = 6;
    insertionSort(arr, n);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}` },
      { lang: 'Python', code: `def insertion_sort(arr: list[int]) -> list[int]:
    """
    插入排序
    将每个元素插入到已排序区间的正确位置
    """
    for i in range(1, len(arr)):
        key = arr[i]  # 待插入元素
        j = i - 1
        # 将比 key 大的元素逐个后移
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        # 插入 key 到正确位置
        arr[j + 1] = key
    return arr

print(insertion_sort([12, 11, 13, 5, 6, 7]))` },
      { lang: 'JavaScript', code: `/**
 * 插入排序
 * 将每个元素插入到已排序区间的正确位置
 */
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i]; // 待插入元素
    let j = i - 1;
    // 将比 key 大的元素逐个后移
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

console.log(insertionSort([12, 11, 13, 5, 6, 7]));` },
      { lang: 'TypeScript', code: `function insertionSort(arr: number[]): number[] {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i]; // 待插入元素
    let j = i - 1;
    // 将比 key 大的元素逐个后移
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

console.log(insertionSort([12, 11, 13, 5, 6, 7]));` },
      { lang: 'Java', code: `public class InsertionSort {
    /**
     * 插入排序
     * 将每个元素插入到已排序区间的正确位置
     */
    public static void insertionSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i]; // 待插入元素
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        int[] arr = {12, 11, 13, 5, 6, 7};
        insertionSort(arr);
        for (int v : arr) System.out.print(v + " ");
    }
}` },
    ],
  }
}

// ==================== 希尔排序 ====================

function shellSort(): AlgorithmContent {
  return {
    title: '希尔排序',
    description: [
      { type: 'text', content: '希尔排序是插入排序的改进版。它先让间隔较远的元素有序，再逐步缩小间隔，最终间隔为 1 时退化为普通插入排序。由于此时数组已近乎有序，插入排序效率很高。' },
      { type: 'text', content: '间隔序列（gap sequence）的选择对性能影响很大。常见的有 Shell 序列（n/2, n/4, ...）、Hibbard 序列、Knuth 序列等。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['稳定性', '不稳定'], ['是否原地', '是'], ['适用场景', '中等规模数据']] } },
    ],
    approach: `**基本流程**：
1. 初始间隔 gap = n/2
2. 对每个间隔，执行间隔为 gap 的插入排序
3. gap 缩小为 gap/2，重复步骤 2
4. 直到 gap = 1，执行最后一次插入排序

**核心思想**：先消除大量的逆序对（大间隔），再处理小范围的微调（小间隔）。
这种「先粗调后微调」的策略让最终的插入排序几乎是 O(n) 的。`,
    complexity: { time: '取决于 gap 序列，Shell 序列约 O(n^1.5)', space: 'O(1)' },
    animation: { type: 'sort', algorithm: 'shell', data: [35, 33, 42, 10, 14, 19, 27, 44] },
    codes: [
      { lang: 'C', code: `#include <stdio.h>

/**
 * 希尔排序（Shell 序列 gap=n/2）
 * 对间隔为 gap 的子序列做插入排序，逐步缩小 gap
 */
void shellSort(int arr[], int n) {
    // 初始间隔为 n/2，逐步缩小到 1
    for (int gap = n / 2; gap > 0; gap /= 2) {
        // 对每个子序列做插入排序
        for (int i = gap; i < n; i++) {
            int key = arr[i];
            int j = i - gap;
            // 间隔为 gap 的插入排序
            while (j >= 0 && arr[j] > key) {
                arr[j + gap] = arr[j];
                j -= gap;
            }
            arr[j + gap] = key;
        }
    }
}

int main() {
    int arr[] = {35, 33, 42, 10, 14, 19, 27, 44};
    int n = 8;
    shellSort(arr, n);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}` },
      { lang: 'Python', code: `def shell_sort(arr: list[int]) -> list[int]:
    """
    希尔排序（Shell 序列 gap=n//2）
    对间隔为 gap 的子序列做插入排序，逐步缩小 gap
    """
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            key = arr[i]
            j = i - gap
            # 间隔为 gap 的插入排序
            while j >= 0 and arr[j] > key:
                arr[j + gap] = arr[j]
                j -= gap
            arr[j + gap] = key
        gap //= 2
    return arr

print(shell_sort([35, 33, 42, 10, 14, 19, 27, 44]))` },
      { lang: 'JavaScript', code: `/**
 * 希尔排序（Shell 序列 gap=n/2）
 * 对间隔为 gap 的子序列做插入排序，逐步缩小 gap
 */
function shellSort(arr) {
  const n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      const key = arr[i];
      let j = i - gap;
      while (j >= 0 && arr[j] > key) {
        arr[j + gap] = arr[j];
        j -= gap;
      }
      arr[j + gap] = key;
    }
  }
  return arr;
}

console.log(shellSort([35, 33, 42, 10, 14, 19, 27, 44]));` },
      { lang: 'TypeScript', code: `function shellSort(arr: number[]): number[] {
  const n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      const key = arr[i];
      let j = i - gap;
      while (j >= 0 && arr[j] > key) {
        arr[j + gap] = arr[j];
        j -= gap;
      }
      arr[j + gap] = key;
    }
  }
  return arr;
}

console.log(shellSort([35, 33, 42, 10, 14, 19, 27, 44]));` },
      { lang: 'Java', code: `public class ShellSort {
    /**
     * 希尔排序（Shell 序列 gap=n/2）
     * 对间隔为 gap 的子序列做插入排序，逐步缩小 gap
     */
    public static void shellSort(int[] arr) {
        int n = arr.length;
        for (int gap = n / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < n; i++) {
                int key = arr[i];
                int j = i - gap;
                while (j >= 0 && arr[j] > key) {
                    arr[j + gap] = arr[j];
                    j -= gap;
                }
                arr[j + gap] = key;
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {35, 33, 42, 10, 14, 19, 27, 44};
        shellSort(arr);
        for (int v : arr) System.out.print(v + " ");
    }
}` },
    ],
  }
}

// ==================== 归并排序 ====================

function mergeSort(): AlgorithmContent {
  return {
    title: '归并排序',
    description: [
      { type: 'text', content: '归并排序是分治法的经典应用。它将数组递归地拆分为两半，分别排序后再合并。合并操作是核心——两个有序子数组合并为一个有序数组。' },
      { type: 'text', content: '归并排序的时间复杂度稳定为 O(n log n)，不受输入数据分布影响，但需要额外 O(n) 空间。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['稳定性', '稳定'], ['是否原地', '否（需要 O(n) 额外空间）'], ['适用场景', '大规模数据、要求稳定排序、链表排序']] } },
    ],
    approach: `**分治三步**：
1. **分**（Divide）：将数组从中间一分为二
2. **治**（Conquer）：递归排序左右两半
3. **合**（Merge）：将两个有序子数组合并为一个有序数组

**合并操作**：
用两个指针分别指向左右子数组的开头，每次取较小的元素放入结果数组，直到全部合并完成。`,
    complexity: { time: 'O(n log n)（稳定）', space: 'O(n)' },
    animation: { type: 'sort', algorithm: 'merge', data: [38, 27, 43, 3, 9, 82, 10] },
    codes: [
      { lang: 'C', code: `#include <stdio.h>
#include <stdlib.h>

/**
 * 合并两个有序子数组 arr[l..m] 和 arr[m+1..r]
 */
void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int *L = malloc(n1 * sizeof(int));
    int *R = malloc(n2 * sizeof(int));
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

    int i = 0, j = 0, k = l;
    // 双指针归并：每次取较小的放入
    while (i < n1 && j < n2) {
        arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    }
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
    free(L); free(R);
}

/**
 * 归并排序：递归拆分再合并
 */
void mergeSort(int arr[], int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);      // 递归排左半
    mergeSort(arr, m + 1, r);  // 递归排右半
    merge(arr, l, m, r);       // 合并
}

int main() {
    int arr[] = {38, 27, 43, 3, 9, 82, 10};
    int n = 7;
    mergeSort(arr, 0, n - 1);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}` },
      { lang: 'Python', code: `def merge_sort(arr: list[int]) -> list[int]:
    """
    归并排序：递归拆分再合并
    """
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])   # 递归排左半
    right = merge_sort(arr[mid:])  # 递归排右半
    return merge(left, right)

def merge(left: list[int], right: list[int]) -> list[int]:
    """合并两个有序数组"""
    result = []
    i = j = 0
    # 双指针归并：每次取较小的放入
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

print(merge_sort([38, 27, 43, 3, 9, 82, 10]))` },
      { lang: 'JavaScript', code: `/**
 * 归并排序：递归拆分再合并
 */
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

/** 合并两个有序数组 */
function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  // 双指针归并：每次取较小的放入
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return result.concat(left.slice(i), right.slice(j));
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));` },
      { lang: 'TypeScript', code: `function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return result.concat(left.slice(i), right.slice(j));
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));` },
      { lang: 'Java', code: `import java.util.*;

public class MergeSort {
    /**
     * 归并排序：递归拆分再合并
     */
    public static void mergeSort(int[] arr, int l, int r) {
        if (l >= r) return;
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }

    /** 合并两个有序子数组 */
    static void merge(int[] arr, int l, int m, int r) {
        int[] tmp = Arrays.copyOfRange(arr, l, r + 1);
        int i = 0, j = m - l + 1, k = l;
        int mid = m - l;
        while (i <= mid && j < tmp.length) {
            arr[k++] = (tmp[i] <= tmp[j]) ? tmp[i++] : tmp[j++];
        }
        while (i <= mid) arr[k++] = tmp[i++];
        while (j < tmp.length) arr[k++] = tmp[j++];
    }

    public static void main(String[] args) {
        int[] arr = {38, 27, 43, 3, 9, 82, 10};
        mergeSort(arr, 0, arr.length - 1);
        for (int v : arr) System.out.print(v + " ");
    }
}` },
    ],
  }
}

// ==================== 快速排序 ====================

function quickSort(): AlgorithmContent {
  return {
    title: '快速排序',
    description: [
      { type: 'text', content: '快速排序是实践中最常用的排序算法之一。它选取一个「基准值」(pivot)，将数组分为「小于基准」和「大于基准」两部分，然后递归地对两部分排序。' },
      { type: 'text', content: '大多数编程语言标准库的排序函数都基于快速排序或其变体（如 Introsort）。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['稳定性', '不稳定'], ['是否原地', '是（递归栈 O(log n)）'], ['适用场景', '通用排序、大规模数据']] } },
    ],
    approach: `**分区操作**（Partition）是核心：
1. 选择基准值（常用最后一个元素、随机元素或三数取中）
2. 维护一个指针 i，表示「小于等于 pivot 区域」的右边界
3. 遍历数组，遇到小于 pivot 的元素就交换到 i 的位置，然后 i++
4. 最终将 pivot 放到 i 的位置，它左边全小于等于它，右边全大于它

**递归**：对 pivot 左右两侧分别递归执行快排。

**最坏情况**：每次 pivot 都选到极端值，退化为 O(n²)。随机化选 pivot 可避免。`,
    complexity: { time: '平均 O(n log n)，最坏 O(n²)', space: 'O(log n)（递归栈）' },
    animation: { type: 'sort', algorithm: 'quick', data: [10, 80, 30, 90, 40, 50, 70] },
    codes: [
      { lang: 'C', code: `#include <stdio.h>

/**
 * 分区：以 arr[r] 为基准值，将小于 pivot 的移到左边
 * 返回 pivot 的最终位置
 */
int partition(int arr[], int l, int r) {
    int pivot = arr[r];  // 取末尾元素为基准
    int i = l;           // i 指向小于区域的右边界
    for (int j = l; j < r; j++) {
        if (arr[j] < pivot) {
            // 将小于 pivot 的元素交换到左边
            int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
            i++;
        }
    }
    // 将 pivot 放到正确位置
    int tmp = arr[i]; arr[i] = arr[r]; arr[r] = tmp;
    return i;
}

/**
 * 快速排序：分区后递归
 */
void quickSort(int arr[], int l, int r) {
    if (l >= r) return;
    int p = partition(arr, l, r);
    quickSort(arr, l, p - 1);  // 递归排左半
    quickSort(arr, p + 1, r);  // 递归排右半
}

int main() {
    int arr[] = {10, 80, 30, 90, 40, 50, 70};
    int n = 7;
    quickSort(arr, 0, n - 1);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}` },
      { lang: 'Python', code: `def quick_sort(arr: list[int], l: int = 0, r: int = -1) -> list[int]:
    """快速排序：分区后递归"""
    if r == -1: r = len(arr) - 1
    if l >= r: return arr
    p = partition(arr, l, r)
    quick_sort(arr, l, p - 1)
    quick_sort(arr, p + 1, r)
    return arr

def partition(arr: list[int], l: int, r: int) -> int:
    """以 arr[r] 为基准，小于 pivot 的移到左边"""
    pivot = arr[r]
    i = l  # i 指向小于区域的右边界
    for j in range(l, r):
        if arr[j] < pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[r] = arr[r], arr[i]
    return i

print(quick_sort([10, 80, 30, 90, 40, 50, 70]))` },
      { lang: 'JavaScript', code: `/**
 * 快速排序：分区后递归
 */
function quickSort(arr, l = 0, r = arr.length - 1) {
  if (l >= r) return arr;
  const p = partition(arr, l, r);
  quickSort(arr, l, p - 1);
  quickSort(arr, p + 1, r);
  return arr;
}

/** 以 arr[r] 为基准，小于 pivot 的移到左边 */
function partition(arr, l, r) {
  const pivot = arr[r];
  let i = l; // i 指向小于区域的右边界
  for (let j = l; j < r; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[r]] = [arr[r], arr[i]];
  return i;
}

console.log(quickSort([10, 80, 30, 90, 40, 50, 70]));` },
      { lang: 'TypeScript', code: `function quickSort(arr: number[], l = 0, r = arr.length - 1): number[] {
  if (l >= r) return arr;
  const p = partition(arr, l, r);
  quickSort(arr, l, p - 1);
  quickSort(arr, p + 1, r);
  return arr;
}

function partition(arr: number[], l: number, r: number): number {
  const pivot = arr[r];
  let i = l;
  for (let j = l; j < r; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[r]] = [arr[r], arr[i]];
  return i;
}

console.log(quickSort([10, 80, 30, 90, 40, 50, 70]));` },
      { lang: 'Java', code: `public class QuickSort {
    /** 快速排序：分区后递归 */
    public static void quickSort(int[] arr, int l, int r) {
        if (l >= r) return;
        int p = partition(arr, l, r);
        quickSort(arr, l, p - 1);
        quickSort(arr, p + 1, r);
    }

    /** 以 arr[r] 为基准，小于 pivot 的移到左边 */
    static int partition(int[] arr, int l, int r) {
        int pivot = arr[r];
        int i = l;
        for (int j = l; j < r; j++) {
            if (arr[j] < pivot) {
                int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
                i++;
            }
        }
        int tmp = arr[i]; arr[i] = arr[r]; arr[r] = tmp;
        return i;
    }

    public static void main(String[] args) {
        int[] arr = {10, 80, 30, 90, 40, 50, 70};
        quickSort(arr, 0, arr.length - 1);
        for (int v : arr) System.out.print(v + " ");
    }
}` },
    ],
  }
}

// ==================== 堆排序 ====================

function heapSort(): AlgorithmContent {
  return {
    title: '堆排序',
    description: [
      { type: 'text', content: '堆排序利用二叉堆数据结构进行排序。先将数组构建为一个大顶堆（每个节点都大于其子节点），然后反复将堆顶（最大值）与末尾交换并缩小堆的范围，重新维护堆的性质。' },
      { type: 'text', content: '堆排序的时间复杂度稳定为 O(n log n)，且只需 O(1) 额外空间，但由于缓存不友好（跳跃式访问），实践中通常比快排慢。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['稳定性', '不稳定'], ['是否原地', '是'], ['适用场景', '需要 O(n log n) 最坏保证、Top-K 问题']] } },
    ],
    approach: `**两个阶段**：

**阶段一：建堆**（Build Max Heap）
从最后一个非叶子节点开始，自底向上执行 heapify，将数组调整为大顶堆。

**阶段二：排序**（Sort）
1. 将堆顶（最大值）与数组末尾交换
2. 堆的有效范围缩小 1
3. 对堆顶执行 heapify 恢复堆性质
4. 重复直到堆为空

**heapify 操作**：
将节点 i 与其左右子节点比较，若子节点更大则交换并继续向下调整，直到满足大顶堆性质。`,
    complexity: { time: 'O(n log n)（稳定）', space: 'O(1)' },
    animation: { type: 'sort', algorithm: 'heap', data: [4, 10, 3, 5, 1, 8, 7] },
    codes: [
      { lang: 'C', code: `#include <stdio.h>

/**
 * 下沉操作：将节点 i 调整到满足大顶堆性质
 * n 为堆的有效大小
 */
void heapify(int arr[], int n, int i) {
    int largest = i;
    int left = 2 * i + 1, right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest])   largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        int tmp = arr[i]; arr[i] = arr[largest]; arr[largest] = tmp;
        heapify(arr, n, largest);  // 继续向下调整
    }
}

/**
 * 堆排序：先建大顶堆，再逐个取出堆顶
 */
void heapSort(int arr[], int n) {
    // 阶段一：建堆（从最后一个非叶子节点开始）
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);
    // 阶段二：排序（堆顶与末尾交换，缩小堆范围）
    for (int i = n - 1; i > 0; i--) {
        int tmp = arr[0]; arr[0] = arr[i]; arr[i] = tmp;
        heapify(arr, i, 0);
    }
}

int main() {
    int arr[] = {4, 10, 3, 5, 1, 8, 7};
    int n = 7;
    heapSort(arr, n);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}` },
      { lang: 'Python', code: `def heap_sort(arr: list[int]) -> list[int]:
    """堆排序：先建大顶堆，再逐个取出堆顶"""
    n = len(arr)
    # 阶段一：建堆
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    # 阶段二：排序
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    return arr

def heapify(arr: list[int], n: int, i: int):
    """下沉操作：将节点 i 调整到满足大顶堆性质"""
    largest = i
    left, right = 2 * i + 1, 2 * i + 2
    if left < n and arr[left] > arr[largest]:   largest = left
    if right < n and arr[right] > arr[largest]: largest = right
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

print(heap_sort([4, 10, 3, 5, 1, 8, 7]))` },
      { lang: 'JavaScript', code: `/**
 * 堆排序：先建大顶堆，再逐个取出堆顶
 */
function heapSort(arr) {
  const n = arr.length;
  // 阶段一：建堆
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--)
    heapify(arr, n, i);
  // 阶段二：排序
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}

/** 下沉操作：将节点 i 调整到满足大顶堆性质 */
function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1, right = 2 * i + 2;
  if (left < n && arr[left] > arr[largest])   largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}

console.log(heapSort([4, 10, 3, 5, 1, 8, 7]));` },
      { lang: 'TypeScript', code: `function heapSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--)
    heapify(arr, n, i);
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}

function heapify(arr: number[], n: number, i: number): void {
  let largest = i;
  const left = 2 * i + 1, right = 2 * i + 2;
  if (left < n && arr[left] > arr[largest])   largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}

console.log(heapSort([4, 10, 3, 5, 1, 8, 7]));` },
      { lang: 'Java', code: `public class HeapSort {
    /** 堆排序：先建大顶堆，再逐个取出堆顶 */
    public static void heapSort(int[] arr) {
        int n = arr.length;
        // 阶段一：建堆
        for (int i = n / 2 - 1; i >= 0; i--)
            heapify(arr, n, i);
        // 阶段二：排序
        for (int i = n - 1; i > 0; i--) {
            int tmp = arr[0]; arr[0] = arr[i]; arr[i] = tmp;
            heapify(arr, i, 0);
        }
    }

    /** 下沉操作：将节点 i 调整到满足大顶堆性质 */
    static void heapify(int[] arr, int n, int i) {
        int largest = i;
        int left = 2 * i + 1, right = 2 * i + 2;
        if (left < n && arr[left] > arr[largest])   largest = left;
        if (right < n && arr[right] > arr[largest]) largest = right;
        if (largest != i) {
            int tmp = arr[i]; arr[i] = arr[largest]; arr[largest] = tmp;
            heapify(arr, n, largest);
        }
    }

    public static void main(String[] args) {
        int[] arr = {4, 10, 3, 5, 1, 8, 7};
        heapSort(arr);
        for (int v : arr) System.out.print(v + " ");
    }
}` },
    ],
  }
}

// ==================== 计数排序 ====================
function countingSort(): AlgorithmContent {
  return {
    title: '计数排序',
    description: [
      { type: 'text', content: '计数排序不通过比较元素大小，而是统计每个值出现的次数，然后根据计数数组直接将元素放到正确位置。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['稳定性', '稳定'], ['是否原地', '否'], ['适用场景', '元素范围小的非负整数']] } },
    ],
    approach: `**第一步：计数** — count[v]++ 统计每个值出现次数。

**第二步：前缀和** — count[v] 累加为 <= v 的元素总数。

**第三步：放置** — 从右向左遍历原数组（稳定），放到 output[count[arr[i]] - 1]。`,
    complexity: { time: 'O(n + k)，k 为值域范围', space: 'O(n + k)' },
    animation: { type: 'sort', algorithm: 'counting', data: [4, 2, 2, 8, 3, 3, 1] },
    codes: [
      { lang: 'C', code: `#include <stdio.h>\n#include <string.h>\nvoid countingSort(int a[],int n){\n    int mx=0; for(int i=0;i<n;i++) if(a[i]>mx) mx=a[i];\n    int c[mx+1]; memset(c,0,sizeof(c));\n    for(int i=0;i<n;i++) c[a[i]]++;\n    for(int i=1;i<=mx;i++) c[i]+=c[i-1];\n    int o[n];\n    for(int i=n-1;i>=0;i--){o[c[a[i]]-1]=a[i];c[a[i]]--;}\n    for(int i=0;i<n;i++) a[i]=o[i];\n}\nint main(){int a[]={4,2,2,8,3,3,1};countingSort(a,7);for(int i=0;i<7;i++)printf("%d ",a[i]);}` },
      { lang: 'Python', code: `def counting_sort(arr):\n    mx = max(arr)\n    count = [0]*(mx+1)\n    for v in arr: count[v] += 1\n    for i in range(1,mx+1): count[i] += count[i-1]\n    out = [0]*len(arr)\n    for v in reversed(arr): out[count[v]-1]=v; count[v]-=1\n    return out\n\nprint(counting_sort([4,2,2,8,3,3,1]))` },
      { lang: 'JavaScript', code: `function countingSort(arr) {\n  const mx = Math.max(...arr), c = Array(mx+1).fill(0);\n  for (const v of arr) c[v]++;\n  for (let i=1;i<=mx;i++) c[i]+=c[i-1];\n  const o = Array(arr.length);\n  for (let i=arr.length-1;i>=0;i--) {o[c[arr[i]]-1]=arr[i];c[arr[i]]--;}\n  return o;\n}\nconsole.log(countingSort([4,2,2,8,3,3,1]));` },
      { lang: 'TypeScript', code: `function countingSort(arr: number[]): number[] {\n  const mx = Math.max(...arr), c = Array(mx+1).fill(0);\n  for (const v of arr) c[v]++;\n  for (let i=1;i<=mx;i++) c[i]+=c[i-1];\n  const o = Array(arr.length);\n  for (let i=arr.length-1;i>=0;i--) {o[c[arr[i]]-1]=arr[i];c[arr[i]]--;}\n  return o;\n}\nconsole.log(countingSort([4,2,2,8,3,3,1]));` },
      { lang: 'Java', code: `import java.util.*;\npublic class CountingSort {\n    public static int[] sort(int[] a) {\n        int mx=Arrays.stream(a).max().orElse(0);\n        int[] c=new int[mx+1];\n        for(int v:a) c[v]++;\n        for(int i=1;i<=mx;i++) c[i]+=c[i-1];\n        int[] o=new int[a.length];\n        for(int i=a.length-1;i>=0;i--){o[c[a[i]]-1]=a[i];c[a[i]]--;}\n        return o;\n    }\n    public static void main(String[] x){for(int v:sort(new int[]{4,2,2,8,3,3,1})) System.out.print(v+" ");}\n}` },
    ],
  }
}

// ==================== 桶排序 ====================
function bucketSort(): AlgorithmContent {
  return {
    title: '桶排序',
    description: [
      { type: 'text', content: '桶排序将元素分散到若干「桶」中，每个桶内单独排序，最后按桶顺序合并。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['稳定性', '取决于桶内排序'], ['是否原地', '否'], ['适用场景', '数据均匀分布']] } },
    ],
    approach: `**第一步：分桶** — bucketIdx = floor(value / maxValue * (n-1))

**第二步：桶内排序** — 每个桶用插入排序。

**第三步：合并** — 按桶顺序取出所有元素。`,
    complexity: { time: '平均 O(n+k)，最坏 O(n²)', space: 'O(n+k)' },
    animation: { type: 'sort', algorithm: 'bucket', data: [42, 32, 23, 52, 25, 47, 51] },
    codes: [
      { lang: 'C', code: `#include <stdio.h>\n#include <stdlib.h>\nvoid bucketSort(int a[],int n){\n    int mx=a[0]; for(int i=1;i<n;i++) if(a[i]>mx) mx=a[i];\n    int **bk=malloc(n*sizeof(int*)),*sz=calloc(n,sizeof(int));\n    for(int i=0;i<n;i++) bk[i]=malloc(n*sizeof(int));\n    for(int i=0;i<n;i++){int bi=(long long)a[i]*(n-1)/mx;bk[bi][sz[bi]++]=a[i];}\n    int idx=0;\n    for(int b=0;b<n;b++){\n        for(int i=1;i<sz[b];i++){int k=bk[b][i],j=i-1;while(j>=0&&bk[b][j]>k){bk[b][j+1]=bk[b][j];j--;}bk[b][j+1]=k;}\n        for(int i=0;i<sz[b];i++) a[idx++]=bk[b][i];free(bk[b]);}\n    free(bk);free(sz);\n}\nint main(){int a[]={42,32,23,52,25,47,51};bucketSort(a,7);for(int i=0;i<7;i++)printf("%d ",a[i]);}` },
      { lang: 'Python', code: `def bucket_sort(arr):\n    n, mx = len(arr), max(arr)\n    bk = [[] for _ in range(n)]\n    for v in arr: bk[v*(n-1)//mx].append(v)\n    res = []\n    for b in bk: b.sort(); res.extend(b)\n    return res\n\nprint(bucket_sort([42,32,23,52,25,47,51]))` },
      { lang: 'JavaScript', code: `function bucketSort(arr) {\n  const n=arr.length, mx=Math.max(...arr);\n  const bk=Array.from({length:n},()=>[]);\n  for(const v of arr) bk[Math.floor(v*(n-1)/mx)].push(v);\n  return bk.flatMap(b=>b.sort((a,b)=>a-b));\n}\nconsole.log(bucketSort([42,32,23,52,25,47,51]));` },
      { lang: 'TypeScript', code: `function bucketSort(arr: number[]): number[] {\n  const n=arr.length, mx=Math.max(...arr);\n  const bk: number[][]=Array.from({length:n},()=>[]);\n  for(const v of arr) bk[Math.floor(v*(n-1)/mx)].push(v);\n  return bk.flatMap(b=>b.sort((a,b)=>a-b));\n}\nconsole.log(bucketSort([42,32,23,52,25,47,51]));` },
      { lang: 'Java', code: `import java.util.*;\npublic class BucketSort {\n    public static void sort(int[] a){\n        int n=a.length,mx=Arrays.stream(a).max().orElse(0);\n        var bk=new ArrayList<List<Integer>>();\n        for(int i=0;i<n;i++) bk.add(new ArrayList<>());\n        for(int v:a) bk.get((int)((long)v*(n-1)/mx)).add(v);\n        int idx=0; for(var b:bk){Collections.sort(b);for(int v:b) a[idx++]=v;}\n    }\n    public static void main(String[] x){int[] a={42,32,23,52,25,47,51};sort(a);for(int v:a) System.out.print(v+" ");}\n}` },
    ],
  }
}

// ==================== 基数排序 ====================
function radixSort(): AlgorithmContent {
  return {
    title: '基数排序',
    description: [
      { type: 'text', content: '基数排序按位数逐位排序：从最低位开始，每一位使用稳定的计数排序。经过最高位排序后整个数组有序。' },
      { type: 'table', table: { headers: ['特性', '值'], rows: [['稳定性', '稳定'], ['是否原地', '否'], ['适用场景', '整数或等长字符串']] } },
    ],
    approach: `**LSD（最低位优先）**：
1. 按个位做一次计数排序
2. 按十位做一次计数排序
3. …直到最高位

**为什么必须用稳定排序？** 高位相同的元素需保持低位排序结果。`,
    complexity: { time: 'O(d*(n+b))，d=位数，b=基数', space: 'O(n+b)' },
    animation: { type: 'sort', algorithm: 'radix', data: [170, 45, 75, 90, 802, 24, 2, 66] },
    codes: [
      { lang: 'C', code: `#include <stdio.h>\n#include <string.h>\nvoid cntDig(int a[],int n,int e){\n    int o[n],c[10]={0};\n    for(int i=0;i<n;i++) c[(a[i]/e)%10]++;\n    for(int i=1;i<10;i++) c[i]+=c[i-1];\n    for(int i=n-1;i>=0;i--){int d=(a[i]/e)%10;o[c[d]-1]=a[i];c[d]--;}\n    for(int i=0;i<n;i++) a[i]=o[i];\n}\nvoid radixSort(int a[],int n){\n    int mx=a[0]; for(int i=1;i<n;i++) if(a[i]>mx)mx=a[i];\n    for(int e=1;mx/e>0;e*=10) cntDig(a,n,e);\n}\nint main(){int a[]={170,45,75,90,802,24,2,66};radixSort(a,8);for(int i=0;i<8;i++)printf("%d ",a[i]);}` },
      { lang: 'Python', code: `def radix_sort(arr):\n    mx, exp = max(arr), 1\n    while mx // exp > 0:\n        c = [0]*10\n        for v in arr: c[(v//exp)%10] += 1\n        for i in range(1,10): c[i]+=c[i-1]\n        out = [0]*len(arr)\n        for v in reversed(arr): d=(v//exp)%10; out[c[d]-1]=v; c[d]-=1\n        arr=out; exp*=10\n    return arr\n\nprint(radix_sort([170,45,75,90,802,24,2,66]))` },
      { lang: 'JavaScript', code: `function radixSort(arr) {\n  let mx=Math.max(...arr);\n  for(let e=1;Math.floor(mx/e)>0;e*=10){\n    const c=Array(10).fill(0), o=Array(arr.length);\n    for(const v of arr) c[Math.floor(v/e)%10]++;\n    for(let i=1;i<10;i++) c[i]+=c[i-1];\n    for(let i=arr.length-1;i>=0;i--){const d=Math.floor(arr[i]/e)%10;o[c[d]-1]=arr[i];c[d]--;}\n    arr=o;\n  }\n  return arr;\n}\nconsole.log(radixSort([170,45,75,90,802,24,2,66]));` },
      { lang: 'TypeScript', code: `function radixSort(arr: number[]): number[] {\n  let mx=Math.max(...arr);\n  for(let e=1;Math.floor(mx/e)>0;e*=10){\n    const c=Array(10).fill(0), o=Array(arr.length);\n    for(const v of arr) c[Math.floor(v/e)%10]++;\n    for(let i=1;i<10;i++) c[i]+=c[i-1];\n    for(let i=arr.length-1;i>=0;i--){const d=Math.floor(arr[i]/e)%10;o[c[d]-1]=arr[i];c[d]--;}\n    arr=o;\n  }\n  return arr;\n}\nconsole.log(radixSort([170,45,75,90,802,24,2,66]));` },
      { lang: 'Java', code: `import java.util.*;\npublic class RadixSort {\n    public static void sort(int[] a){\n        int mx=Arrays.stream(a).max().orElse(0);\n        for(int e=1;mx/e>0;e*=10){\n            int[] c=new int[10],o=new int[a.length];\n            for(int v:a) c[(v/e)%10]++;\n            for(int i=1;i<10;i++) c[i]+=c[i-1];\n            for(int i=a.length-1;i>=0;i--){int d=(a[i]/e)%10;o[c[d]-1]=a[i];c[d]--;}\n            System.arraycopy(o,0,a,0,a.length);\n        }\n    }\n    public static void main(String[] x){int[] a={170,45,75,90,802,24,2,66};sort(a);for(int v:a)System.out.print(v+" ");}\n}` },
    ],
  }
}
