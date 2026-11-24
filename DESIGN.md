# DESIGN — "Sala de ensayo"

Sistema visual de Repertorio Vocal, definido con la skill **Impeccable** (`.claude/skills/impeccable`, modo *Operate*).

## Mundo
Una sala de ensayo de noche: madera oscura, el atril iluminado por una lámpara de latón, papel pautado. Oscuro **por la escena de uso** (luz baja, móvil en el atril), no por moda. El acento es el latón de la lámpara: cálido y escaso.

## Tokens (`src/app/globals.css`)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `oklch(0.17 0.012 60)` | fondo (madera casi negra, cálida) |
| `--surface` | `oklch(0.21 0.014 60)` | paneles, filas al pasar el ratón |
| `--surface-2` | `oklch(0.25 0.016 60)` | inputs, controles |
| `--line` | `oklch(0.32 0.014 60)` | bordes, pautas |
| `--fg` | `oklch(0.94 0.012 80)` | texto principal (papel) |
| `--fg-muted` | `oklch(0.74 0.02 70)` | texto secundario (tintado, no gris) |
| `--brass` | `oklch(0.80 0.12 78)` | acento: acción principal, foco, selección |
| `--brass-ink` | `oklch(0.22 0.03 70)` | texto sobre latón |
| `--st-aprender` | `oklch(0.72 0.05 240)` | estado: por aprender |
| `--st-estudio` | `oklch(0.80 0.12 78)` | estado: en estudio |
| `--st-listo` | `oklch(0.78 0.11 150)` | estado: listo |
| `--danger` | `oklch(0.70 0.16 25)` | borrar, errores |
| `--radius` | `6px` | radio único |

## Tipografía (autoalojada con @fontsource)
- **Fraunces Variable** (vertical, nunca cursiva): títulos de pieza y de página. Opsz alto, peso 500–600.
- **Instrument Sans Variable**: interfaz y texto.
- **IBM Plex Mono**: solo datos de medición (notas `D3–G4`, minutos, fechas). Cifras tabulares.
- Escala: 0.8125 / 0.9375 / 1.0625 / 1.375 / 2 / 2.75 rem.

## Estructura
- Listado de piezas como **filas** (no rejilla de tarjetas): título en Fraunces, compositor · obra debajo, a la derecha estado y tesitura.
- **Elemento propio: la regla de tesitura.** Cada pieza muestra su ámbito como un tramo de latón sobre una pauta de C2–C6 con marcas en cada Do. Es dato real, no adorno.
- Filtro de estado como control segmentado; búsqueda por título o compositor.
- Detalle de pieza: datos a la izquierda, registro de ensayos a la derecha (apilado en móvil).

## Movimiento
Un único momento: el tramo de tesitura crece desde su nota grave al cargar (ease-out exponencial, 400 ms). Respeta `prefers-reduced-motion`.

## Superficies del navegador
Selección de texto en latón translúcido, caret de latón, anillo de foco de 2 px en `--brass` con 2 px de separación, scrollbar tematizado.
