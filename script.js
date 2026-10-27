/**
 * ============================================================================
 *  SMART CAMPUS NAVIGATOR - CLIENT JAVASCRIPT
 *  Implementation of Dijkstra's Algorithm & Interactive SVG Graph Visualization
 *  Department of Information Technology - TCET
 * ============================================================================
 */

// Strict mode for cleaner code and error prevention
"use strict";

// Campus Locations Data
const LOCATIONS = [
  { id: 0, name: "Main Gate", short: "GATE", x: 110, y: 340, desc: "Primary campus entrance & visitor access" },
  { id: 1, name: "IT Department", short: "IT", x: 270, y: 140, desc: "Computer labs, smart classrooms & faculty wing" },
  { id: 2, name: "Library", short: "LIB", x: 280, y: 370, desc: "Central reference library & digital resource center" },
  { id: 3, name: "Canteen", short: "CAN", x: 530, y: 140, desc: "Cafeteria, student dining & recreation lounge" },
  { id: 4, name: "Auditorium", short: "AUD", x: 710, y: 340, desc: "Multipurpose seminar hall & convocation venue" },
  { id: 5, name: "Admin Office", short: "ADM", x: 520, y: 430, desc: "Registrar, finance & principal administration" }
];

// Exact Weighted Adjacency Matrix
// Graph is undirected and symmetric. 0 means no direct edge.
const GRAPH = [
  [0, 4, 2, 0, 0, 0],
  [4, 0, 1, 5, 0, 0],
  [2, 1, 0, 8, 10, 0],
  [0, 5, 8, 0, 2, 6],
  [0, 0, 10, 2, 0, 3],
  [0, 0, 0, 6, 3, 0]
];

// List of all 9 unique undirected edges in the campus graph
const EDGES = [
  { u: 0, v: 1, weight: 4 },
  { u: 0, v: 2, weight: 2 },
  { u: 1, v: 2, weight: 1 },
  { u: 1, v: 3, weight: 5 },
  { u: 2, v: 3, weight: 8 },
  { u: 2, v: 4, weight: 10 },
  { u: 3, v: 4, weight: 2 },
  { u: 3, v: 5, weight: 6 },
  { u: 4, v: 5, weight: 3 }
];

/**
 * Core Dijkstra Algorithm
 * Calculates shortest paths from `src` to all vertices and reconstructs the path to `dest`.
 * Also records a complete iteration trace for academic viva demonstration.
 *
 * @param {number} src - Starting vertex ID (0 to 5)
 * @param {number} dest - Destination vertex ID (0 to 5)
 * @returns {Object} Result containing dist, path, trace, and parent pointers
 */
function dijkstra(src, dest) {
  const V = GRAPH.length;
  const dist = new Array(V).fill(Infinity);
  const visited = new Array(V).fill(false);
  const parent = new Array(V).fill(-1);
  const trace = [];

  // Distance from source to itself is 0
  dist[src] = 0;

  // Process all vertices
  for (let step = 0; step < V; step++) {
    // Step 1: Select the unvisited vertex with the smallest tentative distance
    let minVal = Infinity;
    let u = -1;

    for (let v = 0; v < V; v++) {
      if (!visited[v] && dist[v] < minVal) {
        minVal = dist[v];
        u = v;
      }
    }

    // If no reachable vertex remains, stop
    if (u === -1 || minVal === Infinity) {
      break;
    }

    // Mark vertex u as visited (finalized shortest distance)
    visited[u] = true;

    const relaxations = [];

    // Step 2: Relax all adjacent edges of vertex u
    for (let v = 0; v < V; v++) {
      const weight = GRAPH[u][v];

      if (weight > 0 && !visited[v]) {
        const altDist = dist[u] + weight;
        const currentDist = dist[v];

        if (altDist < currentDist) {
          dist[v] = altDist;
          parent[v] = u;
          relaxations.push({
            neighbor: v,
            weight: weight,
            calculation: `${dist[u]} + ${weight} = ${altDist}`,
            improved: true,
            newDist: altDist
          });
        } else {
          relaxations.push({
            neighbor: v,
            weight: weight,
            calculation: `${dist[u]} + ${weight} = ${altDist} (>= ${currentDist})`,
            improved: false,
            newDist: currentDist
          });
        }
      }
    }

    // Record iteration snapshot for visual trace table
    trace.push({
      iteration: step + 1,
      selectedNode: u,
      selectedDist: dist[u],
      relaxations: relaxations,
      distSnapshot: [...dist],
      visitedSnapshot: [...visited]
    });
  }

  // Path Reconstruction from destination back to source
  const path = [];
  if (dist[dest] !== Infinity) {
    let curr = dest;
    while (curr !== -1) {
      path.push(curr);
      curr = parent[curr];
    }
    path.reverse();
  }

  return {
    src: src,
    dest: dest,
    distance: dist[dest],
    path: path,
    trace: trace,
    parent: parent
  };
}

