# AI Prompt: Interactive Arabic Letter Quiz App (Web-Only)

**Role:** Act as a senior full-stack developer with strong experience in **ASP.NET Core Web API (.NET 8)** and **React (Vite)**.

**Objective:** Build a real-time **Interactive Arabic Letter Quiz App** for live events. The app features a **hexagonal grid** of Arabic letters where two teams compete to form a connected path.

---

### **Project Concept & Rules**
1.  **Grid:** A configurable hexagonal grid (e.g., 5x5) of random Arabic letters.
2.  **Winning Condition:** 
    *   **Team 1:** Must connect a path from **Top to Bottom**.
    *   **Team 2:** Must connect a path from **Left to Right**.
3.  **Roles:**
    *   **Host (Web):** Creates sessions, configures grid size/team colors, selects letters, and manages buzzers.
    *   **Player (Web):** Joins via URL/Room ID and uses a simple "Buzzer" button.
    *   **TV Display (Web):** A real-time view showing the grid, active questions, and team assignments.
4.  **Real-time:** Use **SignalR** for buzzers, grid updates, and win announcements.
5.  **Automation:** The backend must **automatically detect** when a winning path is formed.

---

### **Tech Stack & Guidelines**
*   **Backend:** ASP.NET Core Web API (.NET 8)
*   **Database:** SQL Server with Entity Framework Core
*   **Frontend:** React (Vite) with Tailwind CSS
*   **Real-time:** SignalR
*   **State Management:** Simple (`useState` / `React Query`)
*   **Architecture:** Keep it simple and practical. No Clean Architecture, no CQRS, no MediatR. Use **Controllers + Services** pattern.
*   **Security:** Simple JWT Authentication for the Host.

---

### **Your Tasks**
1.  **Project Structure:** Suggest a clean, flat folder structure for both Backend and Frontend.
2.  **Database Schema:** Define the `GameSession`, `LetterCell`, and `Question` entities.
3.  **Winning Logic:** Implement the algorithm (e.g., BFS/DFS or Disjoint Set Union) to detect the connected path on a hexagonal grid.
4.  **SignalR Hub:** Create a hub to handle real-time buzzing and state synchronization.
5.  **Frontend Implementation:**
    *   Show the **Hexagonal Grid** component (CSS/SVG).
    *   Show the **Host Dashboard** for selecting letters and assigning teams.
    *   Show the **Player Buzzer** interface.
6.  **Authentication:** Implement a simple JWT setup for the Host role.

---

### **Requirements for the Code**
*   Use **async/await** properly.
*   Use **DTOs** for all requests and responses.
*   Implement basic validation and error handling.
*   Keep it **Simple, Practical, and Production-ready** for small apps.
*   Follow clean code principles (readable and maintainable).

**Please provide the end-to-end implementation for the core game loop (Session Creation -> Letter Selection -> Buzz -> Team Assignment -> Win Detection).**
