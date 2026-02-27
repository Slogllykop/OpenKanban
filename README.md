# OpenKanban

A modern, real-time Kanban board application built with Next.js, React, and Supabase. OpenKanban provides a seamless, collaborative experience for managing tasks and workflows with beautifully fluid animations and drag-and-drop capabilities.

## Features

* **Real-time Collaboration**: Experience instant updates across clients using Supabase Broadcast and Presence.
* **Fluid Drag and Drop**: Intuitively reorganize columns and tasks with `@hello-pangea/dnd` and Framer Motion.
* **Task Management**: Create, edit, and organize tasks with descriptions and priority levels (low, medium, high, urgent).
* **Column Controls**: Customize your board layout by collapsing columns to focus on what matters most.
* **Import and Export**: Easily migrate your board data in and out of the application.
* **Modern UI**: A responsive, accessible, and aesthetically pleasing interface powered by Tailwind CSS v4.

## Tech Stack

* **Framework**: Next.js 14+ (App Router)
* **Library**: React 19
* **Database and Real-time**: Supabase (PostgreSQL)
* **Styling**: Tailwind CSS v4
* **Animations**: motion (Framer Motion)
* **Drag and Drop**: `@hello-pangea/dnd`
* **Icons**: Tabler Icons
* **Linting and Formatting**: Biome
* **Language**: TypeScript

## Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
* Node.js (v20 or newer recommended)
* pnpm (preferred package manager)
* A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/openkanban.git
cd openkanban
```

2. Install dependencies:
```bash
pnpm install
```

### Supabase Setup

1. Create a new Supabase project.
2. Navigate to the SQL Editor in your Supabase dashboard.
3. Execute the migration scripts found in the `supabase/migrations` directory in sequential order:
   * `001_create_boards.sql`
   * `002_create_columns.sql`
   * `003_create_tasks.sql`
   * `004_add_is_collapsed_to_columns.sql`
4. Copy your Supabase URL and Anon Key.

### Environment Variables

Create a `.env.local` file in the root of your project and add your Supabase credentials:

```ini
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the Application

Start the development server:
```bash
pnpm dev
```
Open `http://localhost:3000` in your browser to view the application.

## Project Structure

* `/src/app`: Next.js App Router pages and layouts.
* `/src/components`: Reusable React components.
  * `/board`: Kanban board specific components (columns, tasks, modals).
  * `/landing`: Components for the marketing and landing pages.
  * `/ui`: Shared UI elements.
* `/src/hooks`: Custom React hooks, including real-time synchronization logic (`use-realtime.ts`, `use-board.ts`).
* `/src/lib`: Utility functions, database integrations, and TypeScript definitions.
* `/supabase`: Database migration scripts and configurations.

## Architecture Highlights

* **Optimistic UI Updates**: The board implements optimistic updates for drag-and-drop operations, ensuring immediate visual feedback before the server confirms the change.
* **Component Modularity**: Complex UI parts are broken down into manageable components such as `Board`, `Column`, `TaskCard`, and `ColumnHeader`.
* **Real-time Sync**: Changes are broadcasted across clients instantly, resolving conflicts seamlessly by preferring the latest server truth.

## Contributing

Contributions are welcome. Please ensure that you follow the existing code style. We use Biome for linting and formatting.

1. Fork the project.
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add some amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request.

Make sure to run the following commands before committing:
```bash
pnpm run format
pnpm run lint
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
