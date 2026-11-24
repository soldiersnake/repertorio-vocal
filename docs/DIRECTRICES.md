# DIRECTRICES — contrato de calidad

Las escribe y mantiene el agente **Testing**; las cumple el agente **Develop**. Testing revisa cada entrega contra esta lista y la rechaza si incumple cualquier regla **[bloqueante]**. Cada fallo se reporta con su código `D-xx`.

## 1. Verificación automática

- **D-01 [bloqueante]** `npm run typecheck` sin errores (TypeScript `strict`).
- **D-02 [bloqueante]** `npm run lint` sin errores ni warnings.
- **D-03 [bloqueante]** `npm test` en verde. Toda función de `src/lib/` tiene test; todo componente con lógica (filtros, formularios) tiene al menos un test de render + interacción.
- **D-04 [bloqueante]** `npm run build` termina sin errores.
- **D-05 [bloqueante]** `npx impeccable detect src` no reporta antipatrones de severidad alta.

## 2. Seguridad y datos

- **D-10 [bloqueante]** Ninguna clave en el repositorio. Solo se leen `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` desde `process.env`. Prohibido usar `service_role` / `sb_secret`.
- **D-11 [bloqueante]** Toda tabla tiene RLS activado con políticas por `auth.uid()`. Cambios de esquema solo en migraciones nuevas.
- **D-12 [bloqueante]** Toda Server Action: (a) obtiene el usuario con `supabase.auth.getUser()` y corta si no hay sesión, (b) valida la entrada con el esquema zod de `src/lib/validation.ts`, (c) comprueba `error` de Supabase y devuelve un mensaje legible, nunca el error crudo. **Excepción a (a):** las acciones que *crean* la sesión (`signIn`, `signUp`) no exigen sesión previa; sí cumplen (b) y (c). Cualquier otra acción, incluida `signOut`, cumple (a).
- **D-13 [bloqueante]** Las rutas privadas (`/repertorio/**`) redirigen a `/login` sin sesión (middleware + comprobación en servidor).
- **D-14** No se usa `dangerouslySetInnerHTML`. Los textos del usuario se renderizan como texto.

## 3. Código

- **D-20 [bloqueante]** Sin `any`, `@ts-ignore`, `@ts-expect-error` ni `as unknown as`.
- **D-21** Lectura de datos en Server Components; `'use client'` solo donde haya estado o eventos.
- **D-22** Lógica de dominio (notas, tesitura, fechas) en `src/lib/` como funciones puras.
- **D-23** Sin `console.log` en código entregado.
- **D-24** Sin código muerto ni comentarios `TODO` sin tarea asociada.

## 4. Experiencia de usuario

- **D-30 [bloqueante]** Cada vista de datos tiene estado **vacío** (con la acción para salir de él), **error** y **carga** (`loading.tsx` o estado pendiente en el botón).
- **D-31 [bloqueante]** Formularios: cada campo con `<label>` asociado, errores bajo el campo con `aria-describedby`, botón de envío deshabilitado mientras se envía.
- **D-32** Acciones destructivas (borrar pieza) piden confirmación sin usar `window.confirm`.
- **D-33** Textos de interfaz en español, con el vocabulario del producto (pieza, tesitura, ensayo). Los botones nombran su acción ("Guardar pieza", no "Enviar").
- **D-34 [bloqueante]** Usable a 390 px de ancho: sin scroll horizontal, objetivos táctiles ≥ 44 px.

## 5. Diseño (según `DESIGN.md` y la skill Impeccable)

- **D-40 [bloqueante]** Colores, tipografías y radios solo desde los tokens de `globals.css`. Ningún hex/rgb suelto en componentes.
- **D-41 [bloqueante]** Contraste de texto ≥ 4.5:1 (≥ 3:1 en texto grande).
- **D-42** Foco de teclado visible y tematizado en todos los controles interactivos.
- **D-43 [bloqueante]** Prohibido: texto con degradado, emojis como iconos, eyebrow/kicker sobre los títulos, tarjetas anidadas, barra de color en un solo lateral de una caja, glassmorphism decorativo.
- **D-44** Iconos solo de `lucide-react`, mismo grosor de trazo.
- **D-45** Datos numéricos (notas, minutos, fechas) con cifras tabulares.
