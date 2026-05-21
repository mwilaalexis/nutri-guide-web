# NutriGuide - Web Frontend

React application for the NutriGuide nutrition platform.

## What this project does

This is the **user interface** of NutriGuide. It calls the API Gateway to log in, view foods, manage meal plans, and use profile features.

## Main features

- Login and registration screens
- Profile and nutrition-related views
- Integration with NutriGuide backend APIs
- Modern frontend tooling (Vite, TypeScript)

## Technologies

- React
- TypeScript
- Vite
- HTML / CSS

## Where this fits in NutriGuide

```
Web Frontend (this repo) -> API Gateway -> Backend services
```

Start the backend services and gateway before running the UI.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- NutriGuide backend running locally (gateway + services)

## Run locally

1. Clone the repository:
   ```bash
   git clone https://github.com/mwilaalexis/nutri-guide-web.git
   cd nutri-guide-web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment file:
   ```bash
   copy .env.example .env.development
   ```
4. Set the API URL to your gateway (example):
   ```
   VITE_API_URL=https://localhost:7059
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```
6. Open the URL shown in the terminal (usually `http://localhost:5173`).

See `DEV.md` for more developer notes.

## API usage (from the frontend)

The UI does not implement business rules. It sends HTTP requests such as:

| Area | Examples |
|------|----------|
| Auth | login, register |
| Profile | get/update profile, weight entries |
| Food | list foods and ingredients |
| Plans | list and manage meal plans |

All calls go through the gateway base URL configured in `.env.development`.

## Suggested folder structure

```
nutri-guide-web/
├── src/           # React components and pages
├── public/        # Static files
├── docs/          # Extra documentation
├── scripts/       # Helper scripts
├── package.json
└── README.md
```

## Skills demonstrated

- Frontend integration with REST APIs
- TypeScript and component-based UI
- Environment-based configuration
- Full-stack student project delivery

## Ideas to improve for recruiters

- [ ] Add 2-3 screenshots to README or `docs/`
- [ ] Document "full stack local setup" with links to backend repos
- [ ] Add a short demo video link
- [ ] Improve loading and error states on main pages

## Backend repositories

| Service | Repository |
|---------|------------|
| Gateway | [nutri-guide-gateway](https://github.com/mwilaalexis/nutri-guide-gateway) |
| User / Auth | [nutri-guide-user-service](https://github.com/mwilaalexis/nutri-guide-user-service) |
| Food | [nutri-guide-food-service](https://github.com/mwilaalexis/nutri-guide-food-service) |
| Plans | [nutri-guide-plan-service](https://github.com/mwilaalexis/nutri-guide-plan-service) |

## Author

**Alex Mwila** - [@mwilaalexis](https://github.com/mwilaalexis)
