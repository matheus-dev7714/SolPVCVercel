# SOLPVE - Lovable Version

This is the Lovable-compatible version of SOLPVE, migrated from Next.js to Vite + React Router + Supabase.

## 🚀 Quick Start for Lovable

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase and Solana credentials.

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 📦 What Changed?

This codebase has been migrated to work with Lovable. Key changes:

### ✅ Completed Migrations
- **Vite Build System** - Replaced Next.js with Vite for faster builds
- **React Router** - Client-side routing instead of file-based routing
- **Component Structure** - All components moved to `src/components/`
- **HSL Color System** - Updated to use Lovable's required HSL format
- **TypeScript Config** - Updated for Vite compatibility
- **Remove Next.js Dependencies** - Removed all Next.js specific code

### 🔄 Requires Your Action

1. **Database Migration** - Convert Prisma database to Supabase
   - See `LOVABLE_MIGRATION_GUIDE.md` for SQL schema
   - Import existing data if any

2. **Edge Functions** - Deploy Supabase Edge Functions
   - Located in `supabase/functions/`
   - Deploy using Supabase CLI or Lovable interface

3. **Environment Variables** - Set up in Lovable project settings
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SOLANA_RPC_URL`
   - `VITE_ANCHOR_PROGRAM_ID`

## 📁 New Project Structure

```
SOLPVE/
├── src/                        # All source code
│   ├── components/            # React components
│   ├── pages/                 # Route components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and services
│   ├── types/                 # TypeScript types
│   ├── App.tsx                # Root component with routing
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles (HSL colors)
├── supabase/                   # Supabase configuration
│   ├── functions/             # Edge Functions
│   └── config.toml            # Supabase config
├── public/                     # Static assets
├── index.html                  # HTML entry point
├── vite.config.ts             # Vite configuration
├── tailwind.config.ts         # Tailwind configuration
└── package.json               # Dependencies & scripts
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 8080) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client (legacy) |
| `npm run db:migrate` | Run Prisma migrations (legacy) |

## 🔗 Key Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `src/pages/Index.tsx` | Home page with pool listings |
| `/pool/:id` | `src/pages/Pool.tsx` | Pool detail page (deprecated) |
| `/vsai/pool/:id` | `src/pages/VsAIPool.tsx` | VS AI pool detail |
| `/vsmarket/pool/:id` | `src/pages/VsMarketPool.tsx` | VS Market pool detail |

## 📚 Documentation

- **Full Migration Guide:** See `LOVABLE_MIGRATION_GUIDE.md`
- **Lovable Port Guide:** See `PortGuide.md`
- **Original README:** See `README.md`

## 🐛 Troubleshooting

### Build Errors
- Ensure you're using Node.js 18+
- Run `npm install` to install all dependencies
- Check that TypeScript has no errors: `npx tsc --noEmit`

### Environment Variables Not Working
- Variables must start with `VITE_` prefix
- Use `import.meta.env.VITE_VARIABLE_NAME` in code
- Restart dev server after changing `.env.local`

### API Calls Failing
- Check that Supabase Edge Functions are deployed
- Verify CORS headers in Edge Functions
- Check browser console for specific errors

## 🚢 Deploying to Lovable

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: Lovable-ready migration"
   git push
   ```

2. **Import to Lovable**
   - Go to [lovable.dev](https://lovable.dev)
   - Click "Import from GitHub"
   - Select this repository

3. **Configure**
   - Enable Lovable Cloud (auto-provisions Supabase)
   - Set environment variables in project settings
   - Deploy Edge Functions

4. **Go Live!**
   - Click "Publish" in Lovable
   - Your app will be live at `yourproject.lovable.app`

## 🤝 Contributing

If you're continuing development:
1. All code goes in `src/` directory
2. Use React Router for navigation
3. Use Supabase for backend
4. Follow HSL color system for styling
5. Test thoroughly before deploying

## 📞 Need Help?

- Check `LOVABLE_MIGRATION_GUIDE.md` for detailed migration steps
- See Lovable docs: https://docs.lovable.dev/
- See Supabase docs: https://supabase.com/docs

---

**Version:** Lovable Migration v1.0  
**Last Updated:** 2025-10-16  
**Status:** Ready for Lovable deployment (backend setup required)


