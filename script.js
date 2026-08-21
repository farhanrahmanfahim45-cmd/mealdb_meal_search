// ========================================
// MealFinder - Vanilla JavaScript
// ========================================

// ========================================
// Global Variables
// ========================================

let allMeals = [];
let showingAll = false;
let lastSearchTerm = '';
const MEALS_PER_PAGE = 5;

// DOM Elements — core search (unchanged IDs, preserved behavior)
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const mealsGrid = document.getElementById('mealsGrid');
const loadingState = document.getElementById('loadingState');
const noResultsState = document.getElementById('noResultsState');
const errorState = document.getElementById('errorState');
const initialState = document.getElementById('initialState');
const showAllContainer = document.getElementById('showAllContainer');
const showAllBtn = document.getElementById('showAllBtn');

// DOM Elements — new UI
const resultsTitle = document.getElementById('resultsTitle');
const resultsSubtitle = document.getElementById('resultsSubtitle');
const resultsCount = document.getElementById('resultsCount');
const noResultsText = document.getElementById('noResultsText');
const retryBtn = document.getElementById('retryBtn');
const chipsRow = document.getElementById('chipsRow');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

// ========================================
// Icon rendering (Lucide)
// ========================================

function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
}

// ========================================
// Event Listeners — core search
// ========================================

// Submitting the search form covers both the button click and pressing
// Enter in the input — including mobile "Go/Search" keyboard buttons and
// IME input, which a plain keypress listener can miss.
if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        handleSearch();
    });
} else {
    // Fallback in case the form wrapper is ever removed
    searchBtn.addEventListener('click', () => handleSearch());
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.isComposing) {
            handleSearch();
        }
    });
}

showAllBtn.addEventListener('click', showAllMeals);

if (retryBtn) {
    retryBtn.addEventListener('click', () => {
        if (lastSearchTerm) {
            searchInput.value = lastSearchTerm;
            handleSearch();
        }
    });
}

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
        resultsSubtitle.textContent = 'Your matches will appear here.';
        resultsCount.classList.add('hidden');
        return;
    }

    lastSearchTerm = searchTerm;

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
            if (noResultsText) {
                noResultsText.textContent = `We couldn't find a meal matching "${searchTerm}". Try another meal name or ingredient.`;
            }
            resultsSubtitle.textContent = `No matches for "${searchTerm}"`;
            resultsCount.classList.add('hidden');
            renderIcons();
            return;
        }

        // Store all meals globally
        allMeals = data.meals;
        showingAll = false;

        // Display first 5 meals (or all if less than 5)
        displayMeals(allMeals, searchTerm);

    } catch (error) {
        // Handle network errors
        console.error('Error fetching meals:', error);
        hideAllStates();
        errorState.classList.remove('hidden');
        resultsSubtitle.textContent = 'Something went wrong with your search.';
        resultsCount.classList.add('hidden');
        renderIcons();
    }
}

// ========================================
// Display Meals
// ========================================

function displayMeals(meals, searchTerm) {
    // Clear the grid
    mealsGrid.innerHTML = '';

    // Determine how many meals to show
    const mealsToShow = showingAll ? meals : meals.slice(0, MEALS_PER_PAGE);

    // Hide all states
    hideAllStates();

    // Display meals grid
    mealsGrid.classList.remove('hidden');

    // Update title / subtitle / count
    if (searchTerm) {
        resultsSubtitle.textContent = `Showing results for "${searchTerm}"`;
    }
    resultsCount.textContent = meals.length === 1 ? '1 meal found' : `${meals.length} meals found`;
    resultsCount.classList.remove('hidden');

    // Create and append meal cards
    mealsToShow.forEach((meal, index) => {
        const card = createMealCard(meal, index);
        mealsGrid.appendChild(card);
    });

    // Show SHOW ALL button only if there are more than 5 meals and we're not showing all
    if (meals.length > MEALS_PER_PAGE && !showingAll) {
        showAllContainer.classList.remove('hidden');
    } else {
        showAllContainer.classList.add('hidden');
    }

    renderIcons();
}

// ========================================
// Create Meal Card Element
// ========================================

