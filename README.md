# JobTrack Web

The frontend for [JobTrack API](https://github.com/mahimrana219/jobtrack-api): track every job application on one pipeline, drag cards between stages as replies come in, and see who you still owe a follow-up.

Built with **Next.js (App Router), React, TypeScript and Tailwind CSS**.

**Live demo:** https://jobtrack-web-lyart.vercel.app. Open it and choose **Explore with sample data**: no account needed.

## Features

- **Pipeline ribbon**: the whole job hunt as one bar, each stage as wide as its share. Click a stage to filter everything below it.
- **Board view** with drag and drop between Wishlist, Applied, Interview, Offer and Rejected
- **List view** with search, sorting and pagination (server-side when connected to the API)
- **Add, edit and delete** applications in a side panel: stage, location, salary, applied and follow-up dates, job link, notes
- **Response rate and follow-ups due**, calculated from your applications
- **JWT sign in and sign up** against the JobTrack API
- **Demo mode**: runs fully in the browser (localStorage) when no API URL is set, so the deploy works on its own
- Responsive down to mobile, keyboard focus states, and reduced-motion support

## How it connects to the API

`lib/api.ts` talks to the same endpoints the API exposes:

| Action | Endpoint |
| --- | --- |
| Sign up / sign in / current user | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| List with filters | `GET /api/applications?status=&search=&sort=&page=&limit=` |
| Create / update / delete | `POST`, `PATCH`, `DELETE /api/applications/:id` |
| Pipeline stats | `GET /api/applications/stats` |

The JWT is stored in localStorage and sent as a `Bearer` token. Demo mode (`lib/demo.ts`) returns the same response shapes, so the UI code doesn't care which one is active.

## Run locally

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at a running jobtrack-api
npm run dev
```

Leave `NEXT_PUBLIC_API_URL` empty to use demo mode only.

## Project structure

```
app/
  page.tsx              Landing page with sign in, sign up and demo entry
  dashboard/page.tsx    Pipeline ribbon, board/list views, filters
components/
  PipelineRibbon.tsx    Stage ribbon (click to filter)
  Board.tsx             Drag-and-drop board
  ListView.tsx          Table with pagination
  ApplicationDrawer.tsx Add / edit / delete panel
lib/
  api.ts                API client and auth
  demo.ts               In-browser demo data source
  types.ts, format.ts
```

## Author

**Mahim Rana**, Full-Stack Developer (MERN · Next.js · Flutter) · [Portfolio](https://mahimrana-portfolio.vercel.app)

## License

MIT
