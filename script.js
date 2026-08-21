// ========================================
// MealFinder - Vanilla JavaScript
// ========================================

// ========================================
// Global Variables
// ========================================

let allMeals = [];
let showingAll = false;
const MEALS_PER_PAGE = 5;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const mealsGrid = document.getElementById('mealsGrid');
const loadingState = document.getElementById('loadingState');
const noResultsState = document.getElementById('noResultsState');
const errorState = document.getElementById('errorState');
const initialState = document.getElementById('initialState');
const showAllContainer = document.getElementById('showAllContainer');
const showAllBtn = document.getElementById('showAllBtn');

// ========================================
// Event Listeners
// ========================================

// Search button click
searchBtn.addEventListener('click', handleSearch);

// Search input Enter key
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// Show All button click
showAllBtn.addEventListener('click', showAllMeals);

// ========================================
// Main Search Handler
// ========================================

function handleSearch() {
    // Get the search term from input
    const searchTerm = searchInput.value.trim();

    // Validate input
    if (searchTerm === '') {
        hideAllStates();
        initialState.classList.remove('hidden');
        return;
    }

    // Clear previous results and reset state
    clearResults();

    // Show loading spinner
    showLoading();

    // Fetch meals from API
    searchMeals(searchTerm);
}

// ========================================
// API Integration
// ========================================

async function searchMeals(searchTerm) {
    try {
        // Construct API URL with proper encoding
        const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchTerm)}`;

        // Fetch data from TheMealDB API
        const response = await fetch(apiUrl);

        // Check if response is OK
        if (!response.ok) {
            throw new Error('API request failed');
        }

        // Parse JSON
        const data = await response.json();

        // Check if meals were found
        if (data.meals === null) {
            hideAllStates();
            noResultsState.classList.remove('hidden');
            return;
        }

        // Store all meals globally
        allMeals = data.meals;
        showingAll = false;

        // Display first 5 meals (or all if less than 5)
        displayMeals(allMeals);

    } catch (error) {
        // Handle network errors
        console.error('Error fetching meals:', error);
        hideAllStates();
        errorState.classList.remove('hidden');
    }
}

// ========================================
// Display Meals
// ========================================

function displayMeals(meals) {
    // Clear the grid
    mealsGrid.innerHTML = '';

    // Determine how many meals to show
    const mealsToShow = showingAll ? meals : meals.slice(0, MEALS_PER_PAGE);

    // Hide all states
    hideAllStates();

    // Display meals grid
    mealsGrid.classList.remove('hidden');

    // Create and append meal cards
    mealsToShow.forEach((meal) => {
        const card = createMealCard(meal);
        mealsGrid.appendChild(card);
    });

    // Show SHOW ALL button only if there are more than 5 meals and we're not showing all
    if (meals.length > MEALS_PER_PAGE && !showingAll) {
        showAllContainer.classList.remove('hidden');
    } else {
        showAllContainer.classList.add('hidden');
    }
}

// ========================================
// Create Meal Card Element
// ========================================

function createMealCard(meal) {
    // Create card container
    const card = document.createElement('div');
    card.className = 'meal-card';

    // Create meal image
    const image = document.createElement('img');
    image.src = meal.strMealThumb;
    image.alt = meal.strMeal;
    image.className = 'meal-image';

    // Create content container
    const content = document.createElement('div');
    content.className = 'meal-content';

    // Create meal title
    const title = document.createElement('h3');
    title.className = 'meal-title';
    title.textContent = meal.strMeal;

    // Create meal ID
    const mealId = document.createElement('p');
    mealId.className = 'meal-id';
    mealId.textContent = `ID: ${meal.idMeal}`;

    // Create instructions preview (limited to 100px height initially)
    const instructionsPreview = document.createElement('p');
    instructionsPreview.className = 'meal-instructions-preview';
    instructionsPreview.textContent = meal.strInstructions;

    // Create Read More button
    const readMoreBtn = document.createElement('button');
    readMoreBtn.className = 'read-more-btn';
    readMoreBtn.textContent = 'Read More';

    // Toggle full instructions on button click
    readMoreBtn.addEventListener('click', () => {
        const isExpanded = instructionsPreview.classList.contains('expanded');

        if (isExpanded) {
            instructionsPreview.classList.remove('expanded');
            readMoreBtn.textContent = 'Read More';
        } else {
            instructionsPreview.classList.add('expanded');
            readMoreBtn.textContent = 'Read Less';
        }
    });

    // Append elements to content
    content.appendChild(title);
    content.appendChild(mealId);
    content.appendChild(instructionsPreview);
    content.appendChild(readMoreBtn);

    // Append image and content to card
    card.appendChild(image);
    card.appendChild(content);

    return card;
}

// ========================================
// Show All Meals
// ========================================

function showAllMeals() {
    // Set flag to show all
    showingAll = true;

    // Display all meals without limit
    displayMeals(allMeals);

    // Scroll to top of results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// UI State Management
// ========================================

function showLoading() {
    hideAllStates();
    loadingState.classList.remove('hidden');
}

function clearResults() {
    // Reset global state
    allMeals = [];
    showingAll = false; 

    // Clear grid
    mealsGrid.innerHTML = '';

    // Hide all state containers
    hideAllStates();
}

function hideAllStates() {
    // Hide all state containers
    loadingState.classList.add('hidden');
    noResultsState.classList.add('hidden');
    errorState.classList.add('hidden');
    initialState.classList.add('hidden');
    mealsGrid.classList.add('hidden');
    showAllContainer.classList.add('hidden');
}
