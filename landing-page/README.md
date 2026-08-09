# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Waitlist setup

The `/waitlist` page submits to `POST /api/waitlist` and expects a Postgres database.

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. After setting `DATABASE_URL`, run migrations locally:

```bash
# install deps if needed
npm install

# apply the waitlist migration (reads DATABASE_URL from your environment)
npm run migrate
```

3. Start the app with `astro dev --background`.

4. For a production build, run `npm run build` and start the server with `npm run start`.

Supabase quick-start:

1. Create a free project at https://app.supabase.com
2. Open Project -> Settings -> Database -> Connection string and copy the full Postgres URL.
3. Paste that URL into your `.env` as `DATABASE_URL` and run `npm run migrate`.

You can also use Neon, Railway, or any other Postgres provider.

Supabase client keys and security

- If your frontend code uses Supabase, you'll also need `SUPABASE_URL` and `SUPABASE_KEY` (publishable/anon) in `.env`.
- Never store or expose the `service_role` key in client-side code. If a publishable key is leaked, rotate it in Project → Settings → API → "Regenerate".
- The `.env.example` file now contains placeholders for `SUPABASE_URL` and `SUPABASE_KEY`.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
