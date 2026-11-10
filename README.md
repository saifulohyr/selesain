# SELESAIN — Pabrik Kanban Harian

Aplikasi todo berbasis Kanban dua kolom (**DIKERJAKAN** & **SELESAI**) per tanggal (`scheduled_date`) dengan visual mesin pabrik 3D (Three.js), autentikasi Clerk, dan penyimpanan Neon PostgreSQL via Drizzle ORM.

## Stack
- Next.js 16 (App Router, Turbopack, Cache Components) & React 19
- Clerk (`@clerk/nextjs`) untuk autentikasi
- Drizzle ORM + `@neondatabase/serverless` (PostgreSQL)
- Three.js untuk visualisasi 3D Kanban Factory

## Setup Lokal

1. Install dependensi:
```bash
npm install
```

2. Salin `.env.example` ke `.env.local` dan isi variabel berikut:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL` (pooled Neon URL untuk runtime app)
- `DATABASE_URL_UNPOOLED` (direct Neon URL untuk `drizzle-kit migrate`)

3. Jalankan migrasi database & verifikasi koneksi:
```bash
npm run db:migrate
npm run db:verify
```

4. Jalankan server dev:
```bash
npm run dev
```

## Scripts
- `npm run dev` — server development
- `npm run lint` — cek ESLint
- `npm run build` — build production
- `npm run db:generate` — generate migrasi Drizzle
- `npm run db:migrate` — terapkan migrasi ke Neon
- `npm run db:verify` — smoke test CRUD bertanggal di Neon
