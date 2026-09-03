# 🚀 Astro: El framework para la web moderna

## ¿Qué es Astro?

**Astro** es un framework de JavaScript para construir sitios web, pensado sobre todo para proyectos **orientados al contenido**: blogs, landing pages, sitios de e-commerce, documentación y aplicaciones web en general. Su gran diferenciador frente a frameworks como Next.js, Nuxt o SvelteKit es que fue diseñado desde cero pensando en el **rendimiento por defecto**, en lugar de tener que optimizarlo después.

## Ventajas principales

- **🖥️ Server-First (renderizado en servidor):** Astro renderiza los componentes en el servidor y envía HTML ligero al navegador, sin sobrecarga de JavaScript innecesaria.
- **📄 Orientado al contenido:** fue diseñado para trabajar con contenido sin importar de dónde venga: tu sistema de archivos, una API externa o tu CMS favorito.
- **🧩 Personalizable:** puedes extenderlo con tus herramientas favoritas, componentes de UI, librerías de CSS, temas e integraciones.
- **⚡ Cero JavaScript por defecto:** solo envía al navegador el JavaScript que realmente se necesita, eliminando el resto automáticamente. Esto se traduce en mejores Core Web Vitals que la mayoría de sus competidores.
- **🏝️ Astro Islands (arquitectura de islas):** permite que solo ciertos componentes se "hidraten" con JavaScript en el cliente, mientras el resto de la página permanece como HTML estático puro.
- **🔓 Cero lock-in (sin atadura a un framework de UI):** puedes usar React, Vue, Svelte, Preact, Solid o Angular dentro del mismo proyecto Astro, o simplemente no usar ninguno.
- **📁 Enrutamiento basado en archivos:** la estructura de carpetas dentro de `src/pages` define automáticamente las rutas del sitio.
- **🖼️ Imágenes optimizadas:** componentes integrados para servir imágenes en formatos modernos y evitar *layout shift*.

## Su filosofía

La filosofía de Astro se resume en la idea de **"menos JavaScript es más rendimiento"**. En lugar de enviar toda una aplicación de JavaScript al navegador (como hacen los frameworks SPA tradicionales), Astro parte de HTML estático y solo añade interactividad donde realmente se necesita, componente por componente. A esto se le llama **arquitectura de islas**. El resultado es que la mayoría del sitio se comporta como una página HTML ultrarrápida, y solo los "pedacitos" interactivos (un carrusel, un formulario, un botón de compra) cargan su propio JavaScript de forma aislada.

## ¿Para qué está hecho principalmente?

Astro brilla especialmente en:

- Sitios de marketing y landing pages
- Blogs y sitios de documentación (de hecho, el propio framework Starlight de documentación está construido con Astro)
- Portafolios
- Tiendas de e-commerce
- Cualquier sitio donde el contenido y la velocidad de carga sean la prioridad número uno

No es el framework más indicado para aplicaciones altamente interactivas tipo *dashboard* con muchísimo estado compartido en el cliente (ahí SPAs como los de React puro o Vue puro suelen encajar mejor), aunque también puede usarse para aplicaciones web completas gracias a su modo servidor (SSR), middleware y *Actions*.

---

# 📘 Repaso: Sección 2 — Fundamentos de Astro y primeros pasos con el proyecto

¡Felicidades por terminar la sección 2! Aquí tienes un repaso de cada tema con ejemplos de código para reforzar lo aprendido.

## 3. ¿Qué es Astro?

Ya lo vimos arriba: un framework web enfocado en contenido, rendimiento y renderizado en servidor con cero JavaScript por defecto.

## 4 y 5. Creando nuestro proyecto (Windows / Mac)

El proceso es idéntico en ambos sistemas operativos porque usamos Node.js y npm. Se crea un proyecto nuevo con el comando oficial:

```bash
npm create astro@latest
```

Esto lanza un asistente interactivo que te pregunta:

- Dónde crear el proyecto
- Si quieres una plantilla vacía o con ejemplos
- Si quieres instalar TypeScript (recomendado)
- Si quieres inicializar un repositorio git

Al terminar, entras a la carpeta y levantas el servidor de desarrollo:

```bash
cd mi-proyecto
npm install
npm run dev
```

## 6. El Frontmatter de Astro y pasar variables hacia el HTML

Todo archivo `.astro` tiene dos partes: el **frontmatter** (entre los `---`) donde escribes JavaScript/TypeScript, y el **template** en HTML donde puedes insertar esas variables usando `{}`.

```astro
---
// Esto es el "frontmatter": JavaScript que corre en el servidor
const nombre = "Astro";
const version = 5;
const listaDeFrameworks = ["React", "Vue", "Svelte"];
---

<h1>¡Hola desde {nombre}!</h1>
<p>Estás usando la versión {version}</p>

<ul>
  {listaDeFrameworks.map((fw) => <li>{fw}</li>)}
</ul>
```

## 7. Pages o páginas en Astro y routing

