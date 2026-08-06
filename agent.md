# 🚀 Personal Web Project Blueprint & Orchestration Guide

Welcome! This document serves as the step-by-step framework and instruction set for the agent to design, build, and deploy personal web projects.

---

## 🎯 Project Goal & Vision

- **Project Name**: Tab-classifier
- **Target Audience**: Personal use
- **Core Concept**: A clean, single-page browser tab classifier. Users organize browser tab groups into Projects. Inside each project, tabs stack vertically in a top-to-bottom list (`#1` ⬇️ `#2` ⬇️ `#3`). Each row features the auto-number (`#1`), a square favicon box with URL, a small connecting line, and the topic name. Clicking opens an edit pop-up. Includes a toggle to hide/show the `+` button.

---

## 📝 Phase 0: Project Brainstorming & Requirements [COMPLETED]
All requirements aligned:
- **Layout**: Single-page dashboard with vertical top-to-bottom lists inside Project containers.
- **Node Item Structure**: `[ Number (#1) ] ── [ Square Favicon Box ] ── [ Small Line ] ── [ Topic Name ]`
- **Interactions**: Clicking a row opens an Edit Pop-up for URL/Name modifications.
- **Dynamic Controls**: `+` button appends next numbered item; top global toggle hides/shows all `+` buttons.
- **Storage**: Local-first (`localStorage`) with background cloud sync (Supabase).

---

## 🎨 Phase 1: User Interface (UI) Development
Build the visual layout of the website.

- **Step 1: Theme Selection & Component Breakdown**: 
  - Choose a high-quality default UI template (e.g., Tailwind Slate/Dark, Shadcn, or minimal CSS templates).
  - Break down the layout into component categories (e.g., Header, Tab Cards, Category Sidebar, Action Controls).
- **Step 2: Sub-agent Execution**: Spawns sub-agents to code the UI layouts using mock data.
- **Step 3: Local Port Review**: **[Stop & Verify]** Run the UI on a local port. The user must review the look and feel before moving to Phase 2.

---

## 🔍 Phase 2: UI Brainstorming & Adjustments
Inspect the built UI and refine it before adding backend logic.

- **Step 1: Brainstorming & Evaluation**: Review the live UI on the port. Brainstorm what parts of the layout work well, what feels wrong, and identify any structural changes needed.
- **Step 2: UI Fixing & Polish**: Run sub-agents to fix the layout issues, adjust UI components, and complete the final adjustments identified in Step 1.

---

## ⚙️ Phase 3: Core Functionality & Local-First Development
Implement core active tab logic and browser local storage persistence.

- **Step 1: Core Functional Logic**: Activate the primary tab classification and grouping capabilities required by the UI (e.g., sorting tabs by domain/topic, filtering, and tab categorization logic).
- **Step 2: Local Storage Persistence**: Connect the core tab functionality to browser `localStorage` so that categorized tab lists, rules, and custom categories persist instantly across browser sessions.
- **Step 3: Interactive Testing & UX States**: Manually test clicking buttons, creating/deleting tab groups, and add visual UI states (loading spinners, empty state when 0 tabs are active).

---

## 🔌 Phase 4: Supabase Cloud Database Integration
Transition local state logic into a permanent cloud database.

- **Step 1: Supabase Setup**: Create a new project in Supabase named after the project and create the required database tables (`tabs`, `categories`).
- **Step 2: RLS (Security Rules) Setup**: Immediately configure Row Level Security (RLS) policies on the tables to protect your data.
- **Step 3: The Cloud Bridge**: Connect your local state logic to the Supabase API, syncing all additions, updates, and deletions to the cloud database in the background.

---

## 🌐 Phase 5: Firebase Hosting & Live Launch
Deploy the finalized app directly from local files to Firebase Hosting under the shared Firebase project.

### 📋 Prerequisites & Project Variables
Identify these 3 variables for the current project before proceeding:
- **Shared Firebase Project ID:** `personal-172f4` *(Shared account - DO NOT change)*
- **Local Target Name (`<TARGET_NAME>`):** Short nickname for this app (e.g., `classifier`)
- **Firebase Hosting Site ID (`<SITE_ID>`):** The target site on Firebase (e.g., `tab-classifier`)

---

### 🚀 Step 1: Local Firebase Configuration
Create `.firebaserc` and `firebase.json` in the current project root. Configure them specifically for this project's `<TARGET_NAME>` and `<SITE_ID>`.

1. **Create `.firebaserc`** in the project root:
   ```json
   {
     "projects": {
       "default": "personal-172f4"
     },
     "targets": {
       "personal-172f4": {
         "hosting": {
           "classifier": [
             "tab-classifier"
           ]
         }
       }
     }
   }
   ```

2. **Create `firebase.json`** in the project root:
   ```json
   {
     "hosting": {
       "target": "classifier",
       "public": "dist", 
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```
   *(Note: Set `"public": "dist"` for Vite/React apps, or `"public": "."` for plain HTML/JS apps).*

---

### 🛡️ Step 2: Target Isolation & Apply Alias
Run the target binding command in your local terminal to bind the local target alias to the specific hosting site:
```bash
firebase target:apply hosting classifier tab-classifier
```

⚠️ **CRITICAL SAFETY RULES FOR TARGET ISOLATION:**
- Always specify `--only hosting:classifier` during deployment.
- Never modify, overwrite, or deploy to existing live targets (e.g., `learnfaster`, `trynotes`).

---

### ⚡ Step 3: Production Build & Targeted Deploy
1. **Build the production package** (if using React/Vite):
   ```bash
   npm run build
   ```
2. **Deploy strictly to this app's isolated target:**
   ```bash
   firebase deploy --only hosting:classifier
   ```
