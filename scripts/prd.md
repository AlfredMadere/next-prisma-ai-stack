<context>
# Overview  
This project is a modern web application boilerplate built with Next.js, Prisma, and `task-manager-ai`, designed to serve as a fast-iteration playground for prototyping full-stack ideas. It provides a clean and extensible foundation to build MVPs quickly, test features, and experiment with user flows. A key early objective is implementing an intelligent database seeding system that leverages AI to create representative development datasets.

# Core Features  
- **Modern Stack Boilerplate**
  - What it does: Provides a minimal but complete starter with Next.js App Router, Prisma ORM, TailwindCSS, and optional OpenAI/Anthropic integrations.
  - Why it's important: Reduces boilerplate and setup time when starting a new idea.
  - How it works: Pre-configured folder structure and scripts for routing, styling, and DB integration.

- **AI-Assisted Task Planning**
  - What it does: Integrates `task-manager-ai` to plan and break down development tasks in a consistent format.
  - Why it's important: Streamlines scoping, helps with ideation, and reduces planning friction.
  - How it works: CLI or programmatic invocation of `task-manager-ai` using MCP-style prompts and `.tasks` directory structure.

- **Intelligent DB Seeding**
  - What it does: Creates development seed data based on natural-language prompts, inferred schema, or prior data patterns.
  - Why it's important: Enables frontend iteration with realistic data from day one.
  - How it works: Optional AI-powered CLI (`seed.ts`) or script in the repo that reads the Prisma schema and uses LLM prompts to populate the DB with synthetic but plausible content.

- **Incremental Prototyping Framework**
  - What it does: Encourages modular feature development through scoped UI components, server actions, and typed APIs.
  - Why it's important: Maintains velocity while avoiding long-lived branches or feature sprawl.
  - How it works: Convention-based development directories and clear feature boundaries in code organization.

# User Experience  
- **User Personas**
  - Developers iterating on new product ideas
  - Solo founders or hackers building MVPs
  - Designers who want to prototype end-to-end user flows

- **Key User Flows**
  - Clone → Configure `.env` and DB → Generate and explore seeded data → Start building UI → Add task specs → Iterate

- **UI/UX Considerations**
  - Focus on developer ergonomics: hot reload, console clarity, typed APIs
  - CLI feedback on seed generation and task planning
  - Easily replaceable UI with Tailwind/Component-first architecture
</context>

<PRD>
# Technical Architecture  
- **System Components**
  - Next.js frontend (App Router)
  - Prisma ORM + SQLite or Postgres
  - `task-manager-ai` CLI as planning and seed assistant
  - Optional LLM integration (Anthropic/OpenAI)
  
- **Data Models**
  - TBD based on specific app features; early version will support User, Task, and generic Content models
  - Prisma schemas stored in `/prisma/schema.prisma` and versioned

- **APIs and Integrations**
  - REST or RPC routes via `/app/api/*`
  - Server Actions in components or libraries
  - LLM provider integration (via env + SDK)

- **Infrastructure Requirements**
  - Local dev: Node.js 20+, pnpm, Docker (optional for DB)
  - Prod: Vercel/Render support with Prisma-managed migrations and optional PG vector support

# Development Roadmap  
## MVP Requirements
- Scaffolded Next.js app with working DB and seed logic
- AI-assisted seeding that generates data for known models (e.g., User, Task)
- Minimal UI to view/test seeded data
- Working integration with `task-manager-ai` to create tasks from CLI or file

## Future Enhancements
- Fully configurable seed profiles (e.g., via YAML or UI)
- UI-based prompt entry for seeding or task planning
- Feature generator (tasks → components → routes)
- Team collab tooling (e.g., seeded users with roles)

# Logical Dependency Chain  
1. **Core Setup**
   - Next.js, Prisma, Tailwind, task-manager-ai install
   - Schema scaffolding + working seed.ts script
2. **Database Foundation**
   - Seed command that reflects schema and uses OpenAI/Anthropic to generate dummy data
3. **Visible Feedback**
   - Dev-only pages to browse Users, Tasks, Content
4. **Planning Tools**
   - `task-manager-ai` CLI generates task files into `/tasks`
5. **Custom App Layer**
   - Begin extending features toward the actual prototype

# Risks and Mitigations  
- **Risk: LLM-based seeding is slow or unpredictable**
  - *Mitigation:* Cache seed data; offer fallback to static JSON
- **Risk: Planning becomes the bottleneck**
  - *Mitigation:* Use `task-manager-ai` to unblock decisions; timebox decisions
- **Risk: MVP scope creep**
  - *Mitigation:* Stay tightly scoped; validate early with working demo

# Appendix  
- **LLM Prompt for Seeding (Draft)**
  ```
  Based on the following Prisma schema, generate 10 realistic user records and 5 related task records per user. Each task should have a title, status, priority, and due date.
  ```

- **Useful Packages**
  - `@prisma/client`, `task-manager-ai`, `zod`, `react-query`, `tailwindcss`, `dotenv`

- **Seed Script Entry**
  ```
  pnpm seed  # Runs seed.ts that uses AI if enabled
  ```

</PRD>
