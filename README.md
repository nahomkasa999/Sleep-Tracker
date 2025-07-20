# Sleep Tracker

A modern web application for tracking your sleep and daily wellbeing.

---

## 🌟 What does this website do?

Sleep Tracker helps you:
- **Log your daily sleep**: Record bedtime, wake-up time, sleep quality, and notes.
- **Track your mood and day rating**: Log how you feel and rate your day alongside your sleep.
- **Visualize your data**: See charts for sleep duration, mood trends, and correlations between sleep and wellbeing.
- **Edit and manage entries**: Update or delete your past entries easily.
- **AI-powered insights**: (Optional) Get AI-generated insights and correlations about your sleep and wellbeing (using Google Gemini API).
- **Secure authentication**: Register, log in, and manage your account securely.
- **API access**: Explore and test all backend APIs via Swagger UI at `/api/sweggar`.

---

## 🚀 Local Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Sleep-Tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up your `.env` file
Create a `.env` file in the root directory with the following variables:

```
# PostgreSQL connection string
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>

# (Optional) For email features
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=yourpassword
EMAIL_FROM=your@email.com

# (Optional) For Google Gemini API
GOOGLE_API_KEY=your_google_gemini_api_key
```

> **Note:** You must provide a valid `DATABASE_URL` for the app to work. The other variables are needed for email and AI features.

### 4. Run database migrations
```bash
npx prisma migrate deploy
```

### 5. Start the development server
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000) (or another port if 3000 is in use).

---

## 🧪 API Documentation

You can view and interact with the backend API documentation at:

```
/api/sweggar
```

This uses Swagger UI for a full overview of all available endpoints.

---

## ▲ Deploying to Vercel

You can easily deploy this project to [Vercel](https://vercel.com/):

1. Push your code to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Set the required environment variables in the Vercel dashboard (see the `.env` section above).
4. For PostgreSQL, you can use [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or any managed Postgres provider.
5. Click **Deploy**!

> **Note:**
> - Make sure to run migrations on your production database. You can do this by enabling Vercel's "Post-Deployment Command" and running `npx prisma migrate deploy`.
> - For email and AI features, set the relevant environment variables in Vercel.

Your app will be live on your Vercel domain!

---

## 🛠️ Tools & Technologies Used

- **Next.js 15** (App Router, React 19)
- **React Hook Form** (forms & validation)
- **Prisma** (ORM for PostgreSQL)
- **PostgreSQL** (database)
- **Tailwind CSS** (styling)
- **shadcn/ui** (UI components)
- **Lucide Icons** (iconography)
- **TanStack React Query** (data fetching & caching)
- **Zod** (schema validation)
- **Hono** (API routing)
- **Swagger UI** (API docs)
- **Sonner** (toast notifications)
- **Google Gemini API** (optional, for AI insights)

---

## 📄 Project Structure

- `app/` — Main Next.js app (pages, API routes, logic)
- `components/` — Reusable UI components
- `context/` — React context providers
- `lib/` — Utility libraries, Prisma client
- `prisma/` — Prisma schema and migrations
- `public/` — Static assets

---

## 🙋‍♂️ Need Help?
If you have any issues, please open an issue or discussion in the repository.
