document.addEventListener('DOMContentLoaded', () => {

    // --- Existing Non-Quiz JS ---
    // (Keep smooth scroll, footer year, mobile menu, Swiper init, observer here)
    // Example: Initialize Swiper first
    if (typeof Swiper !== 'undefined') {
        // ... Swiper initialization code ...
    } else {
        console.warn("Swiper library not found...");
    }

    // --- Pet Readiness Quiz Logic ---

    // 1. Quiz Data (Shortened & Simplified Example - Use your full spreadsheet!)
    // IMPORTANT: Replace this with data structured from your full spreadsheet
    const quizData = [
        { id: 'Q1', category: 'Emotional Readiness', text: 'When faced with unexpected challenges, you typically:', options: [ { text: 'Handle them calmly', points: 4 }, { text: 'Feel stressed but work through it', points: 3 }, { text: 'Get overwhelmed easily', points: 2 }, { text: 'Depend on others', points: 1 } ] },
        { id: 'Q2', category: 'Emotional Readiness', text: 'How would you describe your patience level?', options: [ { text: 'Extremely patient', points: 4 }, { text: 'Generally patient', points: 3 }, { text: 'Limited patience', points: 2 }, { text: 'Get irritated quickly', points: 1 } ] },
        { id: 'Q3', category: 'Emotional Readiness', text: 'How do you feel about a 10-15 year commitment?', options: [ { text: 'Excited and prepared', points: 4 }, { text: 'Comfortable', points: 3 }, { text: 'Uncertain', points: 2 }, { text: 'Prefer shorter', points: 1 } ] },
        { id: 'Q4', category: 'Emotional Readiness', text: 'When belongings get damaged:', options: [ { text: 'Understand and remain calm', points: 4 }, { text: 'Annoyed but constructive', points: 3 }, { text: 'Quite upset', points: 2 }, { text: 'Major issue', points: 1 } ] },
        { id: 'Q5', category: 'Financial Stability', text: 'Prepared for unexpected expenses ($500-$2000+)?', options: [ { text: 'Have specific savings', points: 4 }, { text: 'Could manage in budget', points: 3 }, { text: 'Need credit/payment plans', points: 2 }, { text: 'Significant strain', points: 1 } ] },
        // ... ADD ALL 20 QUESTIONS from your spreadsheet here!
        // TEMPORARY - Add a few more for testing pagination
         { id: 'Q6', category: 'Financial Stability', text: 'What monthly pet budget?', options: [ { text: '$200+', points: 4 }, { text: '$100-200', points: 3 }, { text: '$50-100', points: 2 }, { text: 'Under $50', points: 1 } ] },
         { id: 'Q7', category: 'Financial Stability', text: 'How handle routine vet costs?', options: [ { text: 'Easily afford comprehensive', points: 4 }, { text: 'Budget for annual', points: 3 }, { text: 'Essential only', points: 2 }, { text: 'Significant concern', points: 1 } ] },
         { id: 'Q8', category: 'Lifestyle Compatibility', text: 'Hours home empty per day?', options: [ { text: '< 4 hours', points: 4 }, { text: '4-8 hours', points: 3 }, { text: '8-10 hours', points: 2 }, { text: '> 10 hours', points: 1 } ] },
         { id: 'Q9', category: 'Lifestyle Compatibility', text: 'How often travel overnight?', options: [ { text: 'Rarely', points: 4 }, { text: 'Occasionally', points: 3 }, { text: 'Frequently', points: 2 }, { text: 'Very frequently', points: 1 } ] },
         { id: 'Q10', category: 'Lifestyle Compatibility', text: 'Your activity level?', options: [ { text: 'Very active', points: 4 }, { text: 'Moderately active', points: 3 }, { text: 'Somewhat active', points: 2 }, { text: 'Mostly sedentary', points: 1 } ] },
    ]; // Ensure this array has all your questions!

    const categoryWeights = { // From your spreadsheet
        "Emotional Readiness": 0.25,
        "Financial Stability": 0.20,
        "Lifestyle Compatibility": 0.20,
        "Living Situation": 0.15, // Add questions for these categories!
        "Time Commitment": 0.15, // Add questions for these categories!
        "Experience & Preferences": 0.05 // Add questions for these categories!
    };

    // 2. DOM Element References
    const quizIntro = document.getElementById('quiz-intro');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const quizContainer = document.getElementById('quiz-container');
    const progressBar = document.getElementById('quiz-progress-bar');
    const progressText = document.getElementById('quiz-progress-text');
    const questionTextArea = document.getElementById('quiz-question-area'); // Parent div
    const questionTextEl = document.getElementById('question-text');
    const answerOptionsEl = document.getElementById('answer-options');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const quizResultsContainer = document.getElementById('quiz-results');
    const resultsScoreDisplay = document.getElementById('results-score-display');
    const resultsLevelText = document.getElementById('results-level-text');
    const resultsSummaryText = document.getElementById('results-summary-text');
    const retakeQuizBtn = document.getElementById('retake-quiz-btn');
    const validationMessage = document.getElementById('quiz-validation');

    // 3. Quiz State
    let currentQuestionIndex = 0;
    let userAnswers = {}; // Store as { Q1: points, Q2: points, ... }

    // 4. Event Listeners
    startQuizBtn?.addEventListener('click', startQuiz);
    nextBtn?.addEventListener('click', handleNext);
    prevBtn?.addEventListener('click', handlePrevious);
    submitBtn?.addEventListener('click', handleSubmit);
    retakeQuizBtn?.addEventListener('click', startQuiz); // Retake just restarts

    // 5. Functions
    function startQuiz() {
        currentQuestionIndex = 0;
        userAnswers = {};
        quizIntro.style.display = 'none';
        quizResultsContainer.style.display = 'none';
        quizContainer.style.display = 'block';
        validationMessage.style.display = 'none'; // Hide validation on start/restart
        displayQuestion(currentQuestionIndex);
    }

    function displayQuestion(index) {
        if (index < 0 || index >= quizData.length) return; // Safety check

        const question = quizData[index];
        questionTextEl.textContent = question.text;
        answerOptionsEl.innerHTML = ''; // Clear previous options

        question.options.forEach((option, optionIndex) => {
            const li = document.createElement('li'); // Using li for semantic structure
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `q${question.id}`; // Group radios for the same question
            input.value = option.points;
            input.id = `q${question.id}_opt${optionIndex}`;
            input.dataset.optionText = option.text; // Store text if needed later

            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.textContent = option.text;

            // Check if this answer was previously selected
            if (userAnswers[question.id] === option.points) {
                input.checked = true;
            }

            input.addEventListener('change', () => { // Record answer immediately on change
                 userAnswers[question.id] = parseInt(input.value); // Store points
                 validationMessage.style.display = 'none'; // Hide validation message when selection is made
            });

            label.prepend(input); // Put radio button inside label
            li.appendChild(label);
            answerOptionsEl.appendChild(li);
        });

        updateProgress(index);
        updateNavigation(index);
    }

    function updateProgress(index) {
        const progressPercent = ((index + 1) / quizData.length) * 100;
        progressBar.style.width = `${progressPercent}%`;
        progressText.textContent = `Question ${index + 1} / ${quizData.length}`;
    }

    function updateNavigation(index) {
        prevBtn.style.visibility = (index === 0) ? 'hidden' : 'visible';
        nextBtn.style.display = (index === quizData.length - 1) ? 'none' : 'inline-block';
        submitBtn.style.display = (index === quizData.length - 1) ? 'inline-block' : 'none';
    }

    function handleNext() {
         // Validation: Check if an answer is selected for the current question
        if (userAnswers[quizData[currentQuestionIndex].id] === undefined) {
             validationMessage.style.display = 'block'; // Show validation message
            return; // Stop proceeding
        }
         validationMessage.style.display = 'none'; // Hide if validation passes

        if (currentQuestionIndex < quizData.length - 1) {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        }
        // If it's the last question, the 'Submit' button handles the final action
    }

    function handlePrevious() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex);
            validationMessage.style.display = 'none'; // Hide validation when going back
        }
    }

     function handleSubmit() {
         // Final validation check for the last question
        if (userAnswers[quizData[currentQuestionIndex].id] === undefined) {
             validationMessage.style.display = 'block';
             return;
        }
         validationMessage.style.display = 'none';

         showResults();
     }


    function calculateScores() {
        let categoryPoints = {};
        let categoryCounts = {};
        let finalWeightedScore = 0;

        // Initialize categories
        Object.keys(categoryWeights).forEach(cat => {
            categoryPoints[cat] = 0;
            categoryCounts[cat] = 0;
        });

        // Tally points and counts per category
        quizData.forEach(question => {
            const points = userAnswers[question.id] || 0; // Default to 0 if unanswered (shouldn't happen with validation)
            const category = question.category;
            if (categoryWeights.hasOwnProperty(category)) { // Check if category is valid
                 categoryPoints[category] += points;
                 categoryCounts[category]++;
            }
        });

         // Calculate weighted score (Simplified: Directly use points, max potential score varies based on question count per category)
         // More accurate approach matching spreadsheet:
         Object.keys(categoryWeights).forEach(category => {
             const count = categoryCounts[category];
             if (count > 0) {
                 const totalPointsInCategory = categoryPoints[category];
                 const maxPossiblePointsInCategory = count * 4; // Each question max 4 points
                 const categoryScoreNormalized = (totalPointsInCategory / maxPossiblePointsInCategory) * 100; // Score 0-100 for the category
                 finalWeightedScore += categoryScoreNormalized * categoryWeights[category];
             }
         });


        return Math.round(finalWeightedScore); // Return rounded final score
    }

    function showResults() {
        const finalScore = calculateScores();

        // Determine Readiness Level (Based on Spreadsheet)
        let level = '';
        let summary = '';
        if (finalScore >= 90) {
            level = "Pet Ready!";
            summary = "You're exceptionally prepared! You demonstrate strong readiness across key areas for successful pet ownership.";
            resultsScoreDisplay.style.color = 'var(--accent-green)'; // Example: Green for high score
        } else if (finalScore >= 75) {
            level = "Nearly There";
            summary = "You're close! With minor adjustments in specific areas, you'll be well-prepared for a pet.";
             resultsScoreDisplay.style.color = '#E6BF00'; // Example: Yellow/Gold for medium-high score
        } else if (finalScore >= 50) {
            level = "Preparing for Pets";
            summary = "Consider addressing some key areas. While you have strengths, focusing on improvement will ensure a better experience for you and your future pet.";
            resultsScoreDisplay.style.color = 'var(--secondary-orange)'; // Example: Orange for medium-low score
        } else {
            level = "Future Pet Parent";
            summary = "We recommend waiting and preparing further. Your current situation might make pet ownership challenging, but you can work towards readiness!";
            resultsScoreDisplay.style.color = '#d9534f'; // Example: Red for low score
        }

        // Display Results
        resultsScoreDisplay.textContent = `${finalScore}%`;
        resultsLevelText.textContent = level;
        resultsSummaryText.textContent = summary;

        quizContainer.style.display = 'none';
        quizResultsContainer.style.display = 'block';
    }

     // Ensure quiz doesn't run if essential elements aren't found
     if (!quizIntro || !startQuizBtn || !quizContainer || !quizResultsContainer) {
         console.error("Quiz essential HTML elements not found. Quiz cannot initialize.");
     }


    // --- Add other existing JS code (observer, etc.) if it was separate ---

