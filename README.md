# Tharun | Full-Stack Development

A high-performance web application built with a modern tech stack, focusing on type safety, scalable styling, and robust database management.

## 🚀 Tech Stack

* **Frontend:** [Vite](https://vitejs.dev/) & [React](https://reactjs.org/) (Project is **97.2% TypeScript**)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) with PostCSS
* **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Tooling:** ESLint, TypeScript, and Bolt

## 🛠️ Key Features & Engineering

* **Type-Safe Architecture:** Leveraging TypeScript across the entire application to ensure code reliability and a seamless developer experience.
* **Database Management:** Includes custom PostgreSQL migration scripts located in the `supabase/migrations` directory, handling complex schema updates and indexing.
* **Performance Optimized:** Optimized database performance by resolving indexing issues (see: `20251107154246_fix_remaining_index_issues.sql`).
* **Modern Build Pipeline:** Utilizes Vite for instant Hot Module Replacement (HMR) and optimized production builds.

## 📂 Project Structure

```text
├── .bolt/                # Environment and tool configurations
├── src/                  # Core application logic and components
├── supabase/
│   └── migrations/       # SQL schema and performance fixes
├── tailwind.config.js    # Custom design system configuration
└── vite.config.ts        # Optimized build settings
