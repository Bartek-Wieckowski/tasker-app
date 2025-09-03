# 📝 Tasker - Advanced Todo Application

A modern task management application with advanced collaboration features, push notifications, and full PWA support.

## 🚀 Demo

🌐 **Live Demo**: [https://tasker.developedbybart.pl](https://tasker.developedbybart.pl)

### Test Account

For testing purposes, you can use these credentials:

- **Email**: `test@developedbybart.pl`
- **Password**: `testowehaslo`

## ✨ Key Features

### 📋 Task Management

- **Personal todos** - create, edit, delete, and mark as completed
- **Cyclic tasks** - automatically generate recurring tasks
- **Delegated tasks** - assign tasks to other users
- **Global tasks** - list of tasks for annual goals, for example
- **Cooperative tasks** - collaborative task lists with other users

### 🤝 Team Collaboration

- **Shared Todo Lists** - create and manage collaborative task lists
- **Invitations** - send collaboration invites via email
- **Real-time updates** - instant synchronization across devices
- **Role management** - owners and members with different permissions

### 🔔 Notification System

- **Push notifications** - daily reminders for incomplete tasks
- **Multi-language notifications** - support for Polish and English
- **Smart notifications** - only for users with active tasks

### 📱 Progressive Web App (PWA)

- **Device installation** - works like a native application
- **Offline support** - basic functionality available offline
- **Responsive design** - optimized for all devices
- **Service Worker** - caching and background sync

### 🎨 Advanced UX/UI

- **Dark/Light mode** - automatic adaptation to system preferences
- **Drag & Drop** - intuitive task reordering
- **Animations** - smooth transitions with Framer Motion
- **UI Components** - professional components with Shadcn UI
- **Multi-language** - full support for Polish and English

### 📊 Additional Features

- **Image uploads** - attach photos to tasks
- **Global search** - search through all tasks
- **Statistics** - track progress and productivity
- **Filtering** - sort tasks by status and date
- **Calendar** - view tasks in time context

## 🛠 Technology Stack

### Frontend

- **React 18** - UI library with hooks and context API
- **TypeScript** - static typing for better code quality
- **Vite** - fast bundler and dev server
- **Tailwind CSS** - utility-first CSS framework
- **Shadcn UI** - high-quality UI components
- **React Router DOM** - client-side routing
- **Framer Motion** - animations and transitions

### Backend & Database

- **Supabase** - Backend-as-a-Service with PostgreSQL
- **PostgreSQL** - relational database
- **Row Level Security (RLS)** - row-level security
- **Real-time subscriptions** - real-time synchronization
- **Edge Functions** - serverless functions in Deno

### State Management & Data Fetching

- **TanStack Query v5** - server state management and caching
- **React Context** - global application state
- **React Hook Form** - form management
- **Zod** - schema validation

### Development & Testing

- **Vitest** - unit testing framework
- **React Testing Library** - React component testing
- **Cypress** - end-to-end testing
- **ESLint** - TypeScript/React code linting

### DevOps & Deployment

- **GitHub Actions** - CI/CD pipeline
- **Supabase CLI** - database and migration management

## 🏗 Architecture

```
src/
├── api/                    # API calls and TanStack Query
│   ├── mutations/         # Mutations (POST, PUT, DELETE)
│   ├── queries/           # Queries (GET)
│   └── constants.ts       # API constants
├── components/
│   ├── shared/           # Shared components
│   └── ui/               # UI components (Shadcn)
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and helpers
├── locales/              # Translation files (i18n)
├── pages/                # Page components
├── types/                # TypeScript type definitions
└── validators/           # Zod validation schemas
```

## 🚀 Installation and Setup

### Requirements

- **Node.js** 18+
- **npm** or **yarn**
- **Supabase CLI** (optional, for database work)

### 1. Clone the repository

```bash
git clone <repository-url>
cd tasker-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Push Notifications (VAPID Keys)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:your_email@example.com
```

### 4. Run in development mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for production

```bash
npm run build
```

### 6. Preview production build

```bash
npm run preview
```

## 🧪 Testing

### Unit tests

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch
```

### E2E tests (Cypress)

```bash
# Run E2E tests
npm run test:e2e

# Open Cypress interface
npm run test:e2e:open
```

### All tests (CI)

```bash
npm run test:ci
```

## 📊 Database

The application uses PostgreSQL through Supabase with the following main tables:

- `db_users` - application users
- `todos` - personal user tasks
- `delegated_todos` - delegated tasks
- `global_todos` - global tasks
- `cyclic_todos` - recurring tasks
- `coop_todos_shared` - shared task lists
- `coop_todos` - tasks in shared lists
- `coop_invitations` - collaboration invitations
- `push_subscriptions` - push notification subscriptions
- `notification_logs` - sent notification logs

## 🔧 Supabase Configuration

### Local Supabase Environment

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize local project
supabase init

# Start local instance
supabase start

# Apply migrations
supabase db push
```

### Edge Functions (Deno)

The application contains serverless functions in the `supabase/functions/` directory:

- `send_daily_notifications` - sending daily notifications
- `delete_user` - user account deletion
- `sync_user` - user data synchronization

## 🌍 Internationalization

The application supports multi-language functionality using `react-i18next`:

- **Polish** - default language
- **English** - full translation

Translation files are located in `src/locales/`.

## 📱 PWA Features

- **Manifest** - PWA configuration in `public/manifest.json`
- **Service Worker** - custom SW in `public/sw-custom.js`
- **Offline support** - resource caching
- **Install prompt** - device installation capability
- **Push notifications** - background notifications

## 📄 License

This project is private and is not available under an open source license.

## 👨‍💻 Author

**theBart** - [developedbybart.pl](https://developedbybart.pl)

---

_Tasker - Your personal productivity assistant_ 🚀
