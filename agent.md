# 🚀 Personal Web Project Blueprint & Orchestration Guide

Welcome! This document serves as the step-by-step framework and instruction set for the AI agent to design, build, and deploy any new personal web project.

---

## 🎯 Project Goal & Vision

- **Project Name**: [INSERT_PROJECT_NAME]
- **Target Audience**: Personal use
- **Core Concept**: [INSERT_CORE_CONCEPT_OR_DESCRIPTION]

---

## 📝 Phase 0: Project Brainstorming & Requirements
Before starting, the user and agent align on the core app functionality and layout flow.

🚫 Rules for Phase 0:
- **Strictly NO Color Brainstorming**: Focus only on features, layouts, and data. Do not discuss color themes.
- **Structural Layout Specification**: Outline where main elements go (e.g., "A header at the top, a sidebar for categories, and a main list in the center").
- **State & Data Plan**: Brainstorm what data needs to be stored (e.g., Task ID, Name, Attributes).

---

## 🎨 Phase 1: User Interface (UI) Development
Build the visual layout of the website.

- **Step 1: Theme Selection & Component Breakdown**: 
  - Choose a high-quality default UI template (e.g., Tailwind Slate/Dark, Shadcn, or minimal CSS templates).
  - Break down the layout into component categories (e.g., Header, Task cards, Sidebar).
- **Step 2: Sub-agent Execution**: Spawns sub-agents to code the UI layouts using mock data.
- **Step 3: Local Port Review**: **[Stop & Verify]** Run the UI on a local port. The user must review the look and feel before moving to Phase 2.

---

## 🔍 Phase 2: UI Brainstorming & Adjustments
Inspect the built UI and refine it before adding backend logic.

- **Step 1: Brainstorming & Evaluation**: Review the live UI on the port. Brainstorm what parts of the layout work well, what feels wrong, and identify any structural changes needed.
- **Step 2: UI Fixing & Polish**: Run sub-agents to fix layout issues, adjust UI components, and complete final adjustments.

---

## ⚙️ Phase 3: Local Functionality (Local-First Development)
Implement core application logic using local storage.

- **Step 1: Core Functional Logic**: Build core features and calculation algorithms directly on top of the UI, using browser memory or `localStorage` to save data instantly.
- **Step 2: Interactive Testing (Manual Validation)**: Run the website locally, click buttons, add/delete items, and manually test workflows to make sure all calculations and buttons work smoothly.
- **Step 3: Network States & UX**: Add visual states to the UI like loading spinners, skeleton loaders, and empty states.

---

## 🔌 Phase 4: Supabase Cloud Database Integration
Transition local data into a permanent cloud database.

- **Step 1: Supabase Setup**: Create a new project in Supabase named after the current project (`[INSERT_PROJECT_NAME]`) and create required database tables.
- **Step 2: RLS (Security Rules) Setup**: Immediately configure Row Level Security (RLS) policies on tables to protect data.
- **Step 3: The Cloud Bridge**: Connect local state logic to the Supabase API, syncing additions, updates, and deletions to the cloud database in the background.

---

## 🌐 Phase 5: Firebase Hosting & Live Launch
Deploy the finalized app directly from local files to the web.

- **Step 1: Configuration Setup**: 
  - Read or initialize Firebase configuration files (`.firebaserc` and `firebase.json`) in the current project root directory.
  - Set the hosting target to match the current project name (`[INSERT_PROJECT_NAME]`).
- **Step 2: Direct Local Deploy (No Git/GitHub)**:
  - Deploy the app directly from your local terminal. Do NOT set up any GitHub actions, configuration, or CI/CD pipelines.
- **Step 3: Project Safety & Target Isolation**:
  - Deploy strictly under the designated Firebase project (e.g., `personal-172f4`).
  - ⚠️ **CRITICAL SAFETY RULE 1:** There are already existing websites launched in the shared Firebase project. Do NOT touch, modify, delete, or overwrite any of those existing deployments. Only launch the new site target matching the current website name (`[INSERT_PROJECT_NAME]`).
  - ⚠️ **CRITICAL SAFETY RULE 2:** Do not touch, modify, or deploy to the `try notes` project under any circumstances.
- **Step 4: Production Build & Live Deploy**: Build the final production package, test it on a local server, and run the direct deploy command to publish the website live.
