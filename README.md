# Poke Memory Game

Juego de memoria con cartas de Pokemon construido con **React + Vite + Tailwind CSS**.

> Este README es una guia paso a paso para aprender a crear la app desde cero.

## Demo

[Jugar online](https://rodielm.github.io/poke-memory-game/)

## Que vas a aprender

- Crear un proyecto con Vite + React
- Manejar estado con `useState`
- Ejecutar efectos con `useEffect`
- Renderizado condicional y listas con `.map()`
- Animaciones CSS 3D (efecto flip de cartas)
- Estilos con Tailwind CSS
- Deploy a GitHub Pages

## Requisitos previos

- Node.js (v18+) o Docker
- Conocimientos basicos de HTML, CSS y JavaScript

---

## Paso 1: Crear el proyecto

```bash
npm create vite@latest poke-memory-game -- --template react
cd poke-memory-game
npm install
```

Esto genera la estructura base:

```
poke-memory-game/
├── public/          # Archivos estaticos (favicon, imagenes)
├── src/
│   ├── App.jsx      # Componente principal
│   ├── main.jsx     # Punto de entrada (monta React en el DOM)
│   └── index.css    # Estilos globales
├── index.html       # HTML base (Vite inyecta los scripts aqui)
├── vite.config.js   # Configuracion de Vite
└── package.json     # Dependencias y scripts
```

## Paso 2: Instalar dependencias

```bash
npm install lucide-react
npm install -D tailwindcss @tailwindcss/vite
```

| Paquete | Para que sirve |
|---------|---------------|
| `lucide-react` | Iconos como el boton de reinicio |
| `tailwindcss` | Framework CSS basado en clases utilitarias |
| `@tailwindcss/vite` | Plugin para integrar Tailwind con Vite |

## Paso 3: Configurar Tailwind y Vite

**`vite.config.js`** - Agregar el plugin de Tailwind:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**`src/index.css`** - Importar Tailwind:

```css
@import "tailwindcss";
```

Con esto ya puedes usar clases como `bg-blue-500`, `p-4`, `flex`, etc.

## Paso 4: Definir los datos de los Pokemon

En `src/App.jsx`, definimos un array con los Pokemon que usara el juego:

```jsx
const POKEMON_DATA = [
  { id: 1, name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' },
  { id: 4, name: 'Charmander', image: '...' },
  // ... 8 Pokemon en total
];
```

Usamos sprites directos de GitHub (PokeAPI) en vez de una API para evitar latencia y limites de peticiones.

## Paso 5: Crear el estado del juego

React usa **hooks** para manejar datos que cambian. Cada `useState` crea una variable reactiva:

```jsx
const PokemonMemoryGame = () => {
  const [cards, setCards] = useState([]);       // Las 16 cartas en el tablero
  const [flipped, setFlipped] = useState([]);   // Cartas volteadas (max 2)
  const [matched, setMatched] = useState([]);   // Cartas ya emparejadas
  const [moves, setMoves] = useState(0);        // Contador de movimientos
  const [loading, setLoading] = useState(true); // Estado de carga
};
```

Cuando llamas a `setCards(nuevasCartas)`, React re-renderiza el componente con los nuevos datos.

## Paso 6: Inicializar el juego

```jsx
useEffect(() => {
  initGame();
}, []); // [] = ejecutar solo al montar el componente

const initGame = () => {
  // 1. Duplicar los pokemon para crear pares
  const gameCards = [...POKEMON_DATA, ...POKEMON_DATA].map((pokemon, index) => ({
    ...pokemon,
    uniqueId: index,    // ID unico por carta (0-15)
    pairId: pokemon.id  // ID para emparejar (ej: ambas Pikachu = 25)
  }));

  // 2. Mezclar y resetear estado
  setCards(shuffleArray(gameCards));
  setFlipped([]);
  setMatched([]);
  setMoves(0);
};
```

**Conceptos clave:**
- `useEffect` con `[]` se ejecuta una sola vez al cargar
- Spread operator `[...array]` crea una copia del array
- `.map()` transforma cada elemento del array

## Paso 7: Algoritmo de mezcla (Fisher-Yates)

```jsx
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
```

Es el algoritmo estandar para mezclar arrays. Recorre de atras hacia adelante e intercambia cada posicion con una aleatoria.

## Paso 8: Logica de click en cartas

Esta es la logica central del juego:

```jsx
const handleCardClick = (uniqueId) => {
  // Ignorar si: ya hay 2 volteadas, ya esta volteada, o ya fue emparejada
  if (flipped.length === 2 || flipped.includes(uniqueId) || matched.includes(uniqueId)) {
    return;
  }

  const newFlipped = [...flipped, uniqueId];
  setFlipped(newFlipped);

  if (newFlipped.length === 2) {
    setMoves(moves + 1);
    const firstCard = cards.find(c => c.uniqueId === newFlipped[0]);
    const secondCard = cards.find(c => c.uniqueId === newFlipped[1]);

    if (firstCard.pairId === secondCard.pairId) {
      // Son pareja: guardar en matched despues de 600ms
      setTimeout(() => {
        setMatched([...matched, newFlipped[0], newFlipped[1]]);
        setFlipped([]);
      }, 600);
    } else {
      // No son pareja: voltear de regreso despues de 1s
      setTimeout(() => setFlipped([]), 1000);
    }
  }
};
```

**Flujo:**
1. Click en carta 1 -> se voltea
2. Click en carta 2 -> se voltea + comparar
3. Si son iguales -> quedan volteadas (matched)
4. Si no -> se voltean de regreso despues de 1 segundo

## Paso 9: Animacion flip con CSS 3D

El efecto de voltear cartas usa transformaciones CSS 3D:

```jsx
{/* Contenedor con perspectiva (habilita el 3D) */}
<div style={{ perspective: '1000px' }}>

  {/* Carta que rota */}
  <div style={{
    transformStyle: 'preserve-3d',                              // Hijos con profundidad
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' // Girar o no
  }}>

    {/* Cara trasera (Pokeball) */}
    <div style={{ backfaceVisibility: 'hidden' }}>
      ...
    </div>

    {/* Cara frontal (Pokemon) - pre-rotada 180deg */}
    <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
      ...
    </div>
  </div>
</div>
```

**Como funciona:**
- Ambas caras se superponen con `position: absolute`
- `backfaceVisibility: hidden` oculta cada cara cuando esta de espaldas
- La cara frontal empieza rotada 180deg, asi cuando el contenedor rota 180deg, queda al frente

## Paso 10: Deploy a GitHub Pages

### 1. Configurar `base` en Vite

```js
// vite.config.js
export default defineConfig({
  base: '/poke-memory-game/',  // Nombre de tu repositorio
  plugins: [react(), tailwindcss()],
})
```

Esto es necesario porque GitHub Pages sirve desde `https://usuario.github.io/repo/`, no desde la raiz `/`.

### 2. Instalar gh-pages

```bash
npm install -D gh-pages
```

### 3. Agregar scripts en package.json

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### 4. Desplegar

```bash
npm run deploy
```

Esto hace build, crea la rama `gh-pages` y sube los archivos. Tu app estara en:
`https://tu-usuario.github.io/poke-memory-game/`

### 5. Configurar en GitHub

Ve a **Settings > Pages** del repositorio y selecciona:
- Source: **Deploy from a branch**
- Branch: **gh-pages** / **(root)**

---

## Ejecutar localmente

### Opcion 1: Node.js

```bash
npm install
npm run dev
```

### Opcion 2: Docker

```bash
docker compose up
```

La app estara en `http://localhost:5173` con hot-reload.

## Tecnologias

| Tecnologia | Version | Uso |
|-----------|---------|-----|
| React | 19 | UI con componentes |
| Vite | 7 | Bundler y dev server |
| Tailwind CSS | 4 | Estilos utilitarios |
| Lucide React | - | Iconos SVG |
| gh-pages | - | Deploy a GitHub Pages |

---

## Glosario: Conceptos clave

Referencia rapida de cada tecnologia y concepto utilizado en este proyecto.

### React

React es una **libreria de JavaScript para construir interfaces de usuario**. En vez de manipular el HTML directamente (como con `document.getElementById`), React te permite crear **componentes** — piezas reutilizables de UI que manejan su propio estado.

```jsx
// Sin React (vanilla JS)
document.getElementById('counter').innerText = count;

// Con React - declaras QUE quieres ver, React se encarga del COMO
const [count, setCount] = useState(0);
return <p>{count}</p>; // React actualiza el DOM automaticamente
```

**Conceptos de React usados en este proyecto:**

| Concepto | Que es | Donde se usa |
|----------|--------|-------------|
| **Componente** | Funcion que retorna JSX (HTML-like). Pieza reutilizable de UI | `PokemonMemoryGame` es el componente principal |
| **JSX** | Sintaxis que parece HTML pero es JavaScript. Se compila a `React.createElement()` | Todo lo que esta dentro de `return (...)` |
| **useState** | Hook que crea una variable reactiva. Cuando cambia, React re-renderiza | `cards`, `flipped`, `matched`, `moves`, `loading` |
| **useEffect** | Hook que ejecuta codigo cuando el componente se monta o cuando cambian sus dependencias | Inicializar el juego al cargar |
| **Props** | Datos que un componente padre pasa a un hijo | No se usan aqui (es un solo componente) |
| **Renderizado condicional** | Mostrar u ocultar JSX segun una condicion | `{isGameComplete && <div>...</div>}` |
| **Listas con .map()** | Renderizar multiples elementos a partir de un array | `{cards.map((card) => <div>...</div>)}` |
| **key** | Identificador unico en listas para que React sepa que elemento cambio | `key={card.uniqueId}` |

### Vite

Vite es un **bundler y servidor de desarrollo** para aplicaciones web modernas. Es el reemplazo moderno de herramientas como Webpack o Create React App.

**Que hace Vite:**
- **En desarrollo:** Levanta un servidor local con **Hot Module Replacement (HMR)** — cuando guardas un archivo, el cambio se refleja instantaneamente en el navegador sin recargar la pagina
- **En produccion (`npm run build`):** Empaqueta todo tu codigo en archivos optimizados (minificados, con hashes) listos para subir a un servidor

**Por que Vite y no Create React App:**
- Vite es mucho mas rapido (usa ESModules nativos del navegador)
- Create React App fue deprecado oficialmente
- Configuracion minima — un solo archivo `vite.config.js`

```
npm run dev     → Servidor local con HMR (desarrollo)
npm run build   → Genera carpeta dist/ con archivos optimizados (produccion)
npm run preview → Sirve la carpeta dist/ localmente para probar el build
```

### Tailwind CSS

Tailwind es un **framework CSS basado en clases utilitarias**. En vez de escribir CSS en archivos separados, aplicas estilos directamente en el HTML con clases predefinidas.

```jsx
// CSS tradicional:
// .boton { background: blue; padding: 12px 24px; border-radius: 9999px; }
// <button class="boton">Click</button>

// Tailwind - estilos directamente en la clase:
<button className="bg-blue-500 py-3 px-6 rounded-full">Click</button>
```

**Clases usadas en este proyecto:**

| Clase | CSS equivalente | Categoria |
|-------|----------------|-----------|
| `min-h-screen` | `min-height: 100vh` | Tamaño |
| `p-4` | `padding: 1rem` | Espaciado |
| `bg-blue-500` | `background-color: #3b82f6` | Color |
| `text-white` | `color: white` | Texto |
| `flex` | `display: flex` | Layout |
| `grid grid-cols-4` | `display: grid; grid-template-columns: repeat(4, 1fr)` | Grid |
| `rounded-xl` | `border-radius: 0.75rem` | Bordes |
| `shadow-lg` | `box-shadow: ...` | Sombras |
| `hover:scale-105` | `:hover { transform: scale(1.05) }` | Interactivo |
| `sm:p-8` | `@media (min-width: 640px) { padding: 2rem }` | Responsive |
| `animate-pulse` | Animacion de opacidad pulsante | Animacion |
| `transition-all` | `transition: all` | Transicion |
| `bg-white/90` | `background: rgba(255,255,255,0.9)` | Opacidad |
| `backdrop-blur-sm` | `backdrop-filter: blur(4px)` | Filtros |

**Ventajas:** No cambias entre archivos HTML y CSS, los estilos son predecibles, y el build final solo incluye las clases que usaste.

### npm (Node Package Manager)

npm es el **gestor de paquetes de Node.js**. Permite instalar y administrar librerias externas.

**Archivos clave:**

| Archivo | Que hace |
|---------|----------|
| `package.json` | Lista las dependencias y scripts del proyecto |
| `package-lock.json` | Fija las versiones exactas de cada dependencia (no editar manualmente) |
| `node_modules/` | Carpeta donde se instalan las dependencias (no se sube a git) |

**Comandos usados:**

```bash
npm install              # Instala todas las dependencias de package.json
npm install lucide-react # Agrega una dependencia de produccion
npm install -D gh-pages  # Agrega una dependencia de desarrollo (-D = devDependency)
npm run dev              # Ejecuta el script "dev" definido en package.json
npm run build            # Ejecuta el script "build"
npm run deploy           # Ejecuta "predeploy" automaticamente, luego "deploy"
```

**dependencies vs devDependencies:**
- `dependencies`: Se necesitan para que la app funcione (React, Lucide)
- `devDependencies`: Solo se necesitan durante el desarrollo (Vite, Tailwind, ESLint, gh-pages)

### Docker

Docker permite **empaquetar una aplicacion con todo lo que necesita** (sistema operativo, runtime, dependencias) en un **contenedor**. Esto garantiza que la app funcione igual en cualquier maquina.

**Analogia:** Un contenedor es como una caja que incluye la app + todas sus herramientas. No importa en que computadora la abras, siempre funciona igual.

**Dockerfile** — La "receta" para construir la imagen:

```dockerfile
FROM node:22-bookworm-slim          # 1. Partir de una imagen base con Node.js

RUN apt-get update && apt-get install -y \
    git curl \                       # 2. Instalar herramientas del sistema
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace                   # 3. Definir directorio de trabajo

COPY package.json package-lock.json ./ # 4. Copiar archivos de dependencias
RUN npm install                      # 5. Instalar dependencias (se cachea si no cambian)

COPY . .                             # 6. Copiar el resto del codigo

EXPOSE 5173                          # 7. Documentar que puerto usa la app

CMD ["npm", "run", "dev", "--", "--host"] # 8. Comando por defecto al iniciar
```

**Conceptos clave de Docker:**

| Concepto | Que es |
|----------|--------|
| **Imagen** | Plantilla de solo lectura con el SO + app + dependencias. Se crea con `docker build` |
| **Contenedor** | Instancia en ejecucion de una imagen. Se crea con `docker run` |
| **Dockerfile** | Archivo con instrucciones para construir una imagen |
| **WORKDIR** | Directorio de trabajo dentro del contenedor |
| **COPY** | Copia archivos del host al contenedor |
| **EXPOSE** | Documenta que puerto usa la app (no lo abre, solo informativo) |
| **CMD** | Comando que se ejecuta al iniciar el contenedor |

### Docker Compose

Docker Compose es una herramienta para **definir y ejecutar aplicaciones multi-contenedor** con un solo archivo YAML. Aunque aqui usamos un solo servicio, simplifica mucho la configuracion.

```yaml
services:
  app:
    build: .                    # Construir imagen desde el Dockerfile actual
    ports:
      - "5173:5173"             # Mapear puerto: host:contenedor
    volumes:
      - .:/workspace            # Montar codigo local en el contenedor (hot-reload)
      - node_modules:/workspace/node_modules  # Volumen persistente para node_modules
    command: npm run dev -- --host

volumes:
  node_modules:                 # Volumen nombrado (persiste entre reinicios)
```

**Por que usamos volumes:**
- `.:/workspace` — Monta tu codigo local dentro del contenedor. Cuando editas un archivo en tu editor, el cambio se ve dentro del contenedor inmediatamente (asi funciona el hot-reload con Vite)
- `node_modules:/workspace/node_modules` — Volumen separado para que los `node_modules` del contenedor (Linux) no se mezclen con los de tu maquina (puede ser Mac/Windows)

**Comandos:**

```bash
docker compose up          # Construir imagen (si no existe) + levantar contenedor
docker compose up --build  # Forzar reconstruccion de la imagen
docker compose down        # Detener y eliminar contenedores
docker compose exec app sh # Abrir terminal dentro del contenedor
```

### GitHub Pages

GitHub Pages es un **servicio gratuito de hosting para sitios estaticos** (HTML, CSS, JS) directamente desde un repositorio de GitHub.

**Como funciona en este proyecto:**
1. `npm run build` genera la carpeta `dist/` con archivos estaticos optimizados
2. `gh-pages -d dist` sube el contenido de `dist/` a la rama `gh-pages`
3. GitHub detecta la rama y sirve los archivos en `https://usuario.github.io/repo/`

**Importante:** Como la app se sirve desde un subdirectorio (`/poke-memory-game/` y no `/`), hay que configurar `base` en Vite para que las rutas de los assets sean correctas.

### ESLint

ESLint es un **linter** — una herramienta que analiza tu codigo JavaScript/JSX y detecta errores o malas practicas **sin ejecutarlo**.

```bash
npm run lint  # Ejecutar ESLint en el proyecto
```

Ejemplo de lo que detecta: variables sin usar, imports duplicados, hooks de React usados incorrectamente.

### Lucide React

Lucide es una libreria de **iconos SVG** optimizados para React. Cada icono es un componente que puedes importar individualmente (tree-shakeable — solo se incluye lo que usas en el build final).

```jsx
import { RotateCcw } from 'lucide-react';

<RotateCcw size={20} />  // Renderiza un icono SVG de 20x20px
```

## Autor

Rodiel - [GitHub](https://github.com/Rodielm)