Astro usa **enrutamiento basado en archivos**: cada archivo `.astro` dentro de `src/pages/` se convierte automáticamente en una ruta.

```
src/pages/
├── index.astro        →  /
├── about.astro         →  /about
├── blog/
│   └── index.astro     →  /blog
└── blog/
    └── [slug].astro    →  /blog/cualquier-cosa (ruta dinámica)
```

```astro
---
// src/pages/about.astro
---
<h1>Página Acerca de</h1>
```

## 8. Añadiendo Tailwind al proyecto

Astro tiene integraciones oficiales que se instalan con un solo comando:

```bash
npx astro add tailwind
```

Esto instala la dependencia y configura automáticamente el `astro.config.mjs`. Después puedes usar clases de Tailwind directamente en tus componentes:

```astro
<h1 class="text-3xl font-bold text-purple-600">
  ¡Hola con Tailwind!
</h1>
```

## 9. Layouts en Astro

Un **Layout** es un componente `.astro` reutilizable (normalmente guardado en `src/layouts/`) que envuelve el contenido común de tus páginas, como el `<head>`, header y footer. Usa el elemento especial `<slot />` para indicar dónde se inserta el contenido de la página.

```astro
---
// src/layouts/BaseLayout.astro
---
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Mi sitio en Astro</title>
  </head>
  <body>
    <header>Mi Header</header>
    <main>
      <slot />
    </main>
    <footer>Mi Footer</footer>
  </body>
</html>
```

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout>
  <h1>Contenido de mi página de inicio</h1>
</BaseLayout>
```

## 10. Componentes en Astro

Los componentes son piezas reutilizables de UI. Se guardan normalmente en `src/components/` y se importan donde se necesiten.

```astro
---
// src/components/Boton.astro
---
<button class="px-4 py-2 bg-purple-600 text-white rounded">
  <slot />
</button>
```

```astro
---
// src/pages/index.astro
import Boton from '../components/Boton.astro';
---
<Boton>Haz clic aquí</Boton>
```

## 11. Props en componentes

Los **props** permiten enviar datos desde un componente padre hacia un componente hijo, de forma parecida a los atributos HTML. Se reciben con `Astro.props`.

```astro
---
// src/components/Saludo.astro
const { nombre } = Astro.props;
---
<p>¡Hola, {nombre}!</p>
```

```astro
---
import Saludo from '../components/Saludo.astro';
---
<Saludo nombre="Karen" />
<Saludo nombre="Luis" />
```

## 12. Añadiendo interfaces a Props para mejor DX

Con TypeScript podemos tipar los props usando una `interface Props`, lo que nos da autocompletado y detección de errores (mejor **DX** = *Developer Experience*).

```astro
---
interface Props {
  nombre: string;
  edad?: number; // el ? indica que es opcional
}

const { nombre, edad = 18 } = Astro.props;
---
<p>{nombre} tiene {edad} años</p>
```

## 13. Assets y Public: ¿dónde colocar las imágenes en Astro?

Astro tiene dos lugares para recursos, y elegir el correcto importa:

| Carpeta | Uso | Optimización |
| --- | --- | --- |
| `src/assets/` | Imágenes que se importan en componentes | ✅ Astro las optimiza automáticamente |
| `public/` | Archivos estáticos (favicons, robots.txt, PDFs) | ❌ Se sirven tal cual, sin procesar |

```astro
---
import miImagen from '../assets/foto.jpg'; // desde src/assets
---
<img src={miImagen.src} alt="Una foto" />

<!-- Un archivo en /public/logo.png se referencia directo -->
<img src="/logo.png" alt="Logo" />
```

## 14. El componente `Image` de Astro

El componente `<Image />` optimiza automáticamente tus imágenes (formatos modernos como WebP, tamaños, lazy loading).

```astro
---
import { Image } from 'astro:assets';
import miFoto from '../assets/foto.jpg';
---
<Image
  src={miFoto}
  alt="Descripción de la foto"
  width={600}
  height={400}
/>
```

## 15. El componente `Picture` de Astro

`<Picture />` es similar a `Image`, pero te permite servir **múltiples formatos** (avif, webp, jpg) para que el navegador elija el mejor que soporte.

```astro
---
import { Picture } from 'astro:assets';
import miFoto from '../assets/foto.jpg';
---
<Picture
  src={miFoto}
  formats={['avif', 'webp']}
  alt="Descripción de la foto"
  width={600}
  height={400}
/>
```

---

## 🧠 Resumen rápido de la sección

En esta sección aprendiste todo lo necesario para arrancar un proyecto de Astro desde cero: crear el proyecto, entender el frontmatter, el sistema de rutas basado en archivos, cómo añadir Tailwind, y cómo estructurar tu sitio con **layouts**, **componentes** y **props** (incluyendo tipado con TypeScript). Cerraste con el manejo correcto de assets e imágenes optimizadas mediante `Image` y `Picture`. ¡Con esto ya tienes las bases sólidas para empezar a construir páginas reales! 🎉