/**
 * DOM Elements & State Management
 */
let currentResult = null;

// Initialize when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeDropdowns();
  renderCampusSvg();
  renderAdjacencyMatrix();
  bindEventListeners();

  // Run initial default calculation: Main Gate (0) to Auditorium (4)
  // This satisfies the mandatory academic reference test on first render!
  calculateRoute();
});

/**
 * Populate Location Dropdown Menus
 */
function initializeDropdowns() {
  const startSelect = document.getElementById("startSelect");
  const destSelect = document.getElementById("destSelect");

  if (!startSelect || !destSelect) return;

  startSelect.innerHTML = "";
  destSelect.innerHTML = "";

  LOCATIONS.forEach((loc) => {
    const optStart = document.createElement("option");
    optStart.value = loc.id;
    optStart.textContent = `[${loc.id}] ${loc.name}`;
    if (loc.id === 0) optStart.selected = true; // Default: Main Gate
    startSelect.appendChild(optStart);

    const optDest = document.createElement("option");
    optDest.value = loc.id;
    optDest.textContent = `[${loc.id}] ${loc.name}`;
    if (loc.id === 4) optDest.selected = true; // Default: Auditorium
    destSelect.appendChild(optDest);
  });
}

/**
 * Bind User Interaction Events
 */
function bindEventListeners() {
  const btnCalculate = document.getElementById("btnCalculate");
  const btnReset = document.getElementById("btnReset");
  const btnSwap = document.getElementById("btnSwap");

  if (btnCalculate) {
    btnCalculate.addEventListener("click", () => calculateRoute());
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => resetNavigator());
  }

  if (btnSwap) {
    btnSwap.addEventListener("click", () => swapLocations());
  }

  // Quick preset buttons
  const presetButtons = document.querySelectorAll(".btn-preset");
  presetButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const src = parseInt(btn.getAttribute("data-src"), 10);
      const dest = parseInt(btn.getAttribute("data-dest"), 10);
      document.getElementById("startSelect").value = src;
      document.getElementById("destSelect").value = dest;
      calculateRoute();
    });
  });

  // Re-calculate on dropdown change for smooth responsiveness
  document.getElementById("startSelect").addEventListener("change", () => calculateRoute());
  document.getElementById("destSelect").addEventListener("change", () => calculateRoute());
}

/**
 * Swap start and destination dropdown values
 */
function swapLocations() {
  const startSelect = document.getElementById("startSelect");
  const destSelect = document.getElementById("destSelect");
  const temp = startSelect.value;
  startSelect.value = destSelect.value;
  destSelect.value = temp;
  calculateRoute();
}

/**
 * Main function triggered to run Dijkstra and update the interface
 */
