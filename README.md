# Smart Campus Navigator 🧭
> **DSA Mini-Project** &bull; Second Year Information Technology &bull; Thakur College of Engineering and Technology (TCET), Mumbai University

An academic Data Structures & Algorithms (DSA) mini-project implementing **Dijkstra's Shortest Path Algorithm** on a weighted undirected graph to navigate campus locations.

Provided with both a **modular C implementation** for standard command-line compilation and an **interactive local web application** with dynamic SVG graph visualization and step-by-step algorithm tracing.

---

## 1. Project Overview & Objective

Navigating large college campuses efficiently between lectures, practical labs, and administrative offices can be challenging for new students and visitors.

The **Smart Campus Navigator** models key college landmarks as **vertices** (nodes) and interconnecting walkways as **edges** with non-negative numerical distance weights. Given any starting location and destination, the system applies **Dijkstra's Algorithm** to compute the shortest walking path, the total distance, and step-by-step turn-by-turn directions.

> **Note on Map & Distances:** The campus graph is an illustrative schematic layout designed for academic demonstration of graph theory and Dijkstra's algorithm, not a GPS-measured physical survey of TCET.

---

## 2. Campus Graph & Adjacency Matrix

The system features **6 campus landmarks**:

| Vertex ID | Campus Landmark | Description |
|:---:|:---|:---|
| **0** | **Main Gate** | Primary campus entry point and security check |
| **1** | **IT Department** | Computer laboratories, classrooms & faculty offices |
| **2** | **Library** | Central study hall, books repository & reading room |
| **3** | **Canteen** | Student cafeteria & social recreation area |
| **4** | **Auditorium** | Seminar hall for conferences & cultural events |
| **5** | **Admin Office** | Principal office, registrar, accounts & student services |

### Adjacency Matrix Representation
Because the campus graph is **undirected**, walking between two connected landmarks has equal distance in both directions. Hence, the matrix is symmetric across its main diagonal. A value of `0` between distinct vertices denotes that no direct walkway exists:

```c
int graph[6][6] = {
    {0, 4, 2, 0, 0, 0},   // Row 0: Main Gate
    {4, 0, 1, 5, 0, 0},   // Row 1: IT Department
    {2, 1, 0, 8, 10, 0},  // Row 2: Library
    {0, 5, 8, 0, 2, 6},   // Row 3: Canteen
    {0, 0, 10, 2, 0, 3},  // Row 4: Auditorium
    {0, 0, 0, 6, 3, 0}    // Row 5: Admin Office
};
```

#### Walkway Distance Weights Summary:
1. `(0, 1)`: Main Gate &harr; IT Department = **4 units**
2. `(0, 2)`: Main Gate &harr; Library = **2 units**
3. `(1, 2)`: IT Department &harr; Library = **1 unit**
4. `(1, 3)`: IT Department &harr; Canteen = **5 units**
5. `(2, 3)`: Library &harr; Canteen = **8 units**
6. `(2, 4)`: Library &harr; Auditorium = **10 units**
7. `(3, 4)`: Canteen &harr; Auditorium = **2 units**
8. `(3, 5)`: Canteen &harr; Admin Office = **6 units**
9. `(4, 5)`: Auditorium &harr; Admin Office = **3 units**

---

## 3. Data Structures & Algorithm (DSA) Concepts

### How Dijkstra's Algorithm Works
Dijkstra's algorithm solves the **Single-Source Shortest Path (SSSP)** problem on graphs with non-negative edge weights using a **greedy strategy**:

1. **Initialization:**
   - Create a distance array `dist[V]` initialized to infinity (`INT_MAX` / `Infinity`).
   - Set the source distance `dist[src] = 0`.
   - Create a boolean array `visited[V]` initialized to `false`.
   - Create a parent array `parent[V]` initialized to `-1`.

2. **Greedy Selection (`minDistance`):**
   - In each of the $V - 1$ iterations, scan the unvisited vertices to select the vertex $u$ with the minimum tentative distance `dist[u]`.
   - Mark vertex $u$ as finalized (`visited[u] = true`).

3. **Edge Relaxation:**
   - For every unvisited neighbor $v$ of vertex $u$ with an edge weight $w = \text{graph}[u][v] > 0$:
     $$\text{If } \text{dist}[u] + w < \text{dist}[v] \implies \text{dist}[v] = \text{dist}[u] + w, \quad \text{parent}[v] = u$$

4. **Path Reconstruction (The Role of the `parent` Array):**
   - While `dist[dest]` gives the final numerical distance, the `parent[]` array stores which landmark led directly to vertex $v$ along the shortest route.
   - Tracing backwards from destination $dest$ via `parent[dest]` up to source ($parent[src] = -1$) and reversing the sequence yields the exact sequence of campus turns.

### Time & Space Complexity

- **Time Complexity:** $\mathcal{O}(V^2)$
  - In our implementation using an adjacency matrix, finding the minimum unvisited vertex takes $\mathcal{O}(V)$ time via linear search.
  - This is repeated $V$ times: $V \times \mathcal{O}(V) = \mathcal{O}(V^2)$.
  - *Viva Note:* For very large sparse graphs ($|E| \ll |V|^2$), using an Adjacency List with a Min-Heap/Priority Queue reduces time complexity to $\mathcal{O}((V + E) \log V)$. For campus networks with a small constant number of landmarks ($V = 6$), the $\mathcal{O}(V^2)$ matrix approach is optimal, simple, and cache-friendly.
- **Space Complexity:**
  - $\mathcal{O}(V^2)$ for the $6 \times 6$ adjacency matrix.
  - $\mathcal{O}(V)$ auxiliary space for arrays `dist[6]`, `visited[6]`, and `parent[6]`.

---

