// Constants
const API_BASE_URL = 'https://pokeapi.co/api/v2';

// DOM Elements
const categoriesGrid = document.getElementById('categories-grid');
const categoryPokemonSection = document.getElementById('category-pokemon');
const categoryTitle = document.getElementById('category-title');
const categoryPokemonGrid = document.getElementById('category-pokemon-grid');
const backToCategoriesBtn = document.getElementById('back-to-categories-btn');

// Type colors for category cards
const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
};

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper function to generate a price based on Pokemon stats
function generatePrice(pokemon) {
    // Base price from base_experience or default to a random number
    const basePrice = pokemon.base_experience || Math.floor(Math.random() * 50) + 30;
    return (basePrice * 0.5).toFixed(2);
}

// Fetch all Pokemon types
async function fetchPokemonTypes() {
    try {
        const response = await fetch(`${API_BASE_URL}/type`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching Pokemon types:', error);
        return [];
    }
}

// Fetch Pokemon by type
async function fetchPokemonByType(typeUrl) {
    try {
        const response = await fetch(typeUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Pokemon by type:', error);
        return null;
    }
}

// Fetch a single Pokemon's complete data
async function fetchPokemonData(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching Pokemon data:`, error);
        return null;
    }
}

// Render category cards
async function renderCategoryCards() {
    categoriesGrid.innerHTML = '<div class="loading">Loading Pokémon types...</div>';
    
    try {
        const types = await fetchPokemonTypes();
        
        if (types.length === 0) {
            categoriesGrid.innerHTML = '<p>Failed to load Pokémon types. Please try again later.</p>';
            return;
        }
        
        categoriesGrid.innerHTML = '';
        
        // Filter out types we don't want to show (like unknown and shadow)
        const filteredTypes = types.filter(type => 
            type.name !== 'unknown' && type.name !== 'shadow'
        );
        
        filteredTypes.forEach(type => {
            const typeName = type.name;
            const backgroundColor = typeColors[typeName] || '#777777';
            
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.dataset.type = typeName;
            categoryCard.dataset.url = type.url;
            categoryCard.innerHTML = `
                <div class="category-icon" style="background-color: ${backgroundColor}20;">
                    <img src="https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${typeName}.svg" 
                         alt="${typeName} type" 
                         onerror="this.src='https://raw.githubusercontent.com/msikma/pokesprite/master/misc/types/gen8/${typeName}.png'; this.onerror=null;">
                </div>
                <div class="category-name" style="background-color: ${backgroundColor};">
                    ${capitalizeFirstLetter(typeName)}
                </div>
            `;
            
            categoryCard.addEventListener('click', () => showPokemonByType(type));
            
            categoriesGrid.appendChild(categoryCard);
        });
    } catch (error) {
        console.error('Error rendering category cards:', error);
        categoriesGrid.innerHTML = '<p>Failed to load Pokémon types. Please try again later.</p>';
    }
}

// Show Pokemon by selected type
async function showPokemonByType(type) {
    categoryPokemonGrid.innerHTML = '<div class="loading">Loading Pokémon...</div>';
    categoryTitle.textContent = `${capitalizeFirstLetter(type.name)} Type Pokémon`;
    categoryPokemonSection.style.display = 'block';
    
    // Scroll to the Pokemon section
    categoryPokemonSection.scrollIntoView({ behavior: 'smooth' });
    
    try {
        const typeData = await fetchPokemonByType(type.url);
        
        if (!typeData || typeData.pokemon.length === 0) {
            categoryPokemonGrid.innerHTML = '<p>No Pokémon found for this type.</p>';
            return;
        }
        
        // Limit to first 20 Pokemon to avoid too many requests
        const limitedPokemon = typeData.pokemon.slice(0, 20);
        
        // Fetch detailed data for each Pokemon
        const pokemonPromises = limitedPokemon.map(p => fetchPokemonData(p.pokemon.url));
        const pokemonDetails = await Promise.all(pokemonPromises);
        
        // Filter out any null results
        const validPokemon = pokemonDetails.filter(pokemon => pokemon !== null);
        
        if (validPokemon.length === 0) {
            categoryPokemonGrid.innerHTML = '<p>Failed to load Pokémon. Please try again later.</p>';
            return;
        }
        
        renderPokemonByType(validPokemon);
    } catch (error) {
        console.error('Error showing Pokemon by type:', error);
        categoryPokemonGrid.innerHTML = '<p>Failed to load Pokémon. Please try again later.</p>';
    }
}

// Render Pokemon by type
function renderPokemonByType(pokemonList) {
    categoryPokemonGrid.innerHTML = '';
    
    pokemonList.forEach(pokemon => {
        // Get the official artwork
        const imageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
        const price = generatePrice(pokemon);
        
        // Create product card HTML
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="card-image">
                <img src="${imageUrl}" alt="${pokemon.name}">
            </div>
            <div class="card-content">
                <h3>${capitalizeFirstLetter(pokemon.name)}</h3>
                <div>
                    ${pokemon.types.map(type => `<span class="type">${type.type.name}</span>`).join('')}
                </div>
                <p class="price">$${price}</p>
                <button class="btn">Add to Cart</button>
            </div>
        `;
        
        categoryPokemonGrid.appendChild(productCard);
    });
}

// Initialize the categories page
function initializeCategoriesPage() {
    renderCategoryCards();
    
    // Back to categories button
    if (backToCategoriesBtn) {
        backToCategoriesBtn.addEventListener('click', () => {
            categoryPokemonSection.style.display = 'none';
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', initializeCategoriesPage);