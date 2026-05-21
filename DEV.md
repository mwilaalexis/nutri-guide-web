# Développement local — tout faire fonctionner ensemble

## Prérequis

1. **Gateway Ocelot** (test.Server) en HTTPS sur `https://localhost:7059`
2. **Frontend** via Vite sur `http://localhost:5174` (jamais ouvrir le gateway dans le navigateur pour l’app)

## Démarrage (ordre)

```bash
# 1. Démarrer le backend (Visual Studio / dotnet run sur test.Server)

# 2. Vérifier le gateway (optionnel, aussi fait par npm run dev)
npm run check:gateway

# 3. Frontend
npm run dev
```

Ouvrir **http://localhost:5174**, se connecter, puis utiliser Dashboard / Food / Gallery.

## Configuration (`.env.development`)

| Variable | Valeur recommandée |
|----------|-------------------|
| `VITE_GATEWAY_URL` | `https://localhost:7059` |
| `VITE_GATEWAY_ONLY` | `true` |
| `VITE_API_BASE_URL` | **non défini** en dev |

Ne pas utiliser `http://127.0.0.1:5284` : Kestrel redirige vers `https://127.0.0.1:7059` et le certificat dev échoue dans le navigateur.

## Comment ça s’assemble

```
Navigateur → http://localhost:5174/api/*
         → proxy Vite (secure: false)
         → https://localhost:7059/api/*
         → Ocelot → microservices
```

Images : `/profile-images/*` et `/foods/*` passent par le même proxy.

## Scripts

| Commande | Rôle |
|----------|------|
| `npm run check:gateway` | Teste que le gateway répond (401 = OK) |
| `npm run dev` | Vérifie le gateway puis lance Vite |
| `npm run dev:ui` | Vite seul (UI sans backend) |

## Dépannage

| Symptôme | Action |
|----------|--------|
| `ERR_CERT_*` / `127.0.0.1:7059` | Utiliser `https://localhost:7059` dans `.env.development`, `npm run dev` |
| `Cannot reach the API` | Démarrer test.Server, puis `npm run check:gateway` |
| Page Food vide | Se connecter (admin pour `/dashboard/food`) |
| Tailwind / Vite ne démarre pas | `npm install` (Windows : `@tailwindcss/oxide-win32-x64-msvc` est dans le projet) |