function calculateRoute() {
  const startSelect = document.getElementById("startSelect");
  const destSelect = document.getElementById("destSelect");

  const src = parseInt(startSelect.value, 10);
  const dest = parseInt(destSelect.value, 10);

  // Validation
  if (isNaN(src) || isNaN(dest) || src < 0 || src >= LOCATIONS.length || dest < 0 || dest >= LOCATIONS.length) {
    alert("Please select valid campus locations.");
    return;
  }

  // Execute Dijkstra's Algorithm
  const result = dijkstra(src, dest);
  currentResult = result;

  // Update UI Panels
  updateRouteSummary(result);
  updateStepDirections(result);
  updateSvgGraph(result);
  updateTraceTable(result);
  updateMatrixHighlight(result);
}

/**
 * Update the Top Route Summary Card
 */
function updateRouteSummary(result) {
  const totalDistanceEl = document.getElementById("totalDistance");
  const routePathChainEl = document.getElementById("routePathChain");
  const routeStatusBadgeEl = document.getElementById("routeStatusBadge");

  if (!totalDistanceEl || !routePathChainEl) return;

  if (result.distance === Infinity) {
    totalDistanceEl.textContent = "Unreachable";
    routeStatusBadgeEl.textContent = "No Path Available";
    routeStatusBadgeEl.style.backgroundColor = "#fee2e2";
    routeStatusBadgeEl.style.color = "#b91c1c";
    routePathChainEl.innerHTML = `<span style="color:#ef4444; font-weight:600;">No connecting route found between selected points.</span>`;
    return;
  }

  // Display Total Distance
  totalDistanceEl.textContent = `${result.distance} units`;

  if (result.src === result.dest) {
    routeStatusBadgeEl.textContent = "At Destination (0 units)";
    routeStatusBadgeEl.style.backgroundColor = "#e0f2fe";
    routeStatusBadgeEl.style.color = "#0369a1";
  } else {
    routeStatusBadgeEl.textContent = `Shortest Path Found (${result.path.length} stops)`;
    routeStatusBadgeEl.style.backgroundColor = "#dcfce7";
    routeStatusBadgeEl.style.color = "#15803d";
  }

  // Build Sequence Pills
  routePathChainEl.innerHTML = "";
  result.path.forEach((nodeId, idx) => {
    const loc = LOCATIONS[nodeId];
    const pill = document.createElement("span");
    pill.className = "path-node-pill";

    if (idx === 0) pill.classList.add("is-start");
    if (idx === result.path.length - 1 && result.path.length > 1) pill.classList.add("is-dest");

    pill.innerHTML = `<strong>${nodeId}</strong>: ${loc.name}`;
    routePathChainEl.appendChild(pill);

    if (idx < result.path.length - 1) {
      const sep = document.createElement("span");
      sep.className = "path-separator";
      sep.innerHTML = "&rarr;";
      routePathChainEl.appendChild(sep);
    }
  });
}

/**
 * Update Turn-by-Turn Directions List
 */
function updateStepDirections(result) {
  const stepListEl = document.getElementById("stepList");
  if (!stepListEl) return;

  stepListEl.innerHTML = "";

  if (result.src === result.dest) {
    const item = document.createElement("div");
    item.className = "step-item";
    item.innerHTML = `
      <div class="step-item-left">
        <span class="step-num" style="background:#dcfce7; color:#15803d;">&#10003;</span>
        <span class="step-desc">Starting point is the destination: <strong>${LOCATIONS[result.src].name}</strong>. No travel required.</span>
      </div>
      <span class="step-badge">0 units</span>
    `;
    stepListEl.appendChild(item);
    return;
  }

  let cumulative = 0;
  for (let i = 0; i < result.path.length - 1; i++) {
    const fromId = result.path[i];
    const toId = result.path[i + 1];
    const weight = GRAPH[fromId][toId];
    cumulative += weight;

    const item = document.createElement("div");
    item.className = "step-item";
    item.innerHTML = `
      <div class="step-item-left">
        <span class="step-num">${i + 1}</span>
        <span class="step-desc">
          Walk from <strong>${LOCATIONS[fromId].name}</strong> to <strong>${LOCATIONS[toId].name}</strong>
        </span>
      </div>
      <span class="step-badge">Leg: +${weight} | Total: ${cumulative} units</span>
    `;
    stepListEl.appendChild(item);
  }

  // Final destination reached notice
  const finalItem = document.createElement("div");
  finalItem.className = "step-item";
  finalItem.style.backgroundColor = "#f0fdf4";
  finalItem.style.borderColor = "#bbf7d0";
  finalItem.innerHTML = `
    <div class="step-item-left">
      <span class="step-num" style="background:#10b981; color:#ffffff;">&#10003;</span>
      <span class="step-desc">Arrive at destination: <strong>${LOCATIONS[result.dest].name}</strong> (${LOCATIONS[result.dest].desc})</span>
    </div>
    <span class="step-badge" style="background:#dcfce7; color:#15803d; font-weight:700;">Completed</span>
  `;
  stepListEl.appendChild(finalItem);
}

