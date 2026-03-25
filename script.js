const pokemonGrid = document.getElementById('pokemon-grid');
const loadMoreBtn = document.getElementById('load-more');
const modal = document.getElementById('pokemon-modal');
const modalContent = document.getElementById('pokemon-details');
const closeModal = document.querySelector('.close');
const catchBtn = document.getElementById('catch-btn');

let nextUrl = 'https://pokeapi.co/api/v2/pokemon?limit=20';
let caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
let allPokemon = []; // store all loaded Pokémon

// Helper: capitalize first letter
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Parse Pokémon ID from URL
function parseUrl(url) {
  return url.substring(url.substring(0, url.length - 1).lastIndexOf('/') + 1, url.length - 1);
}

// Fetch and store Pokémon
async function fetchPokemon(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    nextUrl = data.next;

    allPokemon.push(...data.results); // add new Pokémon to allPokemon
    renderPokemon(allPokemon);
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
  }
}

// Render Pokémon grid
function renderPokemon(pokemonList) {
  pokemonGrid.innerHTML = ''; // clear grid
  pokemonList.forEach(pokemon => {
    const id = parseUrl(pokemon.url);
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    if (caughtPokemon.includes(id)) card.classList.add('caught');

    card.innerHTML = `
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png" alt="${pokemon.name}">
      <h3>${capitalizeFirstLetter(pokemon.name)}</h3>
    `;

    card.addEventListener('click', () => showDetails(id));
    pokemonGrid.appendChild(card);
  });
}

// Show modal with Pokémon details
async function showDetails(id) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    const data = await res.json();

    modalContent.innerHTML = `
      <h2>${capitalizeFirstLetter(data.name)}</h2>
      <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}">
      <p><strong>Type:</strong> ${data.types.map(t => capitalizeFirstLetter(t.type.name)).join(', ')}</p>
      <p><strong>Abilities:</strong> ${data.abilities.map(a => capitalizeFirstLetter(a.ability.name)).join(', ')}</p>
    `;

    catchBtn.dataset.id = id;
    catchBtn.textContent = caughtPokemon.includes(id) ? 'Release' : 'Catch';
    modal.classList.remove('hidden');
  } catch (error) {
    console.error('Error fetching Pokémon details:', error);
  }
}

// Catch/Release Pokémon
catchBtn.addEventListener('click', () => {
  const id = catchBtn.dataset.id;
  if (caughtPokemon.includes(id)) {
    caughtPokemon = caughtPokemon.filter(p => p !== id);
  } else {
    caughtPokemon.push(id);
  }
  localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
  renderPokemon(allPokemon); // re-render all loaded Pokémon
  modal.classList.add('hidden');
});

// Load more Pokémon
loadMoreBtn.addEventListener('click', () => {
  if (nextUrl) fetchPokemon(nextUrl);
});

// Close modal
closeModal.addEventListener('click', () => modal.classList.add('hidden'));

// Initial load
fetchPokemon(nextUrl);
