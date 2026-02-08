import React, { useState, useEffect } from 'react';
import { Shuffle, RotateCcw } from 'lucide-react';

// =============================================================================
// DATOS DEL JUEGO
// =============================================================================
// Usamos URLs directas de los sprites oficiales de PokeAPI (GitHub raw).
// Esto evita hacer llamadas a una API externa y hace que la app sea más rápida.
// Cada objeto tiene: id (para emparejar), name (para mostrar) e image (URL del sprite).
const POKEMON_DATA = [
  { id: 1, name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' },
  { id: 4, name: 'Charmander', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png' },
  { id: 7, name: 'Squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png' },
  { id: 25, name: 'Pikachu', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' },
  { id: 133, name: 'Eevee', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png' },
  { id: 143, name: 'Snorlax', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png' },
  { id: 150, name: 'Mewtwo', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png' },
  { id: 151, name: 'Mew', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png' }
];

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================
const PokemonMemoryGame = () => {
  // --- ESTADO DEL JUEGO (useState) ---
  // React usa "estado" para recordar datos que cambian con el tiempo.
  // Cuando el estado cambia, React re-renderiza el componente automáticamente.

  const [cards, setCards] = useState([]);       // Todas las cartas del tablero (16 = 8 pares)
  const [flipped, setFlipped] = useState([]);   // IDs de cartas actualmente volteadas (máx. 2)
  const [matched, setMatched] = useState([]);   // IDs de cartas que ya fueron emparejadas
  const [moves, setMoves] = useState(0);        // Contador de movimientos del jugador
  const [loading, setLoading] = useState(true); // Pantalla de carga inicial

  // --- EFECTO INICIAL (useEffect) ---
  // useEffect con [] vacío se ejecuta UNA sola vez cuando el componente se monta.
  // Es el lugar ideal para inicializar el juego.
  useEffect(() => {
    initGame();
  }, []);

  // --- INICIALIZAR / REINICIAR JUEGO ---
  const initGame = () => {
    setLoading(true);

    // Paso 1: Duplicar los pokémon para crear pares
    // El spread [...array] crea una copia. Hacemos 2 copias y las unimos.
    // .map() agrega un uniqueId (posición en el array) y pairId (para saber qué cartas son pareja).
    const gameCards = [...POKEMON_DATA, ...POKEMON_DATA].map((pokemon, index) => ({
      ...pokemon,
      uniqueId: index,   // Identificador único de cada carta (0-15)
      pairId: pokemon.id // Identificador del par (las 2 cartas de Pikachu comparten pairId: 25)
    }));

    // Paso 2: Mezclar y resetear todo el estado
    setCards(shuffleArray(gameCards));
    setFlipped([]);
    setMatched([]);
    setMoves(0);

    // Pequeño delay para suavizar la transición visual
    setTimeout(() => setLoading(false), 300);
  };

  // --- ALGORITMO DE MEZCLA (Fisher-Yates Shuffle) ---
  // Es el algoritmo estándar para mezclar arrays de forma uniforme.
  // Recorre el array de atrás hacia adelante, intercambiando cada elemento
  // con otro en una posición aleatoria anterior.
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Destructuring swap
    }
    return newArray;
  };

  // --- LÓGICA AL HACER CLICK EN UNA CARTA ---
  const handleCardClick = (uniqueId) => {
    // Guardas: ignorar click si ya hay 2 cartas volteadas, si la carta ya está
    // volteada, o si la carta ya fue emparejada.
    if (flipped.length === 2 || flipped.includes(uniqueId) || matched.includes(uniqueId)) {
      return;
    }

    // Agregar la carta clickeada a las volteadas
    const newFlipped = [...flipped, uniqueId];
    setFlipped(newFlipped);

    // Si hay 2 cartas volteadas, verificar si son pareja
    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      const firstCard = cards.find(c => c.uniqueId === first);
      const secondCard = cards.find(c => c.uniqueId === second);

      if (firstCard.pairId === secondCard.pairId) {
        // Son pareja: moverlas a "matched" después de 600ms (para ver la animación)
        setTimeout(() => {
          setMatched([...matched, first, second]);
          setFlipped([]);
        }, 600);
      } else {
        // No son pareja: voltearlas de regreso después de 1s (tiempo para memorizar)
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  // --- PANTALLA DE CARGA ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">
          Cargando Pokémon...
        </div>
      </div>
    );
  }

  // --- VERIFICAR SI EL JUEGO TERMINÓ ---
  // Si la cantidad de cartas emparejadas es igual al total, el jugador ganó.
  const isGameComplete = matched.length === cards.length;

  // =============================================================================
  // RENDER (JSX)
  // =============================================================================
  // JSX es la sintaxis que permite escribir "HTML" dentro de JavaScript.
  // Tailwind CSS se usa para estilos: cada clase es una propiedad CSS (ej: "p-4" = padding: 1rem).
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* --- HEADER: título, contadores y botón de reinicio --- */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🎮 Pokémon Memory Game
          </h1>
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg">
              <p className="text-gray-700 font-semibold">
                Movimientos: <span className="text-purple-600 text-xl">{moves}</span>
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg">
              <p className="text-gray-700 font-semibold">
                Pares: <span className="text-green-600 text-xl">{matched.length / 2} / {cards.length / 2}</span>
              </p>
            </div>
          </div>
          <button
            onClick={initGame}
            className="bg-white hover:bg-gray-100 text-purple-600 font-bold py-3 px-6 rounded-full shadow-lg transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Nuevo Juego
          </button>
        </div>

        {/* --- MENSAJE DE VICTORIA ---
            Renderizado condicional: {condición && <JSX>}
            Solo se muestra si isGameComplete es true. */}
        {isGameComplete && (
          <div className="bg-yellow-300 border-4 border-yellow-500 rounded-lg p-6 mb-8 text-center animate-bounce">
            <h2 className="text-3xl font-bold text-purple-700 mb-2">
              🎉 ¡Felicidades! 🎉
            </h2>
            <p className="text-xl text-gray-800">
              Completaste el juego en {moves} movimientos
            </p>
          </div>
        )}

        {/* --- GRID DE CARTAS ---
            .map() renderiza una carta por cada elemento del array.
            "key" es obligatorio en listas de React para identificar cada elemento. */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.uniqueId) || matched.includes(card.uniqueId);
            const isMatched = matched.includes(card.uniqueId);

            return (
              <div
                key={card.uniqueId}
                onClick={() => handleCardClick(card.uniqueId)}
                className="aspect-square cursor-pointer"
                style={{ perspective: '1000px' }} // perspective habilita el efecto 3D
              >
                {/* Contenedor de la carta con animación de giro (flip) via CSS transform */}
                <div
                  className="relative w-full h-full transition-transform duration-500"
                  style={{
                    transformStyle: 'preserve-3d', // Permite que los hijos tengan profundidad 3D
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* CARA TRASERA (Pokeball) - visible cuando la carta NO está volteada */}
                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg flex items-center justify-center backface-hidden border-4 border-yellow-400"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <img
                      src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                      alt="Pokeball"
                      className="w-3/5 h-3/5 object-contain drop-shadow-lg"
                    />
                  </div>

                  {/* CARA FRONTAL (Pokémon) - visible cuando la carta SÍ está volteada
                      backfaceVisibility: 'hidden' + transform: rotateY(180deg) es el truco CSS
                      que hace funcionar el efecto flip. Ambas caras se superponen, pero solo
                      una es visible según la rotación del contenedor padre. */}
                  <div
                    className={`absolute w-full h-full rounded-xl shadow-lg flex flex-col items-center justify-center p-2 backface-hidden border-4 ${
                      isMatched ? 'bg-gradient-to-br from-green-300 to-green-500 border-green-600' : 'bg-white border-gray-300'
                    }`}
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-contain"
                    />
                    <p className="text-xs font-bold text-gray-700 capitalize mt-1">
                      {card.name}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto shadow-lg">
          <h3 className="text-xl font-bold text-purple-700 mb-3">📖 Cómo jugar:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Haz clic en una carta para voltearla</li>
            <li>• Encuentra los pares de Pokémon idénticos</li>
            <li>• Intenta completar el juego en la menor cantidad de movimientos</li>
            <li>• ¡Usa tu memoria para recordar dónde están las cartas!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PokemonMemoryGame;