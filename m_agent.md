# 🚀 New Web Project Blueprint & Orchestration Guide

Welcome! This document serves as the step-by-step framework and instruction set for the agent to design, build, and deploy the new web project.

## 🎯 Project Goal & Vision

- **Project Name**: Tab-classifier
- **Description**: The website helps organize tabs using existing browser features.
- **Target Audience**: personal use 

## 📝 Phase 0: Project Brainstorming & Wireframing
Before starting UI design or database setup, we must align on the core requirements and page flow.

🚫 Rules for Phase 0:
- **Strictly NO Color Brainstorming**: Do not mention colors, hex codes, or themes. Focus only on content, structure, and features.
- **Core Project & Requirements Brainstorming**: Brainstorm what the project actually is, what features/functionalities the user is looking for, and what is needed. Do not include visual drawings or ASCII layouts here.
- **Page Flow Spec (Point-by-Point)**: List and explain the website pages and the flow between them, point-by-point. Focus purely on describing the project's pages, features, and how users navigate through them, without any visual/ASCII diagrams.
- **Open Clarification Questions**: At the end of this phase, the agent must ask targeted open questions about the layout, user interactions, or features to gather more detail.

## 🎨 Phase 1: User Interface (UI) Development
The UI phase is split into three strict steps:

### Step 1: Styling & Color Spec (Two Tracks)
- **Track A: Custom Theme (For Production/Serious Apps)**: The agent must define and explain the color scheme. Do not just list HEX codes. Explain them using visual blocks:
  - 🔴 Primary Color: [Color Box Widget / Hex] — Used for main buttons, branding, and headers.
  - 🔵 Secondary Color: [Color Box Widget / Hex] — Used for active states, secondary buttons.
  - ⚪ Background Color: [Color Box Widget / Hex] — Used for body backgrounds.
  Explain exactly where each color will feel active and present.
- **Track B: Library Default (For Quick/Personal Utility Apps)**: Skip custom color mapping. The agent will recommend and apply a standard, high-quality UI library design system (e.g., Tailwind CSS Slate/Dark theme, Shadcn/Radix defaults, or a clean modern minimal CSS template) that matches the category of the project.

### Step 2: UI Categorization & Alignment
1. The agent breaks down the UI into logical categories (e.g., Navigation, Landing, Dashboard, Settings, Forms).
2. The agent presents these categories to the user.
3. The user reviews, provides feedback, and satisfies the requirements.

### Step 3: Sub-agent Execution
Once aligned, the manager agent initiates the Sub-agent Orchestration Rule to build all UI categories concurrently.

## ⚙️ Phase 2 & 3: Logic & Database Integration
(Combined or Separated depending on Project Type)

- **For Production/Serious Apps**: Follow Phase 2 (Logic Brainstorming & Implementation) and Phase 3 (Database Schema Mapping & Migration) as separate phases to ensure strict design integrity.
- **For Quick/Personal Utility Apps (Combined Track)**:
  - **Combined Logic & DB Brainstorming**: The agent presents a single unified blueprint showing how backend logic links to database tables (e.g., "The API POST /tasks will insert a row in the tasks table with columns [id, title, user_id]). This prevents redundant brainstorming rounds.
  - **Unified Sub-agent Execution**: The manager spawns sub-agents to implement database schemas and backend code concurrently to accelerate setup.

## 🤖 Sub-agent Orchestration Rules (Manager Rule)
Whenever transitioning from the Brainstorming/Categorization step to the Execution step in any phase, the Manager Agent must follow these rules:

- **Parallel Execution**: The manager can run as many parallel sub-agents as necessary to build across all categorized areas at the same time.
- **Load Balancing (Heavy Categories)**: If a single category is heavy, complex, or requires massive changes, the Manager Agent can assign multiple sub-agents to that specific category to divide the load and accelerate development.
- **Quality Check**: Once sub-agents complete their tasks, the Manager Agent verifies integration and compiles the walkthrough.