function createMealCard(meal, index) {
    // Create card container
    const card = document.createElement('div');
    card.className = 'meal-card';
    card.style.animationDelay = `${Math.min(index, 8) * 0.05}s`;

    // Media wrapper (image + id badge)
    const media = document.createElement('div');
    media.className = 'meal-media';

    const image = document.createElement('img');
    image.src = meal.strMealThumb;
    image.alt = meal.strMeal;
    image.className = 'meal-image';
    image.loading = 'lazy';

    const idBadge = document.createElement('span');
    idBadge.className = 'meal-id-badge';
    idBadge.textContent = `ID ${meal.idMeal}`;

    media.appendChild(image);
    media.appendChild(idBadge);

    // Create content container
    const content = document.createElement('div');
    content.className = 'meal-content';

    // Create meal title
    const title = document.createElement('h3');
    title.className = 'meal-title';
    title.textContent = meal.strMeal;

    // Create instructions preview
    const instructionsPreview = document.createElement('p');
    instructionsPreview.className = 'meal-instructions-preview';
    instructionsPreview.textContent = meal.strInstructions;

    // Footer with Read More button
    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';

    const readMoreBtn = document.createElement('button');
    readMoreBtn.className = 'read-more-btn';
    readMoreBtn.innerHTML = 'Read more <i data-lucide="chevron-down" aria-hidden="true"></i>';
    readMoreBtn.setAttribute('aria-expanded', 'false');

    // Toggle full instructions on button click
    readMoreBtn.addEventListener('click', () => {
        const isExpanded = instructionsPreview.classList.contains('expanded');

        if (isExpanded) {
            instructionsPreview.classList.remove('expanded');
            readMoreBtn.innerHTML = 'Read more <i data-lucide="chevron-down" aria-hidden="true"></i>';
            readMoreBtn.classList.remove('is-expanded');
            readMoreBtn.setAttribute('aria-expanded', 'false');
        } else {
            instructionsPreview.classList.add('expanded');
            readMoreBtn.innerHTML = 'Show less <i data-lucide="chevron-down" aria-hidden="true"></i>';
            readMoreBtn.classList.add('is-expanded');
            readMoreBtn.setAttribute('aria-expanded', 'true');
        }
        renderIcons();
    });

    cardFooter.appendChild(readMoreBtn);

    // Append elements to content
    content.appendChild(title);
    content.appendChild(instructionsPreview);
    content.appendChild(cardFooter);

    // Append media and content to card
    card.appendChild(media);
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
    displayMeals(allMeals, lastSearchTerm);

    // Scroll to top of results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// UI State Management
// ========================================

function showLoading() {
    hideAllStates();
    loadingState.classList.remove('hidden');
    resultsSubtitle.textContent = 'Looking through the kitchen…';
    resultsCount.classList.add('hidden');
    renderIcons();
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

// ========================================
// Quick Search Chips
// ========================================

if (chipsRow) {
    chipsRow.addEventListener('click', (event) => {
        const chip = event.target.closest('.chip');
        if (!chip) return;

        const term = chip.dataset.term;
        searchInput.value = term;
        handleSearch();
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    });
}

// ========================================
// Mobile Navigation
// ========================================

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    navLinks.addEventListener('click', (event) => {
        if (event.target.closest('a')) {
            navLinks.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Open menu');
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navLinks.classList.contains('open')) {
            navLinks.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Open menu');
            menuToggle.focus();
        }
    });
}

// ========================================
// Active Nav Link on Scroll
// ========================================

const navSections = ['home', 'search', 'about']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

if (navSections.length && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    document.querySelectorAll('.nav-link').forEach((link) => {
                        link.classList.toggle('active', link.dataset.nav === entry.target.id);
                    });
                }
            });
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    navSections.forEach((section) => navObserver.observe(section));
}

// ========================================
// Reveal-on-scroll animations
// ========================================

const revealEls = document.querySelectorAll('.reveal');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (revealEls.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
} else {
    revealEls.forEach((el) => el.classList.add('in-view'));
}

// ========================================
// Hero photo collage (decorative)
// ========================================

async function loadHeroCollage() {
    const collage = document.getElementById('heroCollage');
    if (!collage) return;

    const cards = collage.querySelectorAll('.collage-card');
    if (!cards.length) return;

    // Pull a handful of distinct random meals to populate the collage.
    // Each request is independent so one failure doesn't block the others.
    const requests = Array.from(cards).map(() =>
        fetch('https://www.themealdb.com/api/json/v1/1/random.php')
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null)
    );

    const results = await Promise.all(requests);

    results.forEach((data, index) => {
        const meal = data && data.meals && data.meals[0];
        const card = cards[index];
        if (!card) return;

        const img = card.querySelector('img');
        const skeleton = card.querySelector('.collage-skeleton');
        const caption = card.querySelector('figcaption');

        if (!meal) {
            // Fail quietly — leave the skeleton in place rather than an empty box.
            return;
        }

        img.src = meal.strMealThumb;
        img.alt = meal.strMeal;
        img.addEventListener('load', () => {
            img.classList.add('is-loaded');
            if (skeleton) skeleton.classList.add('hidden');
        }, { once: true });

        if (caption) caption.textContent = meal.strMeal;
    });
}

// ========================================
// Init
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    renderIcons();
    loadHeroCollage();
});
