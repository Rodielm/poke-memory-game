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

- Node.js (v18+)
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

## Autor

Rodiel - [GitHub](https://github.com/Rodielm)
