/*
 ============================================================================
  Project Name : Smart Campus Navigator
  Description  : Shortest Path Routing using Dijkstra's Algorithm in C
  Author       : TCET IT Engineering Student
  Subject      : Data Structures and Algorithms (DSA) Mini-Project
  Target       : Weighted Undirected Graph (6 Campus Locations)
 ============================================================================
*/

#include <stdio.h>
#include <limits.h>
#include <stdbool.h>
#include <stdlib.h>

#define NUM_LOCATIONS 6

// Array of campus landmark names corresponding to vertex IDs 0 to 5
const char *locationNames[NUM_LOCATIONS] = {
    "Main Gate",
    "IT Department",
    "Library",
    "Canteen",
    "Auditorium",
    "Admin Office"
};

// Exact weighted adjacency matrix representation of the campus graph
// 0 denotes no direct path between distinct vertices (or distance to self)
int graph[NUM_LOCATIONS][NUM_LOCATIONS] = {
    {0, 4, 2, 0, 0, 0},
    {4, 0, 1, 5, 0, 0},
    {2, 1, 0, 8, 10, 0},
    {0, 5, 8, 0, 2, 6},
    {0, 0, 10, 2, 0, 3},
    {0, 0, 0, 6, 3, 0}
};

/**
 * Display all campus locations with their respective vertex IDs
 */
void showLocations(void) {
    printf("\n=======================================================\n");
    printf("   TCET SMART CAMPUS NAVIGATOR - CAMPUS LANDMARKS     \n");
    printf("=======================================================\n");
    printf("  ID  | Location Name\n");
    printf(" -----+------------------------------------------------\n");
    for (int i = 0; i < NUM_LOCATIONS; i++) {
        printf("  [%d] | %s\n", i, locationNames[i]);
    }
    printf("=======================================================\n");
}

/**
 * Find the unvisited vertex with the minimum tentative distance.
 * Implements linear search over V vertices (gives O(V^2) overall time complexity).
 */
int minDistance(const int dist[], const bool visited[]) {
    int min = INT_MAX;
    int min_index = -1;

    for (int v = 0; v < NUM_LOCATIONS; v++) {
        if (!visited[v] && dist[v] <= min) {
            min = dist[v];
            min_index = v;
        }
    }
    return min_index;
}

/**
 * Recursively reconstruct and print the shortest path from source to target
 * using the parent/predecessor array.
 */
void printPath(const int parent[], int j) {
    // Base case: If vertex j is the source (parent[j] == -1)
    if (parent[j] == -1) {
        printf("%s", locationNames[j]);
        return;
    }
    printPath(parent, parent[j]);
    printf(" -> %s", locationNames[j]);
}

/**
 * Execute Dijkstra's Algorithm to find the shortest path from src to dest.
 * Computes distances, maintains predecessor pointers, and prints step breakdown.
 */