// (Remove this redundant closing tag)

    // --- Update Footer Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Intersection Observer for Scroll Animations ---
    const animatedElements = document.querySelectorAll('.step, .feature-item'); // Add more selectors as needed

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                // entry.target.classList.add('visible'); // Alternative: Add a class
                observer.unobserve(entry.target); // Optional: stop observing once visible
            }
        });
    }, { threshold: 0.1 }); // Trigger when 10% visible

    animatedElements.forEach(el => {
        // Initial state for animation
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        // el.classList.add('hidden'); // Alternative class-based approach
        observer.observe(el);
    });

    // --- Mobile Menu Toggle --- (Basic Example)
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links'); // Adjust selector if menu structure differs
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active'); // You'll need CSS for the .active state (e.g., display: block)
        });
    }

// --- Testimonial Carousel (Swiper.js Initialization) ---
if (typeof Swiper !== 'undefined') { // Check if Swiper object exists
    const swiper = new Swiper('.testimonial-carousel', { // <--- ACTUAL INITIALIZATION IS HERE
        // Optional parameters
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        slidesPerView: 1,
        spaceBetween: 30,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        a11y: {
            prevSlideMessage: 'Previous testimonial',
            nextSlideMessage: 'Next testimonial',
        },
    });
    // Make sure HTML elements for pagination/navigation exist if used
} else {
    console.warn("Swiper library not found. Carousel will not be initialized."); // <--- THIS should show if CDN links are missing
    // Fallback styling if needed...
}

    // Loading Animation Control
    const loader = document.querySelector('.loading-spinner');
    loader.classList.add('active');

    window.addEventListener('load', () => {
        loader.classList.remove('active');
        document.body.classList.add('loaded');
    });

    // Enhanced Scroll Animations
    const fadeElements = document.querySelectorAll('.fade-in');
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    fadeElements.forEach(element => {
        appearOnScroll.observe(element);
    });

    // Smooth Scroll Implementation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Pet Profiles Functionality
    const addPetBtn = document.getElementById('add-pet-btn');
    const addPetModal = document.getElementById('add-pet-modal');
    const closeModal = document.querySelector('.close-modal');
    const addPetForm = document.getElementById('add-pet-form');
    const profilesContainer = document.getElementById('pet-profiles-container');
    const profileSearch = document.getElementById('profile-search');

    // Local Storage for Pet Profiles
    let petProfiles = JSON.parse(localStorage.getItem('petProfiles')) || [];

    // Show/Hide Modal
    addPetBtn?.addEventListener('click', () => {
        addPetModal.classList.add('active');
    });

    closeModal?.addEventListener('click', () => {
        addPetModal.classList.remove('active');
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addPetModal) {
            addPetModal.classList.remove('active');
        }
    });

    // Handle Form Submission
    addPetForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const imageFile = document.getElementById('pet-image').files[0];
        
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const newPet = {
                    id: Date.now(),
                    name: document.getElementById('pet-name').value,
                    type: document.getElementById('pet-type').value,
                    breed: document.getElementById('pet-breed').value,
                    age: document.getElementById('pet-age').value,
                    image: event.target.result // Store image as Base64 string
                };

                petProfiles.push(newPet);
                localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
                
                renderPetProfiles();
                addPetForm.reset();
                addPetModal.classList.remove('active');
            };
            reader.readAsDataURL(imageFile);
        } else {
            const newPet = {
                id: Date.now(),
                name: document.getElementById('pet-name').value,
                type: document.getElementById('pet-type').value,
                breed: document.getElementById('pet-breed').value,
                age: document.getElementById('pet-age').value,
                image: 'default-pet.png'
            };

            petProfiles.push(newPet);
            localStorage.setItem('petProfiles', JSON.stringify(petProfiles));
            
            renderPetProfiles();
            addPetForm.reset();
            addPetModal.classList.remove('active');
        }
    });

    // Search Functionality
    profileSearch?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProfiles = petProfiles.filter(pet => 
            pet.name.toLowerCase().includes(searchTerm) ||
            pet.breed.toLowerCase().includes(searchTerm) ||
            pet.type.toLowerCase().includes(searchTerm)
        );
        renderPetProfiles(filteredProfiles);
    });

    // Render Pet Profiles
    function renderPetProfiles(profiles = petProfiles) {
        if (!profilesContainer) return;

        profilesContainer.innerHTML = profiles.map(pet => `
            <div class="pet-profile-card" data-id="${pet.id}">
                <div class="profile-image-container">
                    <img src="${pet.image}" alt="${pet.name}" class="pet-image">
                    <button class="edit-image-btn" onclick="editPetImage(${pet.id})">
                        <i class="fas fa-camera"></i>
                    </button>
                </div>
                <div class="profile-info">
                    <h3>${pet.name}</h3>
                    <p class="pet-details">${pet.type} • ${pet.breed} • ${pet.age} years old</p>
                </div>
                <div class="profile-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editPetProfile(${pet.id})">
                        Edit Profile
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Initial render of pet profiles
    renderPetProfiles();

    // Gallery Functionality
    const galleryFilters = document.querySelector('.gallery-filters');
    const galleryGrid = document.getElementById('gallery-container');

    // Filter gallery items
    galleryFilters?.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(btn => 
                btn.classList.remove('active')
            );
            
            // Add active class to clicked button
            e.target.classList.add('active');
            
            const filter = e.target.dataset.filter;
            
            // Filter gallery items
            document.querySelectorAll('.gallery-item').forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        }
    });

    // Gallery Image Modal
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('img').src;
            const title = item.querySelector('h4').textContent;
            const description = item.querySelector('p').textContent;
            
            showGalleryModal(imgSrc, title, description);
        });
    });

    function showGalleryModal(imgSrc, title, description) {
        const modal = document.createElement('div');
        modal.classList.add('modal', 'gallery-modal', 'active');
        
        modal.innerHTML = `
            <div class="modal-content gallery-modal-content">
                <span class="close-modal">&times;</span>
                <img src="${imgSrc}" alt="${title}">
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Pet Costs Calculator
    const costToggles = document.querySelectorAll('.cost-toggle');
    const calculatorForm = document.getElementById('cost-calculator-form');
    const calculatorResult = document.getElementById('calculator-result');

    // Cost data for different pet types
    const petCosts = {
        dog: {
            food: {
                basic: 40,
                premium: 60,
                'super-premium': 80
            },
            grooming: {
                minimal: 20,
                moderate: 40,
                high: 80
            },
            insurance: {
                none: 0,
                basic: 30,
                comprehensive: 60
            }
        },
        cat: {
            food: {
                basic: 25,
                premium: 40,
                'super-premium': 55
            },
            grooming: {
                minimal: 10,
                moderate: 25,
                high: 40
            },
            insurance: {
                none: 0,
                basic: 20,
                comprehensive: 40
            }
        },
        'small-pet': {
            food: {
                basic: 15,
                premium: 25,
                'super-premium': 35
            },
            grooming: {
                minimal: 5,
                moderate: 15,
                high: 25
            },
            insurance: {
                none: 0,
                basic: 15,
                comprehensive: 25
            }
        }
    };

    // Update costs when pet type is changed
    costToggles?.forEach(toggle => {
        toggle.addEventListener('click', () => {
            // Remove active class from all toggles
            costToggles.forEach(t => t.classList.remove('active'));
            // Add active class to clicked toggle
            toggle.classList.add('active');
            
            // Update costs based on pet type
            const petType = toggle.dataset.pet;
            updateCostDisplay(petType);
        });
    });

    // Calculate costs based on form inputs
    calculatorForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const petType = document.getElementById('pet-type').value;
        const foodQuality = document.getElementById('food-quality').value;
        const grooming = document.getElementById('grooming').value;
        const insurance = document.getElementById('insurance').value;
        
        const costs = petCosts[petType];
        const totalCost = 
            costs.food[foodQuality] +
            costs.grooming[grooming] +
            costs.insurance[insurance];
        
        // Add additional costs (toys, supplies, etc.)
        const additionalCosts = {
            dog: 30,
            cat: 20,
            'small-pet': 10
        };
        
        const grandTotal = totalCost + additionalCosts[petType];
        
        // Update result display with animation
        const estimatedCost = calculatorResult.querySelector('.estimated-cost');
        animateNumber(estimatedCost, grandTotal);
    });

    // Animate number counting up
    function animateNumber(element, final) {
        const duration = 1000; // Animation duration in milliseconds
        const start = parseInt(element.textContent.replace(/\D/g, '')) || 0;
        const step = (final - start) / (duration / 16); // 60fps
        let current = start;
        
        const animate = () => {
            current += step;
            if ((step > 0 && current >= final) || (step < 0 && current <= final)) {
                element.textContent = `$${Math.round(final)}`;
                return;
            }
            element.textContent = `$${Math.round(current)}`;
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // Update cost display based on pet type
    function updateCostDisplay(petType) {
        const costData = {
            dog: {
                initial: {
                    'Adoption/Purchase': '$50 - $500+',
                    'Initial Medical Exam': '$70 - $130',
                    'Spaying/Neutering': '$200 - $800',
                    'Initial Vaccinations': '$75 - $100',
                    'Supplies': '$200 - $500'
                },
                monthly: {
                    'Food': '$40 - $60',
                    'Treats & Chews': '$10 - $50',
                    'Waste Bags': '$10 - $25',
                    'Toys & Enrichment': '$10 - $30',
                    'Pet Insurance': '$20 - $60'
                },
                annual: {
                    'Regular Vet Checkups': '$200 - $400',
                    'Vaccinations': '$100 - $200',
                    'Dental Care': '$200 - $400',
                    'Grooming': '$30 - $90',
                    'Emergency Fund': '$400 - $1000'
                }
            },
            cat: {
                initial: {
                    'Adoption/Purchase': '$30 - $300+',
                    'Initial Medical Exam': '$50 - $100',
                    'Spaying/Neutering': '$150 - $500',
                    'Initial Vaccinations': '$60 - $80',
                    'Supplies': '$150 - $400'
                },
                monthly: {
                    'Food': '$25 - $45',
                    'Treats': '$5 - $20',
                    'Litter': '$15 - $30',
                    'Toys & Enrichment': '$10 - $25',
                    'Pet Insurance': '$15 - $40'
                },
                annual: {
                    'Regular Vet Checkups': '$150 - $300',
                    'Vaccinations': '$80 - $150',
                    'Dental Care': '$150 - $300',
                    'Grooming': '$20 - $50',
                    'Emergency Fund': '$300 - $800'
                }
            },
            'small-pet': {
                initial: {
                    'Purchase': '$20 - $150+',
                    'Initial Medical Exam': '$30 - $70',
                    'Supplies & Habitat': '$100 - $300',
                    'Initial Health Check': '$40 - $60',
                    'Basic Equipment': '$50 - $150'
                },
                monthly: {
                    'Food': '$15 - $30',
                    'Bedding': '$10 - $20',
                    'Treats': '$5 - $15',
                    'Toys': '$5 - $15',
                    'Health Care': '$10 - $25'
                },
                annual: {
                    'Vet Checkups': '$100 - $200',
                    'Health Supplies': '$50 - $100',
                    'Habitat Maintenance': '$50 - $100',
                    'Grooming': '$20 - $40',
                    'Emergency Fund': '$200 - $500'
                }
            }
        };

        // Update each cost section
        Object.keys(costData[petType]).forEach(section => {
            const sectionElement = document.getElementById(`${section}-costs`);
            if (!sectionElement) return;

            const items = Object.entries(costData[petType][section]);
            const itemsHtml = items.map(([name, cost]) => `
                <div class="cost-item">
                    <span>${name}</span>
                    <span class="price">${cost}</span>
                </div>
            `).join('');

            sectionElement.innerHTML = itemsHtml;
        });
    }

    // Add paw prints container to hero section
    const hero = document.querySelector('.hero');
    const pawPrints = document.createElement('div');
    pawPrints.className = 'paw-prints';
    hero.appendChild(pawPrints);

    // Create animated paw prints
    function createPawPrint() {
        const paw = document.createElement('div');
        paw.className = 'paw-print';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random movement
        const translateX = (Math.random() - 0.5) * 200;
        const translateY = (Math.random() - 0.5) * 200;
        const rotation = (Math.random() - 0.5) * 90;
        
        paw.style.setProperty('--translate-x', `${translateX}px`);
        paw.style.setProperty('--translate-y', `${translateY}px`);
        paw.style.setProperty('--rotation', `${rotation}deg`);
        
        paw.style.left = `${x}%`;
        paw.style.top = `${y}%`;
        
        pawPrints.appendChild(paw);
        
        // Remove paw print after animation
        setTimeout(() => {
            paw.remove();
        }, 3000);
    }

    // Create paw prints periodically
    setInterval(createPawPrint, 300);

    // Parallax effect for hero image
    const heroImage = document.querySelector('.hero-image img');
    
    if (heroImage) {
        window.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            
            const xOffset = (clientX / innerWidth - 0.5) * 20;
            const yOffset = (clientY / innerHeight - 0.5) * 20;
            
            heroImage.style.transform = `
                translate(${xOffset}px, ${yOffset}px)
                rotate(${xOffset * 0.2}deg)
            `;
        });
        
        // Reset transform on mouse leave
        hero.addEventListener('mouseleave', () => {
            heroImage.style.transform = 'translate(0, 0) rotate(0deg)';
        });
    }

    // Add RGB values for primary blue to CSS variables
    const root = document.documentElement;
    const primaryBlue = getComputedStyle(root).getPropertyValue('--primary-blue').trim();
    
    // Convert hex to RGB if necessary
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '74, 144, 226'; // Fallback RGB values
    }
    
    root.style.setProperty('--primary-blue-rgb', hexToRgb(primaryBlue));

}); // End DOMContentLoaded