# Repertorio Vocal

App para cantantes líricos: repertorio de arias y canciones, estado de estudio, **tesitura** de cada pieza (regla visual C2–C6) y registro de ensayos.

Construida con un equipo de 3 agentes de Claude Code:

| Agente | Archivo | Rol |
|---|---|---|
| Orquestador | [`CLAUDE.md`](CLAUDE.md) | Divide el trabajo, asigna tareas y controla el bucle de revisión |
| Develop | [`.claude/agents/develop.md`](.claude/agents/develop.md) | Programa siguiendo su guía de código |
| Testing | [`.claude/agents/testing.md`](.claude/agents/testing.md) | Revisa contra [`docs/DIRECTRICES.md`](docs/DIRECTRICES.md) y devuelve los fallos hasta que todo pasa |

Historial de tareas y vueltas Develop↔Testing: [`docs/REGISTRO_AGENTES.md`](docs/REGISTRO_AGENTES.md).
Diseño: skill [Impeccable](https://impeccable.style) (`.claude/skills/impeccable`) + [`DESIGN.md`](DESIGN.md) y [`PRODUCT.md`](PRODUCT.md).

## Stack
Next.js 15 (App Router, Server Actions) · TypeScript estricto · Tailwind CSS v4 · Supabase (Postgres + Auth + RLS) · Vitest + Testing Library · Vercel.

## Puesta en marcha
```bash
cp .env.example .env.local   # rellena URL y publishable key de Supabase
npm install
npm run dev
npm run check                # typecheck + lint + tests + build
```
Esquema de base de datos: `supabase/migrations/`.
