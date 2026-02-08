import React, { useState, useEffect } from 'react';
import { Shuffle, RotateCcw } from 'lucide-react';

// Pokémon data con URLs directas (sin necesidad de API)
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

const PokemonMemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    setLoading(true);
    
    // Crear las cartas duplicadas
    const gameCards = [...POKEMON_DATA, ...POKEMON_DATA].map((pokemon, index) => ({
      ...pokemon,
      uniqueId: index,
      pairId: pokemon.id
    }));
    
    setCards(shuffleArray(gameCards));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    
    // Simular carga mínima para suavidad visual
    setTimeout(() => setLoading(false), 300);
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleCardClick = (uniqueId) => {
    if (flipped.length === 2 || flipped.includes(uniqueId) || matched.includes(uniqueId)) {
      return;
    }

    const newFlipped = [...flipped, uniqueId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      const firstCard = cards.find(c => c.uniqueId === first);
      const secondCard = cards.find(c => c.uniqueId === second);

      if (firstCard.pairId === secondCard.pairId) {
        setTimeout(() => {
          setMatched([...matched, first, second]);
          setFlipped([]);
        }, 600);
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">
          Cargando Pokémon...
        </div>
      </div>
    );
  }

  const isGameComplete = matched.length === cards.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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

        {/* Victory Message */}
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

        {/* Game Grid */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.uniqueId) || matched.includes(card.uniqueId);
            const isMatched = matched.includes(card.uniqueId);

            return (
              <div
                key={card.uniqueId}
                onClick={() => handleCardClick(card.uniqueId)}
                className="aspect-square cursor-pointer"
                style={{ perspective: '1000px' }}
              >
                <div
                  className="relative w-full h-full transition-transform duration-500"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* Card Back */}
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

                  {/* Card Front */}
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