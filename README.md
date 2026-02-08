# 🎮 Pokémon Memory Game

Juego de memoria interactivo con cartas de Pokémon, construido con React + Vite.

## ✨ Características

- 🎴 8 pares de cartas con Pokémon icónicos
- 🖼️ Imágenes oficiales de alta calidad
- ✨ Animaciones 3D al voltear cartas
- 📊 Contador de movimientos
- 🎯 Detección automática de pares
- 📱 Diseño responsive

## 🚀 Instalación

### Opción 1: Local
```bash
npm install
npm run dev
```

### Opción 2: Docker (recomendado)

No necesitas instalar Node.js ni ninguna dependencia en tu máquina. Solo necesitas [Docker](https://docs.docker.com/get-docker/).

**Levantar el entorno de desarrollo:**
```bash
docker compose up
```

La app estará disponible en `http://localhost:5173`. Los cambios en el código se reflejan automáticamente gracias al hot-reload de Vite.

**Reconstruir la imagen** (después de cambios en `package.json`):
```bash
docker compose up --build
```

**Ejecutar comandos dentro del contenedor** (lint, build, etc.):
```bash
docker compose exec app npm run lint
docker compose exec app npm run build
```

**Detener el entorno:**
```bash
docker compose down
```

## 🛠️ Tecnologías

- React 18
- Vite
- Tailwind CSS
- Lucide React

## 👨‍💻 Autor

Rodiel - [GitHub](https://github.com/poke-memory-game)