void dijkstra(int src, int dest) {
    int dist[NUM_LOCATIONS];       // dist[i] holds shortest distance from src to i
    bool visited[NUM_LOCATIONS];    // visited[i] is true if vertex i is finalized
    int parent[NUM_LOCATIONS];     // parent[i] stores predecessor to reconstruct path

    // Step 1: Initialize all distances as INFINITE (INT_MAX), visited as false, parent as -1
    for (int i = 0; i < NUM_LOCATIONS; i++) {
        dist[i] = INT_MAX;
        visited[i] = false;
        parent[i] = -1;
    }

    // Step 2: Distance from source to itself is always 0
    dist[src] = 0;

    // Step 3: Loop NUM_LOCATIONS - 1 times to determine shortest path for all vertices
    for (int count = 0; count < NUM_LOCATIONS - 1; count++) {
        // Pick the minimum distance vertex from the set of unvisited vertices
        int u = minDistance(dist, visited);

        // If no reachable unvisited vertex exists, break early
        if (u == -1 || dist[u] == INT_MAX) {
            break;
        }

        // Mark the picked vertex as finalized/visited
        visited[u] = true;

        // Step 4: Relax adjacent vertices of vertex u
        for (int v = 0; v < NUM_LOCATIONS; v++) {
            // Relax edge (u, v) only if:
            // 1. Edge exists: graph[u][v] != 0
            // 2. Vertex v is not yet finalized: !visited[v]
            // 3. Distance to u is valid: dist[u] != INT_MAX
            // 4. Path through u is strictly shorter: dist[u] + graph[u][v] < dist[v]
            if (!visited[v] && graph[u][v] != 0 && dist[u] != INT_MAX
                && (dist[u] + graph[u][v] < dist[v])) {
                parent[v] = u;
                dist[v] = dist[u] + graph[u][v];
            }
        }
    }

    // Step 5: Display calculated results
    printf("\n=======================================================\n");
    printf("                  NAVIGATION RESULT                    \n");
    printf("=======================================================\n");
    printf("  Start Point       : %s (ID %d)\n", locationNames[src], src);
    printf("  Destination       : %s (ID %d)\n", locationNames[dest], dest);
    printf(" -------------------------------------------------------\n");

    // Case 1: Unreachable destination
    if (dist[dest] == INT_MAX) {
        printf("  Status            : NO ROUTE AVAILABLE\n");
        printf("  Reason            : No path exists between the chosen points.\n");
        printf("=======================================================\n\n");
        return;
    }

    // Case 2: Same source and destination
    if (src == dest) {
        printf("  Total Distance    : 0 units\n");
        printf("  Calculated Route  : %s\n", locationNames[src]);
        printf("  Note              : You are already at the destination!\n");
        printf("=======================================================\n\n");
        return;
    }

    // Case 3: Standard shortest route
    printf("  Total Distance    : %d units\n", dist[dest]);
    printf("  Calculated Route  : ");
    printPath(parent, dest);
    printf("\n");
    printf(" -------------------------------------------------------\n");
    printf("  Step-by-Step Navigation Directions:\n");

    // Reconstruct path into an array for sequential forward printing
    int path[NUM_LOCATIONS];
    int pathLength = 0;
    int curr = dest;
    while (curr != -1) {
        path[pathLength++] = curr;
        curr = parent[curr];
    }

    // Print path from source (path[pathLength - 1]) to destination (path[0])
    int cumulative = 0;
    for (int i = pathLength - 1; i > 0; i--) {
        int fromNode = path[i];
        int toNode = path[i - 1];
        int edgeWeight = graph[fromNode][toNode];
        cumulative += edgeWeight;
        printf("   Step %d: Walk from %-14s -> %-14s [Leg: %2d units | Total: %2d units]\n",
               pathLength - i,
               locationNames[fromNode],
               locationNames[toNode],
               edgeWeight,
               cumulative);
    }
    printf("=======================================================\n\n");
}

/**
 * Clear leftover input characters from stdin to prevent infinite loops
 */
void clearInputBuffer(void) {
    int c;
    while ((c = getchar()) != '\n' && c != EOF) {
        // discard characters
    }
}

/**
 * Safely read and validate an integer location ID from standard input
 */
int readLocationId(const char *prompt) {
    int id;
    while (1) {
        printf("%s", prompt);
        if (scanf("%d", &id) != 1) {
            printf("  [!] Error: Please enter a valid numerical ID (0 to 5).\n");
            clearInputBuffer();
            continue;
        }
        clearInputBuffer();

        if (id < 0 || id >= NUM_LOCATIONS) {
            printf("  [!] Error: Invalid ID '%d'. Must be between 0 and %d.\n", id, NUM_LOCATIONS - 1);
            continue;
        }

        return id;
    }
}

int main(void) {
    printf("*******************************************************\n");
    printf("*           TCET SMART CAMPUS NAVIGATOR               *\n");
    printf("*   Dijkstra's Algorithm - Graph Theory Demonstration *\n");
    printf("*******************************************************\n");

    showLocations();

    int choice = 1;
    while (choice != 3) {
        printf("\nSelect an option:\n");
        printf("  [1] Find Shortest Route Between Two Landmarks\n");
        printf("  [2] Run Mandatory Academic Reference Test (Main Gate -> Auditorium)\n");
        printf("  [3] Exit Navigator\n");
        printf("Enter your choice (1-3): ");

        if (scanf("%d", &choice) != 1) {
            printf("  [!] Invalid input. Please enter 1, 2, or 3.\n");
            clearInputBuffer();
            continue;
        }
        clearInputBuffer();

        if (choice == 1) {
            printf("\n--- Route Query ---\n");
            int src = readLocationId("Enter Starting Landmark ID (0-5): ");
            int dest = readLocationId("Enter Destination Landmark ID (0-5): ");
            dijkstra(src, dest);
        } else if (choice == 2) {
            printf("\n--- Running Mandatory Academic Benchmark Test ---\n");
            printf("Source     : Main Gate (ID: 0)\n");
            printf("Destination: Auditorium (ID: 4)\n");
            dijkstra(0, 4);
        } else if (choice == 3) {
            printf("\nThank you for using the TCET Smart Campus Navigator. Goodbye!\n");
        } else {
            printf("  [!] Invalid choice. Please select 1, 2, or 3.\n");
        }
    }

    return 0;
}
