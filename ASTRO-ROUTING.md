# Routing en Astro

> Apuntes basados en la documentación oficial:
>
> - [Routing Reference](https://docs.astro.build/en/reference/routing-reference/)
> - [Routing Guide](https://docs.astro.build/en/guides/routing/)

## 1. Idea central: file-based routing

Astro **no tiene un archivo de configuración de rutas** (nada como `routes.js` o un `<Router>`). El sistema de routing es 100% posicional: la estructura de `src/pages/` **es** el mapa de rutas de tu sitio.

```
src/pages/index.astro        → miweb.com/
src/pages/about.astro        → miweb.com/about
src/pages/about/index.astro  → miweb.com/about
src/pages/about/me.astro     → miweb.com/about/me
src/pages/posts/1.md         → miweb.com/posts/1
```

**Regla de oro #1:** si el archivo vive dentro de `src/pages/` y es un tipo soportado (`.astro`, `.md`, `.mdx`, o un endpoint `.js/.ts`), automáticamente es una página. No hay que "registrarla" en ningún lado.

Para navegar entre páginas se usa un `<a>` normal de HTML. Astro no trae un componente `<Link>` propio (a diferencia de Next.js con `<Link>` o React Navigation en tu app de Expo).

```astro
<p>Lee más <a href="/about/">sobre</a> Astro!</p>
```

---

## 2. Rutas estáticas vs. rutas dinámicas

- **Ruta estática**: un archivo → una URL fija. Ej. `about.astro` → `/about`.
- **Ruta dinámica**: el nombre del archivo tiene un **parámetro** entre corchetes, y ese único archivo puede generar **muchas** páginas. Ej. `[author].astro` → `/authors/juan`, `/authors/maria`, etc.

Piensa en el parámetro dinámico como el equivalente a `:id` en Express (`/users/:id`) o a `[id].tsx` en Next.js — es la misma idea, cambia la sintaxis.

---

## 3. Rutas dinámicas: sintaxis

### 3.1 Parámetro simple `[param]`

```
src/pages/authors/[author].astro
```

Dentro del componente, el valor viene en `Astro.params`:

```astro
---
const { author } = Astro.params;
---
<h1>{author}</h1>
```

Puedes tener varios parámetros en el mismo nombre de archivo o repartidos en distintos segmentos de la ruta:

```
src/pages/[lang]-[version]/info.astro   → /en-v1/info, /fr-v2/info
src/pages/[lang]/[version]/info.astro   → /en/v1/info, /fr/v2/info
```

### 3.2 Rest parameters `[...path]`

Cuando necesitas capturar **rutas de profundidad variable** (número indeterminado de segmentos), usas el operador rest, igual que en JS/TS con `...args`:

```
src/pages/sequences/[...path].astro
```

Esto puede matchear `/sequences/uno/dos/tres`, `/sequences/cuatro`, e incluso `/sequences` (la ruta raíz, cuando `path` es `undefined`).

Se puede combinar un rest parameter con parámetros nombrados, por ejemplo para imitar el visor de archivos de GitHub:

```
/[org]/[repo]/tree/[branch]/[...file]
```

Una request a `/withastro/astro/tree/main/docs/public/favicon.svg` se descompone así:

```json
{
  "org": "withastro",
  "repo": "astro",
  "branch": "main",
  "file": "docs/public/favicon.svg"
}
```

> ⚠️ En modo **on-demand (SSR)**, solo se permite **un** rest parameter por nombre de archivo. `[locale]/[...slug].astro` es válido, `[...locale]/[...slug].astro` no.

---

## 4. Dos formas de resolver rutas dinámicas

Aquí está la bifurcación más importante del tema, y depende del modo de renderizado del proyecto (ver sección 7 sobre SSR/SSG):

```
                 ┌─────────────────────────────┐
                 │   Ruta dinámica [param]      │
                 └───────────────┬──────────────┘
                                 │
              ┌──────────────────┴───────────────────┐
              │                                       │
     Modo estático (SSG)                    Modo on-demand (SSR)
   "¿Qué páginas existen?"              "Genera lo que sea que pidan"
              │                                       │
   Necesita getStaticPaths()             NO se usa getStaticPaths()
   que devuelva TODAS las                Astro.params se lee directo,
   combinaciones posibles                la página se renderiza en
   de antemano (build time)              cada request (runtime)
```

### 4.1 Modo estático — `getStaticPaths()`

Como en build estático **todas las rutas deben conocerse en el momento del build**, un archivo con parámetro dinámico está obligado a exportar una función `getStaticPaths()` que devuelva un arreglo de objetos `{ params, props? }`.

```astro
---
// src/pages/dogs/[dog].astro
export function getStaticPaths() {
  return [
    { params: { dog: "clifford" } },
    { params: { dog: "rover" } },
    { params: { dog: "spot" } },
  ];
}

const { dog } = Astro.params;
---
<div>¡Buen perro, {dog}!</div>
```

Esto genera exactamente 3 páginas: `/dogs/clifford`, `/dogs/rover`, `/dogs/spot`. Si no está en el arreglo, la página **no existe** (404 en build).

**Analogía:** es como el `generateStaticParams()` de Next.js, o como precalcular manualmente todas las combinaciones para un `array.map()` que arma tus rutas antes de "compilar" el sitio.

#### `params`

- Las claves de `params` deben coincidir **exactamente** con los nombres definidos en el archivo.
- Los valores de `params` solo pueden ser `string` (se codifican en la URL).
- No vienen decodificados automáticamente — si necesitas decodificar, usa `decodeURI()` tú mismo.

#### `props` (pasar datos extra sin exponerlos en la URL)

A diferencia de `params`, los `props` **no** se codifican en la URL, así que pueden ser cualquier tipo de dato (objetos, arreglos, etc.). Es la forma correcta de pasarle datos ya resueltos (ej. de un fetch) a cada página generada, sin tener que volver a pedirlos dentro del componente:

```astro
---
// src/pages/posts/[id].astro
export async function getStaticPaths() {
  const response = await fetch("...");
  const data = await response.json();

  return data.map((post) => ({
    params: { id: post.id },
    props: { post },
  }));
}

const { id } = Astro.params;
const { post } = Astro.props;
---
<h1>{id}: {post.name}</h1>
```

> ⚠️ **Ojo con el scope:** `getStaticPaths()` corre **una sola vez**, en su propio scope aislado, **antes** de que cualquier página cargue. No puede leer variables del scope exterior del archivo (solo imports). El compilador te avisa si rompes esta regla.

#### `routePattern` (desde Astro 5.14.0)

Es un dato extra disponible como opción dentro de `getStaticPaths({ routePattern })`. A diferencia de `params` (que trae los valores concretos, ej. `fr`), `routePattern` te da el **patrón original** del archivo tal cual está escrito, ej. `/[...locale]/[files]/[slug]`. Sirve para lógica genérica de i18n u otras herramientas que necesitan saber "la forma" de la ruta, no solo sus valores.

### 4.2 Modo on-demand (SSR) — sin `getStaticPaths()`

Con un adapter configurado (`output: 'server'`, o `prerender = false` en una página puntual), la ruta dinámica **ya no necesita** `getStaticPaths()`. Astro simplemente ejecuta el componente para cualquier valor que llegue en la URL, en cada request:

```astro
---
// src/pages/resources/[resource]/[id].astro
export const prerender = false; // innecesario si el proyecto ya es 'server' por defecto

const { resource, id } = Astro.params;
---
<h1>{resource}: {id}</h1>
```

Esta página responde a `resources/users/1`, `resources/colors/blue`, literalmente cualquier combinación — sin tener que declararla antes. Como ya no hay `getStaticPaths()`, tampoco hay `props` desde ahí: si necesitas datos, los buscas dentro del propio componente (fetch, base de datos, etc.), muy similar a como resuelves un parámetro de ruta en un controlador de Express.

---

## 5. `prerender`: el interruptor por página

Es la exportación que decide si **esa página en particular** se genera en build time (estática) o en cada request (on-demand).

| Config global | Valor por defecto de `prerender` |
| --- | --- |
| `output: 'static'` (default) | `true` — todo se prerenderiza |
| `output: 'server'` | `false` — todo es on-demand |

Puedes hacer override por archivo en cualquiera de los dos modos:

```astro
---
// En un proyecto 100% estático, esta página se sirve on-demand:
export const prerender = false;
---
```

```astro
---
// En un proyecto 100% 'server', esta página se congela en build:
export const prerender = true;
---
```

Esto permite mezclar páginas estáticas y dinámicas **en el mismo proyecto** — algo muy útil, por ejemplo, para tener el blog prerenderizado pero el dashboard de usuario en modo on-demand.

---

## 6. Orden de prioridad entre rutas

Cuando varias rutas podrían generar la misma URL (ej. `create.astro`, `[page].astro` y `[...slug].astro` compitiendo por `/posts/create`), Astro decide con estas reglas, **en este orden**:

1. Rutas reservadas de Astro (`_astro/`, `_server_islands/`, `_actions/`).
2. Más segmentos de ruta le ganan a rutas menos específicas.
3. Rutas **estáticas** (sin parámetros) le ganan a rutas dinámicas.
4. Parámetros **nombrados** (`[page]`) le ganan a **rest params** (`[...slug]`).
5. Rutas dinámicas prerenderizadas le ganan a las dinámicas on-demand.
6. Endpoints le ganan a páginas.
7. Rutas basadas en archivos le ganan a redirects configurados.
8. Si sigue empatado, se ordena alfabéticamente.

**Regla de oro #2:** entre más "genérica" (más comodines) sea tu ruta, más abajo queda en la prioridad. Lo específico siempre gana.

---

## 7. Extras del sistema de routing

### Excluir páginas

Prefija el archivo o carpeta con `_` y el router lo ignora (no genera ruta, no va al build). Útil para tests, componentes o utilidades que quieres dejar junto a la página relacionada sin que se conviertan en rutas.

### Redirects configurados

En `astro.config.mjs`, con la opción `redirects`, defines mapeos permanentes (soporta rutas dinámicas si ambos lados comparten los mismos parámetros, y desde Astro 5.2 también URLs externas).

### Rewrites (`Astro.rewrite()`)

Sirve contenido de otra ruta **sin cambiar la URL que ve el usuario** (a diferencia de un redirect, que sí cambia la URL). Útil para servir el mismo contenido en variantes de idioma, o para "aparentar" un 404 sin redirigir.

### Paginación con `paginate()`

Función que puedes retornar desde `getStaticPaths()` para trocear una colección grande en varias páginas automáticamente (`/posts/[page].astro` → `/posts/1`, `/posts/2`...). Te da un objeto `page` con `data`, `currentPage`, `total`, `url.next`, `url.prev`, etc., listo para armar controles de "anterior/siguiente".

---

## 8. Extra: ¿qué son SSR y SSG?

Como cierre, porque todo lo anterior gira alrededor de esta distinción:

- **SSG (Static Site Generation):** Astro genera el HTML de **todas** las páginas una sola vez, en el momento del `build` (`astro build`). El resultado son archivos `.html` planos que se suben a cualquier hosting estático (Netlify, GitHub Pages, un bucket S3, etc.). Rápido de servir, barato de hospedar, pero el contenido queda "congelado" hasta el próximo build. Es el modo por defecto de Astro (`output: 'static'`).

- **SSR (Server-Side Rendering) / on-demand rendering:** el HTML se genera **en cada request**, en un servidor (necesitas un *adapter*: Node, Vercel, Netlify, Cloudflare, etc.). Permite mostrar contenido que depende del usuario o del momento — sesiones, datos en tiempo real, personalización — cosas que un build estático no puede resolver de antemano. El costo es que necesitas un runtime corriendo (no un simple hosting de archivos), y cada visita implica cómputo del lado del servidor.

Astro es particular porque **no obliga a elegir uno solo**: el default es estático, y con `prerender = false` en páginas puntuales (o `output: 'server'` de base y `prerender = true` en las que sí quieras congelar) puedes mezclar ambos enfoques en el mismo proyecto — algo que frameworks como Next.js resuelven con conceptos parecidos (`generateStaticParams` vs. `dynamic = 'force-dynamic'`), pero en Astro está más explícito a nivel de archivo.

**Regla de oro #3:** si la página es igual para todo mundo y no cambia a cada rato → SSG. Si depende de quién la pide o de datos que cambian en tiempo real → SSR / on-demand.
