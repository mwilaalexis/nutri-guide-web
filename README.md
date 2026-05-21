# NutriGuide Web

Frontend application for the NutriGuide nutrition platform. Single-page app that talks to backend services through the API gateway.

## Responsibilities

- User authentication flows
- Profile and nutrition tracking views
- Meal plan and food catalog interactions
- Consumption of REST APIs exposed via [nutri-guide-gateway](https://github.com/mwilaalexis/nutri-guide-gateway)

## Tech stack

- React
- TypeScript
- Vite
- ESLint

## Project layout

```
src/          Application components and pages
public/       Static assets
docs/         Project documentation
scripts/      Helper scripts
```

## Configuration

Copy `.env.example` to `.env.development` and set the API base URL to your gateway (for example `http://localhost:5284`).

## Run locally

```bash
npm install
npm run dev
```

See `DEV.md` for additional development notes.

## Backend services

| Service | Repository |
|---------|------------|
| Gateway | [nutri-guide-gateway](https://github.com/mwilaalexis/nutri-guide-gateway) |
| User service | [nutri-guide-user-service](https://github.com/mwilaalexis/nutri-guide-user-service) |
| Food catalog | [nutri-guide-food-service](https://github.com/mwilaalexis/nutri-guide-food-service) |
| Meal plans | [nutri-guide-plan-service](https://github.com/mwilaalexis/nutri-guide-plan-service) |

## Author

[Alex Mwila](https://github.com/mwilaalexis)