/**
 * Render Base Schematic Campus Graph in SVG
 */
function renderCampusSvg() {
  const svg = document.getElementById("campusGraph");
  if (!svg) return;

  svg.innerHTML = "";

  // 1. Defs: Markers and Gradients
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15" />
    </filter>
    <filter id="activePathGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#2563eb" flood-opacity="0.5" />
    </filter>
  `;
  svg.appendChild(defs);

  // Group for Edges (Walkways)
  const edgeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  edgeGroup.setAttribute("id", "svgEdgeGroup");
  svg.appendChild(edgeGroup);

  // Draw each edge and its distance weight badge
  EDGES.forEach((edge) => {
    const locU = LOCATIONS[edge.u];
    const locV = LOCATIONS[edge.v];

    const edgeId = getEdgeKey(edge.u, edge.v);

    // Line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", locU.x);
    line.setAttribute("y1", locU.y);
    line.setAttribute("x2", locV.x);
    line.setAttribute("y2", locV.y);
    line.setAttribute("class", "campus-edge");
    line.setAttribute("id", `edge-${edgeId}`);
    line.setAttribute("data-u", edge.u);
    line.setAttribute("data-v", edge.v);
    edgeGroup.appendChild(line);

    // Weight Badge group at midpoint
    const midX = (locU.x + locV.x) / 2;
    const midY = (locU.y + locV.y) / 2;

    const badgeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    badgeGroup.setAttribute("class", "weight-badge");
    badgeGroup.setAttribute("id", `badge-${edgeId}`);

    // Small offset perpendicular to the line for readability
    const dx = locV.x - locU.x;
    const dy = locV.y - locU.y;
    const len = Math.hypot(dx, dy);
    const offsetX = (-dy / len) * 12;
    const offsetY = (dx / len) * 12;

    const badgeX = midX + offsetX;
    const badgeY = midY + offsetY;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", badgeX - 16);
    rect.setAttribute("y", badgeY - 11);
    rect.setAttribute("width", 32);
    rect.setAttribute("height", 22);
    rect.setAttribute("rx", "6");

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", badgeX);
    text.setAttribute("y", badgeY);
    text.textContent = edge.weight;

    badgeGroup.appendChild(rect);
    badgeGroup.appendChild(text);
    edgeGroup.appendChild(badgeGroup);
  });

  // Group for Nodes (Campus Landmarks)
  const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  nodeGroup.setAttribute("id", "svgNodeGroup");
  svg.appendChild(nodeGroup);

  LOCATIONS.forEach((loc) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "campus-node");
    g.setAttribute("id", `node-${loc.id}`);
    g.setAttribute("data-id", loc.id);

    // Click handler on landmark node to set as start/destination
    g.addEventListener("click", () => handleNodeClick(loc.id));

    // Outer Halo
    const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    halo.setAttribute("cx", loc.x);
    halo.setAttribute("cy", loc.y);
    halo.setAttribute("r", 28);
    halo.setAttribute("class", "node-halo");

    // Main Circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", loc.x);
    circle.setAttribute("cy", loc.y);
    circle.setAttribute("r", 22);
    circle.setAttribute("class", "node-circle");
    circle.setAttribute("filter", "url(#nodeGlow)");

    // Text ID/Acronym inside circle
    const textId = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textId.setAttribute("x", loc.x);
    textId.setAttribute("y", loc.y);
    textId.setAttribute("class", "node-text-id");
    textId.textContent = loc.short;

    // Label below node
    const labelY = loc.y > 300 ? loc.y + 36 : loc.y - 32;

    const labelBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    const labelWidth = loc.name.length * 7.5 + 16;
    labelBg.setAttribute("x", loc.x - labelWidth / 2);
    labelBg.setAttribute("y", labelY - 10);
    labelBg.setAttribute("width", labelWidth);
    labelBg.setAttribute("height", 20);
    labelBg.setAttribute("class", "node-label-bg");

    const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    labelText.setAttribute("x", loc.x);
    labelText.setAttribute("y", labelY);
    labelText.setAttribute("class", "node-label-text");
    labelText.textContent = `[${loc.id}] ${loc.name}`;

    g.appendChild(halo);
    g.appendChild(circle);
    g.appendChild(textId);
    g.appendChild(labelBg);
    g.appendChild(labelText);
    nodeGroup.appendChild(g);
  });
}

/**
 * Handle direct node clicking on the campus SVG map
 */
function handleNodeClick(clickedId) {
  const startSelect = document.getElementById("startSelect");
  const destSelect = document.getElementById("destSelect");

  const currentStart = parseInt(startSelect.value, 10);

  if (currentStart === clickedId) {
    // Already start, set as destination
    destSelect.value = clickedId;
  } else {
    // Set clicked as destination if start already chosen, or swap
    destSelect.value = clickedId;
  }
  calculateRoute();
}

/**
 * Update SVG Graph Styling based on Computed Route
 */
function updateSvgGraph(result) {
  // Create set of edges in shortest path for O(1) lookup
  const pathEdgeSet = new Set();
  for (let i = 0; i < result.path.length - 1; i++) {
    pathEdgeSet.add(getEdgeKey(result.path[i], result.path[i + 1]));
  }

  const pathNodeSet = new Set(result.path);

  // Update Edges
  EDGES.forEach((edge) => {
    const key = getEdgeKey(edge.u, edge.v);
    const lineEl = document.getElementById(`edge-${key}`);
    const badgeEl = document.getElementById(`badge-${key}`);

    if (!lineEl || !badgeEl) return;

    // Reset classes
    lineEl.classList.remove("path-active", "path-dimmed");
    badgeEl.classList.remove("path-active", "path-dimmed");

    if (pathEdgeSet.has(key)) {
      lineEl.classList.add("path-active");
      badgeEl.classList.add("path-active");
    } else if (result.path.length > 1) {
      lineEl.classList.add("path-dimmed");
      badgeEl.classList.add("path-dimmed");
    }
  });

  // Update Nodes
  LOCATIONS.forEach((loc) => {
    const nodeEl = document.getElementById(`node-${loc.id}`);
    if (!nodeEl) return;

    nodeEl.classList.remove("is-start", "is-dest", "is-in-path", "is-dimmed");

    if (loc.id === result.src) {
      nodeEl.classList.add("is-start");
    } else if (loc.id === result.dest) {
      nodeEl.classList.add("is-dest");
    } else if (pathNodeSet.has(loc.id)) {
      nodeEl.classList.add("is-in-path");
    } else if (result.path.length > 0) {
      nodeEl.classList.add("is-dimmed");
    }
  });
}

/**
 * Render Dijkstra Algorithm Step-by-Step Execution Trace Table
 */
function updateTraceTable(result) {
  const tbody = document.getElementById("traceTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!result.trace || result.trace.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1rem;">No execution trace available.</td></tr>`;
    return;
  }

  result.trace.forEach((step) => {
    const row = document.createElement("tr");

    // Format relaxations
    let relaxationsText = "";
    if (step.relaxations.length === 0) {
      relaxationsText = "<span class='trace-badge nochange'>No unvisited neighbors</span>";
    } else {
      relaxationsText = step.relaxations
        .map((r) => {
          const locName = LOCATIONS[r.neighbor].short;
          if (r.improved) {
            return `<div><span class='trace-badge updated'>Updated ${locName}</span> ${r.calculation}</div>`;
          } else {
            return `<div><span class='trace-badge nochange'>Kept ${locName}</span> ${r.calculation}</div>`;
          }
        })
        .join("");
    }

    // Format distance array snapshot
    const distText = step.distSnapshot
      .map((d, idx) => `[${idx}]:${d === Infinity ? "&infin;" : d}`)
      .join(", ");

    row.innerHTML = `
      <td style="font-weight:700;">#${step.iteration}</td>
      <td>
        <span class="trace-badge selected">${LOCATIONS[step.selectedNode].name} [${step.selectedNode}]</span>
      </td>
      <td style="font-weight:700; color:#1e40af;">${step.selectedDist}</td>
      <td>${relaxationsText}</td>
      <td style="font-family:monospace; font-size:0.75rem; color:#475569;">${distText}</td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Render Campus Graph Adjacency Matrix View
 */
function renderAdjacencyMatrix() {
  const container = document.getElementById("matrixContainer");
  if (!container) return;

  let html = `<table class="matrix-table"><thead><tr><th>Node</th>`;

  LOCATIONS.forEach((loc) => {
    html += `<th title="${loc.name}">${loc.short}</th>`;
  });
  html += `</tr></thead><tbody>`;

  for (let i = 0; i < GRAPH.length; i++) {
    html += `<tr><th>${LOCATIONS[i].short}</th>`;
    for (let j = 0; j < GRAPH[i].length; j++) {
      const val = GRAPH[i][j];
      const cellId = `cell-${i}-${j}`;
      const isDiag = i === j;
      const cellClass = isDiag ? "matrix-diag" : val > 0 ? "matrix-edge" : "";
      html += `<td id="${cellId}" class="${cellClass}">${val}</td>`;
    }
    html += `</tr>`;
  }

  html += `</tbody></table>`;
  container.innerHTML = html;
}

/**
 * Highlight Active Path Edges in the Adjacency Matrix
 */
function updateMatrixHighlight(result) {
  // Clear existing highlights
  for (let i = 0; i < GRAPH.length; i++) {
    for (let j = 0; j < GRAPH.length; j++) {
      const cell = document.getElementById(`cell-${i}-${j}`);
      if (cell) cell.classList.remove("matrix-highlight");
    }
  }

  // Highlight cells used in the computed shortest path
  if (result.path && result.path.length > 1) {
    for (let i = 0; i < result.path.length - 1; i++) {
      const u = result.path[i];
      const v = result.path[i + 1];

      const cellForward = document.getElementById(`cell-${u}-${v}`);
      const cellReverse = document.getElementById(`cell-${v}-${u}`);

      if (cellForward) cellForward.classList.add("matrix-highlight");
      if (cellReverse) cellReverse.classList.add("matrix-highlight");
    }
  }
}

/**
 * Reset Navigator to clean state
 */
function resetNavigator() {
  document.getElementById("startSelect").value = 0; // Main Gate
  document.getElementById("destSelect").value = 4; // Auditorium
  calculateRoute();
}

/**
 * Helper to produce a canonical edge key for undirected edges
 */
function getEdgeKey(u, v) {
  return u < v ? `${u}-${v}` : `${v}-${u}`;
}
