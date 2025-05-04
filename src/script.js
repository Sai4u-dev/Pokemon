// Constants
const API_BASE_URL = 'https://pokeapi.co/api/v2';
const POKEMON_LIMIT = 12;
let currentOffset = 0;
let allPokemon = [];
let pokemonTypes = new Set();
let sortDirection = 'asc';

// DOM Elements
const featuredCardsContainer = document.getElementById('featured-cards');
const productGrid = document.getElementById('product-grid');
const loadMoreBtn = document.getElementById('load-more');
const typeFilter = document.getElementById('type-filter');
const sortBtn = document.getElementById('sort-btn');

// Featured Pokémon IDs (some popular ones)
const featuredPokemonIds = [25, 6, 150, 149, 384]; // Pikachu, Charizard, Mewtwo, Dragonite, Rayquaza

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

// Fetch a single Pokemon's complete data
async function fetchPokemonData(idOrName) {
    try {
        const response = await fetch(`${API_BASE_URL}/pokemon/${idOrName}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching Pokemon ${idOrName}:`, error);
        return null;
    }
}

// Fetch featured Pokemon
async function fetchFeaturedPokemon() {
    if (!featuredCardsContainer) return;
    
    featuredCardsContainer.innerHTML = '<div class="loading">Loading featured Pokémon...</div>';
    
    try {
        const pokemonPromises = featuredPokemonIds.map(id => fetchPokemonData(id));
        const pokemonList = await Promise.all(pokemonPromises);
        
        // Filter out any null results
        const validPokemon = pokemonList.filter(pokemon => pokemon !== null);
        
        if (validPokemon.length === 0) {
            featuredCardsContainer.innerHTML = '<p>Failed to load featured Pokémon. Please try again later.</p>';
            return;
        }
        
        renderFeaturedPokemon(validPokemon);
    } catch (error) {
        console.error('Error fetching featured Pokemon:', error);
        featuredCardsContainer.innerHTML = '<p>Failed to load featured Pokémon. Please try again later.</p>';
    }
}

// Render featured Pokemon cards
function renderFeaturedPokemon(pokemonList) {
    featuredCardsContainer.innerHTML = '';
    
    pokemonList.forEach(pokemon => {
        // Get the official artwork
        const imageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
        const price = generatePrice(pokemon);
        
        // Create featured card HTML
        const featuredCard = document.createElement('div');
        featuredCard.className = 'featured-card';
        featuredCard.innerHTML = `
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
        
        featuredCardsContainer.appendChild(featuredCard);
    });
}

// Fetch Pokemon list
async function fetchPokemonList(offset = 0, limit = POKEMON_LIMIT) {
    if (!productGrid) return [];
    
    if (offset === 0) {
        productGrid.innerHTML = '<div class="loading">Loading Pokémon collection...</div>';
    }
    
    try {
        // First, get the list of Pokemon
        const response = await fetch(`${API_BASE_URL}/pokemon?offset=${offset}&limit=${limit}`);
        const data = await response.json();
        
        // Then fetch detailed data for each Pokemon
        const pokemonPromises = data.results.map(pokemon => fetchPokemonData(pokemon.name));
        const pokemonDetails = await Promise.all(pokemonPromises);
        
        // Filter out any null results
        const validPokemon = pokemonDetails.filter(pokemon => pokemon !== null);
        
        if (validPokemon.length === 0 && offset === 0) {
            productGrid.innerHTML = '<p>Failed to load Pokémon. Please try again later.</p>';
            return [];
        }
        
        // Add to our collection and collect types
        validPokemon.forEach(pokemon => {
            pokemon.types.forEach(type => {
                pokemonTypes.add(type.type.name);
            });
        });
        
        // Update the type filter if this is the first load
        if (offset === 0 && typeFilter) {
            updateTypeFilter();
        }
        
        return validPokemon;
    } catch (error) {
        console.error('Error fetching Pokemon list:', error);
        if (offset === 0) {
            productGrid.innerHTML = '<p>Failed to load Pokémon. Please try again later.</p>';
        }
        return [];
    }
}

// Update the type filter dropdown
function updateTypeFilter() {
    typeFilter.innerHTML = '<option value="">All Types</option>';
    
    // Sort types alphabetically
    const sortedTypes = Array.from(pokemonTypes).sort();
    
    sortedTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = capitalizeFirstLetter(type);
        typeFilter.appendChild(option);
    });
}

// Render Pokemon product cards
function renderPokemonProducts(pokemonList, append = false) {
    if (!productGrid) return;
    
    if (!append) {
        productGrid.innerHTML = '';
    }
    
    if (pokemonList.length === 0) {
        productGrid.innerHTML = '<p>No Pokémon found matching your criteria.</p>';
        return;
    }
    
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
        
        productGrid.appendChild(productCard);
    });
}

// Filter Pokemon by type
function filterPokemonByType(type) {
    if (!type) {
        return allPokemon;
    }
    
    return allPokemon.filter(pokemon => 
        pokemon.types.some(t => t.type.name === type)
    );
}

// Sort Pokemon by name
function sortPokemonByName(pokemonList) {
    return [...pokemonList].sort((a, b) => {
        if (sortDirection === 'asc') {
            return a.name.localeCompare(b.name);
        } else {
            return b.name.localeCompare(a.name);
        }
    });
}

// Apply filters and sorting
function applyFiltersAndSort() {
    if (!typeFilter) return;
    
    const selectedType = typeFilter.value;
    let filteredPokemon = filterPokemonByType(selectedType);
    filteredPokemon = sortPokemonByName(filteredPokemon);
    renderPokemonProducts(filteredPokemon);
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

// Initialize event listeners
function initializeEventListeners() {
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async () => {
            currentOffset += POKEMON_LIMIT;
            const newPokemon = await fetchPokemonList(currentOffset);
            allPokemon = [...allPokemon, ...newPokemon];
            renderPokemonProducts(newPokemon, true);
        });
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', () => {
            applyFiltersAndSort();
        });
    }
    
    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            sortBtn.textContent = `Sort by Name (${sortDirection === 'asc' ? 'A-Z' : 'Z-A'})`;
            applyFiltersAndSort();
        });
    }
}

// Dummy functions for page initializations
function initializeCategoriesPage() {
    // Add your categories page initialization logic here
    console.log('Initializing categories page');
}

function initializeCheckoutPage() {
    // Add your checkout page initialization logic here
    console.log('Initializing checkout page');
}

// Initialize the page
async function initializePage() {
    // Check which page we're on
    const isHomePage = document.getElementById('featured-cards') !== null;
    const isCategoriesPage = document.querySelector('.categories-grid') !== null;
    const isCheckoutPage = document.querySelector('.checkout-container') !== null;
    
    if (isHomePage) {
        // Fetch featured Pokemon
        fetchFeaturedPokemon();
        
        // Fetch initial Pokemon list
        const initialPokemon = await fetchPokemonList();
        allPokemon = initialPokemon;
        renderPokemonProducts(initialPokemon);
    } else if (isCategoriesPage) {
        // Initialize categories page
        initializeCategoriesPage();
    } else if (isCheckoutPage) {
        // Initialize checkout page
        initializeCheckoutPage();
    }
    
    // Initialize event listeners
    initializeEventListeners();
}

// Start the app
document.addEventListener('DOMContentLoaded', initializePage);