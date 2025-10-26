# Lovable Port Guide

## Overview

This guide explains Lovable's default frameworks, build configuration, routing structure, and backend deployment setup. Use this to adapt existing codebases or understand how Lovable projects are architected.

## Tech Stack

### Frontend Framework
- **React 18.3+** - Component-based UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Customizable component library built on Radix UI

### State Management & Data Fetching
- **@tanstack/react-query** - Server state management and data fetching
- **React Router DOM v6** - Client-side routing

### Backend (Optional)
- **Lovable Cloud** - Integrated Supabase backend
  - PostgreSQL database
  - Authentication
  - File storage
  - Edge Functions (Deno runtime)

## Project Structure

```
project-root/
├── src/
│   ├── components/
│   │   └── ui/              # shadcn components
│   ├── pages/               # Route components
│   │   ├── Index.tsx        # Home page (/)
│   │   └── NotFound.tsx     # 404 page
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities
│   │   └── utils.ts         # cn() helper
│   ├── integrations/        # Backend integrations (when Cloud enabled)
│   │   └── supabase/
│   ├── App.tsx              # Root component with providers
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles & design tokens
├── supabase/                # Backend configuration (when Cloud enabled)
│   ├── functions/           # Edge Functions
│   └── config.toml          # Supabase configuration
├── public/                  # Static assets
├── index.html               # HTML entry point
├── tailwind.config.ts       # Tailwind configuration
└── vite.config.ts           # Vite build configuration
```

## Routing

### Client-Side Routing
Lovable uses **React Router DOM v6** for all routing. Routes are defined in `src/App.tsx`:

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/about" element={<About />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

**Key conventions:**
- All page components live in `src/pages/`
- Always add custom routes BEFORE the `*` catch-all route
- Use `react-router-dom` hooks: `useNavigate()`, `useParams()`, `useLocation()`
- No file-based routing - routes are explicitly defined

### Navigation
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/about'); // Programmatic navigation

// Or use Link component
import { Link } from 'react-router-dom';
<Link to="/about">About</Link>
```

## Build System

### Development Server
```bash
npm run dev
# Runs on http://localhost:8080
# Configured in vite.config.ts
```

### Production Build
```bash
npm run build
# Outputs to dist/ directory
# Creates optimized, minified bundles
```

### Vite Configuration
Located at `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), componentTagger()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Key features:**
- `@/` alias maps to `src/` directory
- SWC for fast React compilation
- HMR (Hot Module Replacement) enabled
- Component tagger for Lovable's visual editing

## Design System

### Color System
All colors MUST use HSL format and be defined as CSS variables in `src/index.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more tokens */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode overrides */
}
```

### Tailwind Integration
Colors are mapped in `tailwind.config.ts`:

```typescript
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
}
```

**Critical rules:**
- NEVER use direct colors like `text-white`, `bg-black` in components
- ALWAYS use semantic tokens: `text-foreground`, `bg-background`
- Define custom colors in `index.css` first, then reference in Tailwind config

### Component Styling
Use `class-variance-authority` for component variants:

```tsx
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
      }
    }
  }
)
```

## Backend Integration (Lovable Cloud)

### Enabling Lovable Cloud
Lovable Cloud provides a complete Supabase backend. When enabled:

1. `src/integrations/supabase/` is generated with:
   - Client configuration
   - Type definitions
   - React Query hooks

2. `supabase/config.toml` is created for Edge Functions

### Database Access
```tsx
import { supabase } from "@/integrations/supabase/client";

// Query data
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);

// Insert data
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'Hello', content: 'World' });
```

### Authentication
```tsx
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();
```

### Edge Functions
Located in `supabase/functions/[function-name]/index.ts`:

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Your logic here
  const { data, error } = await supabase.from('table').select();

  return new Response(
    JSON.stringify({ data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
```

**Edge Function rules:**
- Use Deno runtime (not Node.js)
- Always include CORS headers for browser access
- Use `supabase.functions.invoke()` to call from frontend
- Configure in `supabase/config.toml`
- Access secrets via `Deno.env.get()`

### Secrets Management
Secrets are stored encrypted and accessed via environment variables:
- Frontend: Not recommended (use Edge Functions instead)
- Edge Functions: `Deno.env.get('SECRET_NAME')`

## Deployment

### Lovable Platform
1. Click "Publish" button in Lovable editor
2. Automatic build and deployment
3. Available at `yourproject.lovable.app`
4. Custom domains available in Project Settings

### Self-Hosting
After connecting GitHub:

```bash
# Clone repository
git clone <your-repo-url>
cd <your-project>

# Install dependencies
npm install

# Build for production
npm run build

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Any static hosting service
```

**Environment variables for self-hosting:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

## Key Dependencies

### Essential Packages
```json
{
  "@tanstack/react-query": "^5.83.0",
  "react": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "tailwindcss": "latest",
  "vite": "latest",
  "typescript": "latest"
}
```

### UI Components
- All shadcn components in `src/components/ui/`
- Radix UI primitives for accessibility
- Lucide React for icons

### Utilities
- `clsx` + `tailwind-merge` → `cn()` helper for conditional classes
- `class-variance-authority` → Component variant management
- `date-fns` → Date formatting
- `zod` → Schema validation
- `react-hook-form` → Form management

## Porting an Existing Project

### From Next.js
1. Convert file-based routes to React Router routes
2. Replace `next/image` with standard `<img>` or custom component
3. Move API routes to Edge Functions
4. Replace `getServerSideProps`/`getStaticProps` with React Query
5. Update imports from `next/*` to React equivalents

### From Vue/Angular
1. Rewrite components in React
2. Convert templates to JSX
3. Replace Vue Router/Angular Router with React Router
4. Migrate state management to React Query + hooks
5. Apply Tailwind classes to match your styles

### From Plain React
1. Add React Router if not present
2. Wrap app in required providers (QueryClient, TooltipProvider)
3. Install and configure Tailwind CSS
4. Import shadcn components as needed
5. Follow design system patterns (HSL colors, semantic tokens)

## Best Practices

### Component Organization
- Keep components small and focused
- Use composition over inheritance
- Co-locate related components
- Extract reusable logic to custom hooks

### Type Safety
- Define TypeScript interfaces for all data structures
- Use Zod for runtime validation
- Leverage Supabase generated types

### Performance
- Use React Query for automatic caching
- Implement proper loading states
- Use `React.memo()` for expensive components
- Lazy load routes with `React.lazy()`

### Styling
- Define all colors in design system
- Create component variants, not one-off styles
- Use semantic tokens consistently
- Leverage Tailwind's utility classes

## Troubleshooting

### Build Errors
- Check for TypeScript errors: `npm run type-check`
- Verify all imports use `@/` alias correctly
- Ensure all dependencies are installed

### Routing Issues
- Verify routes are defined before `*` catch-all
- Check BrowserRouter wraps all routes
- Use `basename` prop if hosting in subdirectory

### Supabase Connection
- Verify environment variables are set
- Check RLS policies on tables
- Confirm Edge Function CORS headers
- Review Supabase logs for errors

## Additional Resources

- [Lovable Documentation](https://docs.lovable.dev/)
- [React Router Docs](https://reactrouter.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Version:** 1.0  
**Last Updated:** 2025-10-16