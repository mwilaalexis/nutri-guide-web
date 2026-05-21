# Gateway ↔ Frontend (dev)

## Your gateway client

File: `reactproject1/test/test.Server/Gateway.http`

```http
@gateway = http://127.0.0.1:5284
```

Use this for **REST Client / VS Code** smoke tests on the gateway (Ocelot).

## Frontend app (NutriGuide)

| Layer | URL |
|--------|-----|
| React (Vite) | http://localhost:5174 |
| API calls from browser | `http://localhost:5174/api/...` (relative) |
| Vite proxy target | `VITE_GATEWAY_URL` in `.env.development` |

Default: `https://localhost:7059` (HTTPS profile on `test.Server`).

Do **not** set `VITE_API_BASE_URL` in dev — the browser must talk to port **5174**, not directly to 7059/5284.

## Image URLs in the browser

| Type | Path on 5174 (proxied) | Gateway upstream (Ocelot) |
|------|------------------------|---------------------------|
| Food | `/foods/images/{file}` | `/foods/images/{file}` |
| Ingredient | `/foods/ingredients/{file}` | `/foods/ingredients/{file}` |
| Profile | `/profile-images/{file}` | `/profile-images/{file}` |
| Legacy food | `/images/foods/{file}` | rewritten to `/foods/images/{file}` |

Example in DevTools Network:

`http://localhost:5174/foods/images/abc.png`  
`http://localhost:5174/profile-images/abc.png`

## Start order

1. Microservices + **test.Server** (profile **https** → ports 7059 + 5284)
2. `npm run check:gateway` (probes `VITE_GATEWAY_URL`)
3. `npm run dev` → open http://localhost:5174

## HTTP vs HTTPS

- **Gateway.http** → `http://127.0.0.1:5284` is fine for the HTTP client.
- **Browser** should use the Vite proxy; prefer `VITE_GATEWAY_URL=https://localhost:7059`.
- Avoid calling `https://127.0.0.1:7059` in the browser (certificate hostname mismatch).

If you only run the gateway on HTTP, set in `.env.development`:

```env
VITE_GATEWAY_URL=http://127.0.0.1:5284
```
