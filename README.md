# Design Thinking Portal

A modern, interactive learning platform for design thinking education with AI-powered mentorship.

![React](https://img.shields.io/badge/React-19.x-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-purple)

## Features

- **5-Stage Design Thinking Course** - Empathise, Define, Ideate, Prototype, Test
- **Video-based Learning** - Progress tracking with 90% completion requirement
- **Project-based Learning** - 5 project templates with guided assignments
- **AI Mentor** - Context-aware chatbot that guides without solving
- **AI Evaluation** - Constructive feedback on assignment submissions
- **Instructor Portal** - Content management for educators

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google AI (Gemini) API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/design-thinking.git
cd design-thinking

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Fill in your environment variables in .env

# Start development server
npm start
```

### Environment Variables

Create a `.env` file with:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Create production build |
| `npm test` | Run unit tests (watch mode) |
| `npm run test:ci` | Run unit tests (CI mode) |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI dashboard |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Netlify

1. Push to GitHub
2. Import project in [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `build`
5. Add environment variables in Netlify dashboard

### Manual Deployment

```bash
# Build the app
npm run build

# The 'build' folder contains static files
# Upload to any static hosting service
```

## Database Setup

Run the SQL migrations in Supabase SQL Editor:

1. Core schema (users, stage_content, video_progress)
2. Project system (user_projects, project_deliverables)
3. RLS policies for security

See `/artifacts/supabase_schema.sql` for the complete schema.

## Architecture

```
src/
├── components/     # React components
├── context/        # React contexts (Auth, Project, CourseContent)
├── pages/          # Page components
├── services/       # AI service and prompts
├── lib/            # Supabase and Gemini clients
└── tools/          # Stage-specific AI tools
```

## Testing

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright

```bash
# Run all tests
npm run test:ci && npm run test:e2e
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request