## 4. Academic Reference Test Benchmarks

### Primary Reference Test: Main Gate (0) &rarr; Auditorium (4)
- **Computed Path:** `Main Gate (0) -> Library (2) -> IT Department (1) -> Canteen (3) -> Auditorium (4)`
- **Mathematical Calculation:**
  $$\text{dist} = 2 + 1 + 5 + 2 = 10 \text{ distance units}$$
- *Why direct path is longer:* The direct path `Main Gate -> Library -> Auditorium` has a total distance of $2 + 10 = 12$ units. Dijkstra's greedy edge relaxation successfully discovers the detour through IT Department and Canteen with a lower distance of **10 units**.

### Other Key Benchmarks:
- **Main Gate (0) &rarr; IT Department (1):** Path: `Main Gate -> Library -> IT Dept` (Distance: $2 + 1 = 3$ units; beats direct edge of 4 units).
- **Main Gate (0) &rarr; Library (2):** Path: `Main Gate -> Library` (Distance: 2 units).
- **Same Landmark (e.g., 3 &rarr; 3):** Distance: 0 units; path contains just that landmark.

---

## 5. Project File Structure

```text
smart-campus-navigator/
├── index.html     # HTML5 structure with semantic components & accessible form controls
├── styles.css     # Responsive dashboard CSS, navy/blue design system, zero external fonts
├── script.js      # Dijkstra algorithm, SVG graph renderer, execution tracer & event handlers
├── main.c         # Pure C99 implementation with robust input handling & path reconstruction
└── README.md      # Comprehensive project documentation & viva study guide
```

---

## 6. How to Run the Project

### A. Running the Web Prototype (Recommended for Visual Demo)

No web server, node modules, or internet connection is required:

1. Simply **double-click `index.html`** in your file manager (File Explorer).
2. It will open in Google Chrome, Microsoft Edge, Mozilla Firefox, or any modern web browser.
3. Select your desired starting landmark and destination landmark from the dropdowns, or click on the preset benchmark buttons.
4. Click **"Find Shortest Route"** or click directly on any landmark node on the interactive SVG canvas.
5. The application will instantly highlight the optimal path on the map, list turn-by-turn directions, show the full Dijkstra execution trace table, and highlight the path in the adjacency matrix.
6. Click **"Reset"** to clear the previous calculation and restore the initial state.

---

### B. Compiling & Running the C Program (`main.c`)

The C program is standard ANSI C / C99 and compiles with GCC/MinGW, Clang, or MSVC on Windows, Linux, and macOS.

#### Windows (GCC / MinGW):
Open Command Prompt (`cmd`) or PowerShell in the project directory:

```bash
# Compile the C program
gcc main.c -o navigator.exe

# Run the executable
navigator.exe
```

#### Linux / macOS:
```bash
# Compile
gcc -std=c99 -Wall main.c -o navigator

# Run
./navigator
```

#### Sample C Execution Preview:
```text
*******************************************************
*           TCET SMART CAMPUS NAVIGATOR               *
*   Dijkstra's Algorithm - Graph Theory Demonstration *
*******************************************************

=======================================================
   TCET SMART CAMPUS NAVIGATOR - CAMPUS LANDMARKS     
=======================================================
  ID  | Location Name
 -----+------------------------------------------------
  [0] | Main Gate
  [1] | IT Department
  [2] | Library
  [3] | Canteen
  [4] | Auditorium
  [5] | Admin Office
=======================================================

Select an option:
  [1] Find Shortest Route Between Two Landmarks
  [2] Run Mandatory Academic Reference Test (Main Gate -> Auditorium)
  [3] Exit Navigator
Enter your choice (1-3): 2

--- Running Mandatory Academic Benchmark Test ---
Source     : Main Gate (ID: 0)
Destination: Auditorium (ID: 4)

=======================================================
                  NAVIGATION RESULT                    
=======================================================
  Start Point       : Main Gate (ID 0)
  Destination       : Auditorium (ID 4)
 -------------------------------------------------------
  Total Distance    : 10 units
  Calculated Route  : Main Gate -> Library -> IT Department -> Canteen -> Auditorium
 -------------------------------------------------------
  Step-by-Step Navigation Directions:
   Step 1: Walk from Main Gate      -> Library        [Leg:  2 units | Total:  2 units]
   Step 2: Walk from Library        -> IT Department  [Leg:  1 units | Total:  3 units]
   Step 3: Walk from IT Department  -> Canteen        [Leg:  5 units | Total:  8 units]
   Step 4: Walk from Canteen        -> Auditorium     [Leg:  2 units | Total: 10 units]
=======================================================
```

---

## 7. Viva Questions & Quick Answers

1. **Q: Why does Dijkstra's algorithm fail with negative edge weights?**
   - *A:* Dijkstra assumes that once a vertex is marked visited (finalized), its shortest distance will never decrease. A negative edge could later reduce the distance of an already visited vertex, violating this greedy premise. (Bellman-Ford algorithm should be used for graphs with negative weights). In a campus navigation system, walking distances are physical measurements and strictly non-negative ($\ge 0$).

2. **Q: What is the purpose of the `visited[]` array?**
   - *A:* It ensures that each vertex is finalized exactly once and prevents infinite cycles or redundant edge checks.

3. **Q: How does `minDistance()` work?**
   - *A:* It scans through all unvisited vertices to find the one with the smallest tentative distance value in `dist[]`.

4. **Q: Why is an adjacency matrix preferred over an adjacency list for this project?**
   - *A:* For a fixed small number of landmarks ($V = 6$), the adjacency matrix provides instant $\mathcal{O}(1)$ edge lookup, is trivial to represent as a 2D array in C, and requires minimal memory footprint ($6 \times 6 = 36$ integers).
