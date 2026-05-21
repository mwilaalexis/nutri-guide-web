# NutriGuide UI

Frontend application for the NutriGuide nutrition platform. Single-page app that talks to backend services through the API gateway.

## Responsibilities

- User authentication flows
- Profile and nutrition tracking views
- Meal plan and food catalog interactions
- Consumption of REST APIs exposed via [NutriGuidGateway](https://github.com/mwilaalexis/NutriGuidGateway)

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
| Gateway | [NutriGuidGateway](https://github.com/mwilaalexis/NutriGuidGateway) |
| Auth and profiles | [AuthAndUserProfileService](https://github.com/mwilaalexis/AuthAndUserProfileService) |
| Food catalog | [Food-IngredientService](https://github.com/mwilaalexis/Food-IngredientService) |
| Meal plans | [FoodPlanService](https://github.com/mwilaalexis/FoodPlanService) |

## Author

[Alex Mwila](https://github.com/mwilaalexis)
