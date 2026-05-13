# prototipo-botmaker

Prototipo de Home Botmaker — iteración para el lanzamiento del **Diseñador de Agentes de IA**.

## Rutas

| Path | Qué muestra |
|---|---|
| `/` | Página de opciones (A · B · C · D) para revisar con CEO/líderes |
| `/home-a` | Versión A — 4 hero CTAs equal-width (clean grid) |
| `/home-b` | Versión B — Grid 4 + 2 (Diseñar / Operar / Comunicar) |
| `/home-c` | **Versión C — Editorial hero + contenido clásico** (la elegida) |
| `/home-d` | Versión D — Banner azul promo + simple cards |
| `/dev` | Landing dev para comparar versiones del flow (legacy) |
| `/bienvenida` | First-time state de Agentes IA |
| `/agente`, `/agente-v2` | Detalle de agente (variantes A vs B) |
| `/proyecto` | Vista orquestador |
| `/metricas` | Métricas de lanzamiento |

## Dev

```bash
npm install
npm run dev
```

Abre http://localhost:5173 (o el puerto que indique Vite).

## Build

```bash
npm run build
```

Outputs a `dist/`. Cloudflare Pages está configurado para auto-deployar desde `main` con este comando.

## Stack

- Vite + React 18 + TypeScript
- Roboto / Inter (Google Fonts)
- Lucide icons
- Tailwind (v3) — opcional, la mayoría del estilo va inline o en `src/ds.ts`
- React Flow para el canvas del bot designer

## Design System

Tokens de Botmaker en `src/ds.ts` (colores, spacing, radius, text styles).
Library Figma: https://www.figma.com/design/nRJggyUjuCNff8SGSeybmO/Botmaker-System-Library

## Owner / Status

- **Owner**: Gonzalo Tarnofsky (UX Lead)
- **Status**: review — Opción C lista para los líderes
- **Live**: https://prototipo-botmaker.pages.dev (Cloudflare Pages)
- **Figma**: https://www.figma.com/design/LtACqye4xgYECNvBwrVQeL/Home

## SPA routing

Como es Vite SPA, todas las rutas necesitan que el server haga fallback a `index.html`. Cloudflare Pages lo maneja con el archivo `_redirects` en `public/`.
