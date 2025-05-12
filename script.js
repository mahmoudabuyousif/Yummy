document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    const navToggleBtn = document.getElementById('navToggleBtn');
    const mainContent = document.querySelector('main');
    const mealGrid = document.getElementById('mealGrid');
    const mealDetailSection = document.getElementById('mealDetailSection');
    const searchSection = document.getElementById('searchSection');
    const categoriesSection = document.getElementById('categoriesSection');
    const categoriesGrid = document.getElementById('categoriesGrid');
    const areaSection = document.getElementById('areaSection');
    const areaGrid = document.getElementById('areaGrid');
    const ingredientsSection = document.getElementById('ingredientsSection');
    const ingredientsGrid = document.getElementById('ingredientsGrid');
    const contactUsSection = document.getElementById('contactUsSection');
    const loadingScreen = document.getElementById('loadingScreen');

    const searchByNameInput = document.getElementById('searchByNameInput');
    const searchByFirstLetterInput = document.getElementById('searchByFirstLetterInput');

    const navSearch = document.getElementById('navSearch');
    const navCategories = document.getElementById('navCategories');
    const navArea = document.getElementById('navArea');
    const navIngredients = document.getElementById('navIngredients');
    const navContact = document.getElementById('navContact');

    const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';

    // --- Helper Functions ---
    function showLoading() {
        loadingScreen.style.display = 'flex';
    }

    function hideLoading() {
        // Add a small delay to ensure content is ready
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    function openNav() {
        nav.style.left = '0px';
        navToggleBtn.innerHTML = '<i class="fas fa-times"></i>';
        document.body.classList.add('nav-open');
    }

    function closeNav() {
        nav.style.left = '-250px';
        navToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.classList.remove('nav-open');
    }

    function hideAllSections() {
        searchSection.classList.add('hidden');
        mealGrid.classList.add('hidden');
        mealDetailSection.classList.add('hidden');
        categoriesSection.classList.add('hidden');
        areaSection.classList.add('hidden');
        ingredientsSection.classList.add('hidden');
        contactUsSection.classList.add('hidden');
    }

    function showSection(sectionElement) {
        hideAllSections();
        sectionElement.classList.remove('hidden');
        if (sectionElement === mealGrid || sectionElement === searchSection) { // Show meal grid if search is active
             mealGrid.classList.remove('hidden');
        }
    }

    async function fetchData(endpoint) {
        showLoading();
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Could not fetch data:", error);
            mealGrid.innerHTML = `<p class="text-red-500 text-center col-span-full">Could not load meals. Please try again later.</p>`;
            return null; // Or handle error appropriately
        } finally {
            hideLoading();
        }
    }

    // --- Display Functions ---
    function displayMeals(meals) {
        mealGrid.innerHTML = '';
        mealDetailSection.classList.add('hidden'); // Hide detail section when new meals are loaded
        if (!meals) {
            mealGrid.innerHTML = `<p class="text-gray-400 text-center col-span-full">No meals found.</p>`;
            return;
        }
        meals.forEach(meal => {
            const mealItem = `
                <div class="meal-item group relative rounded-lg overflow-hidden cursor-pointer" data-id="${meal.idMeal}">
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300">
                    <div class="meal-overlay absolute inset-0 bg-cardoverlay flex items-center justify-center p-4 text-center">
                        <h3 class="text-2xl font-bold text-black">${meal.strMeal}</h3>
                    </div>
                </div>
            `;
            mealGrid.innerHTML += mealItem;
        });

        document.querySelectorAll('.meal-item').forEach(item => {
            item.addEventListener('click', () => fetchMealDetails(item.dataset.id));
        });
    }

    async function displayMealDetails(meal) {
        hideAllSections();
        mealDetailSection.classList.remove('hidden');
        mealDetailSection.innerHTML = ''; // Clear previous details

        let ingredientsList = '';
        for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`]) {
                ingredientsList += `<span class="bg-blue-500 text-white text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}</span>`;
            } else {
                break;
            }
        }

        let tagsList = '';
        if (meal.strTags) {
            const tags = meal.strTags.split(',');
            tags.forEach(tag => {
                tagsList += `<span class="bg-green-500 text-white text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">${tag.trim()}</span>`;
            });
        }

        const detailHTML = `
            <div class="container mx-auto">
                <button id="closeDetailBtn" class="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 rounded-full p-2 z-10">
                    <i class="fas fa-times fa-lg"></i>
                </button>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="md:col-span-1">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full rounded-lg shadow-lg">
                    </div>
                    <div class="md:col-span-2">
                        <h2 class="text-4xl font-bold mb-4">${meal.strMeal}</h2>
                        <p class="text-gray-300 mb-6">${meal.strInstructions}</p>

                        <p class="text-2xl font-semibold mb-2">Area: <span class="font-normal">${meal.strArea}</span></p>
                        <p class="text-2xl font-semibold mb-2">Category: <span class="font-normal">${meal.strCategory}</span></p>

                        <h3 class="text-2xl font-semibold mt-6 mb-3">Recipes:</h3>
                        <div class="flex flex-wrap gap-2 mb-6">
                            ${ingredientsList}
                        </div>

                        ${tagsList ? `<h3 class="text-2xl font-semibold mt-6 mb-3">Tags:</h3><div class="flex flex-wrap gap-2 mb-6">${tagsList}</div>` : ''}

                        <div class="mt-8 space-x-4">
                            ${meal.strSource ? `<a href="${meal.strSource}" target="_blank" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300">Source</a>` : ''}
                            ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300">YouTube</a>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        mealDetailSection.innerHTML = detailHTML;

        document.getElementById('closeDetailBtn').addEventListener('click', () => {
            mealDetailSection.classList.add('hidden');
            showSection(mealGrid); // Go back to the meal grid
            fetchInitialMeals(); // Or whatever the previous view was
        });
    }

    function displayCategories(categories) {
        categoriesGrid.innerHTML = '';
        if (!categories) {
            categoriesGrid.innerHTML = `<p class="text-gray-400 text-center col-span-full">No categories found.</p>`;
            return;
        }
        categories.forEach(category => {
            const categoryItem = `
                <div class="category-item group relative rounded-lg overflow-hidden cursor-pointer p-4 bg-gray-800 hover:bg-gray-700 transition-all duration-300 text-center" data-category="${category.strCategory}">
                    <img src="${category.strCategoryThumb}" alt="${category.strCategory}" class="w-3/4 mx-auto mb-3 object-contain">
                    <h3 class="text-xl font-bold text-white mb-1">${category.strCategory}</h3>
                    <p class="text-sm text-gray-300 line-clamp-3">${(category.strCategoryDescription || '').substring(0,100)}...</p>
                </div>
            `;
            categoriesGrid.innerHTML += categoryItem;
        });

        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                fetchMealsByCategory(item.dataset.category);
                closeNav();
            });
        });
    }

    function displayAreas(areas) {
        areaGrid.innerHTML = '';
        if (!areas) {
            areaGrid.innerHTML = `<p class="text-gray-400 text-center col-span-full">No areas found.</p>`;
            return;
        }
        areas.forEach(area => {
            const areaItem = `
                <div class="area-item group flex flex-col items-center justify-center rounded-lg cursor-pointer p-4 bg-gray-800 hover:bg-gray-700 transition-all duration-300 text-center" data-area="${area.strArea}">
                    <i class="fas fa-map-marker-alt fa-3x text-red-500 mb-3"></i>
                    <h3 class="text-xl font-bold text-white">${area.strArea}</h3>
                </div>
            `;
            areaGrid.innerHTML += areaItem;
        });
         document.querySelectorAll('.area-item').forEach(item => {
            item.addEventListener('click', () => {
                fetchMealsByArea(item.dataset.area);
                closeNav();
            });
        });
    }

    function displayIngredients(ingredients) {
        ingredientsGrid.innerHTML = '';
        if (!ingredients) {
            ingredientsGrid.innerHTML = `<p class="text-gray-400 text-center col-span-full">No ingredients found.</p>`;
            return;
        }
        // The API returns a lot of ingredients, let's show a manageable number initially e.g., first 20
        ingredients.slice(0, 24).forEach(ingredient => {
            const ingredientItem = `
                <div class="ingredient-item group flex flex-col items-center justify-center rounded-lg cursor-pointer p-4 bg-gray-800 hover:bg-gray-700 transition-all duration-300 text-center" data-ingredient="${ingredient.strIngredient}">
                    <i class="fas fa-drumstick-bite fa-3x text-green-500 mb-3"></i>
                    <h3 class="text-xl font-bold text-white mb-1">${ingredient.strIngredient}</h3>
                    <p class="text-sm text-gray-300 line-clamp-3">${(ingredient.strDescription || '').substring(0, 100)}...</p>
                </div>
            `;
            ingredientsGrid.innerHTML += ingredientItem;
        });

        document.querySelectorAll('.ingredient-item').forEach(item => {
            item.addEventListener('click', () => {
                fetchMealsByIngredient(item.dataset.ingredient);
                closeNav();
            });
        });
    }


    // --- Fetch and Display Logic ---
    async function fetchInitialMeals() {
        showSection(mealGrid);
        const data = await fetchData('search.php?s='); // Fetch all meals initially (or a default set)
        if (data) displayMeals(data.meals);
    }

    async function searchMealsByName(name) {
        showSection(mealGrid);
        const data = await fetchData(`search.php?s=${name}`);
        displayMeals(data ? data.meals : null);
    }

    async function searchMealsByFirstLetter(letter) {
        showSection(mealGrid);
        const data = await fetchData(`search.php?f=${letter}`);
        displayMeals(data ? data.meals : null);
    }

    async function fetchMealDetails(mealId) {
        const data = await fetchData(`lookup.php?i=${mealId}`);
        if (data && data.meals) {
            displayMealDetails(data.meals[0]);
        }
    }

    async function fetchCategories() {
        const data = await fetchData('categories.php');
        if (data) displayCategories(data.categories);
    }

    async function fetchMealsByCategory(categoryName) {
        showSection(mealGrid);
        const data = await fetchData(`filter.php?c=${categoryName}`);
        if (data) displayMeals(data.meals);
    }

    async function fetchAreas() {
        const data = await fetchData('list.php?a=list');
        if (data) displayAreas(data.meals); // API uses 'meals' key for area list
    }
    async function fetchMealsByArea(areaName) {
        showSection(mealGrid);
        const data = await fetchData(`filter.php?a=${areaName}`);
        if (data) displayMeals(data.meals);
    }

    async function fetchIngredients() {
        const data = await fetchData('list.php?i=list');
        if (data) displayIngredients(data.meals); // API uses 'meals' key for ingredients list
    }
    async function fetchMealsByIngredient(ingredientName) {
        showSection(mealGrid);
        const data = await fetchData(`filter.php?i=${ingredientName}`);
        if (data) displayMeals(data.meals);
    }


    // --- Event Listeners ---
    navToggleBtn.addEventListener('click', () => {
        if (nav.style.left === '0px') {
            closeNav();
        } else {
            openNav();
        }
    });

    searchByNameInput.addEventListener('keyup', (e) => {
        searchMealsByName(e.target.value.trim());
    });

    searchByFirstLetterInput.addEventListener('keyup', (e) => {
        const letter = e.target.value.trim();
        if (letter.length === 1) {
            searchMealsByFirstLetter(letter);
        } else if (letter.length === 0) {
            fetchInitialMeals(); // Or clear results
        }
    });

    // Navigation Links
    navSearch.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(searchSection);
        mealGrid.innerHTML = ''; // Clear meal grid when search is shown initially
        searchByNameInput.value = '';
        searchByFirstLetterInput.value = '';
        fetchInitialMeals(); // Show all meals by default under search
        closeNav();
    });

    navCategories.addEventListener('click', async (e) => {
        e.preventDefault();
        showSection(categoriesSection);
        await fetchCategories();
        closeNav();
    });

    navArea.addEventListener('click', async (e) => {
        e.preventDefault();
        showSection(areaSection);
        await fetchAreas();
        closeNav();
    });

    navIngredients.addEventListener('click', async (e) => {
        e.preventDefault();
        showSection(ingredientsSection);
        await fetchIngredients();
        closeNav();
    });

    navContact.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(contactUsSection);
        closeNav();
    });

    // --- Initial Load ---
    fetchInitialMeals();
    closeNav(); // Ensure nav is closed on initial load

    // Close nav if clicking outside on mobile (optional)
    mainContent.addEventListener('click', () => {
        if (document.body.classList.contains('nav-open') && window.innerWidth < 768) {
             //closeNav(); // Be careful with this, might interfere with clicks on content
        }
    });

    // Basic Form Validation Example for Contact Form (add more robust validation as needed)
    const contactForm = document.querySelector('#contactUsSection form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Basic validation - you'll want more comprehensive regex based validation
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            // ... get other fields

            if (!name || !email /* || other checks */) {
                alert('Please fill in all required fields correctly.');
                return;
            }
            alert('Form submitted (simulation)!');
            contactForm.reset();
        });
    }

});