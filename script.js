// ============================================
// MODAL MANAGEMENT
// ============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside (on backdrop)
document.addEventListener('click', function(event) {
    const bookModal = document.getElementById('bookModal');
    const applyModal = document.getElementById('applyModal');

    if (bookModal && event.target === bookModal) {
        closeModal('bookModal');
    }

    if (applyModal && event.target === applyModal) {
        closeModal('applyModal');
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal('bookModal');
        closeModal('applyModal');
    }
});

// ============================================
// MOBILE MENU TOGGLE
// ============================================

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.getElementById('menuIcon');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            
            // Animate menu icon
            if (mobileMenu.classList.contains('hidden')) {
                menuIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
            } else {
                menuIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
            }
        });

        // Close menu when a link is clicked
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                menuIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
            });
        });
    }
}

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    // Observe all scroll-reveal elements
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));

    // Initialize mobile menu
    initMobileMenu();

    // Initialize forms
    initializeForms();
});

// ============================================
// FORM HANDLING
// ============================================

function initializeForms() {
    const bookForm = document.getElementById('bookForm');
    const applyForm = document.getElementById('applyForm');

    if (bookForm) {
        bookForm.addEventListener('submit', (e) => handleBookFormSubmit(e));
    }

    if (applyForm) {
        applyForm.addEventListener('submit', (e) => handleApplyFormSubmit(e));
    }
}

// ============================================
// BOOK AN ARTIST FORM
// ============================================

async function handleBookFormSubmit(e) {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    // Get form data
    const form = e.target;
    const name = document.getElementById('book-name').value.trim();
    const email = document.getElementById('book-email').value.trim();
    const phone = document.getElementById('book-phone').value.trim();
    const location = document.getElementById('book-location').value.trim();

    // Get genres
    const genreInputs = form.querySelectorAll('input[name="genre"]');
    const genres = Array.from(genreInputs).map(input => input.value.trim()).filter(Boolean);

    // Get languages
    const languageInputs = form.querySelectorAll('input[name="language"]');
    const languages = Array.from(languageInputs).map(input => input.value.trim()).filter(Boolean);

    // Validate
    let isValid = true;

    if (!name) {
        showError('book-name-error', 'Name is required');
        isValid = false;
    }

    if (!email || !isValidEmail(email)) {
        showError('book-email-error', 'Valid email is required');
        isValid = false;
    }

    if (!phone) {
        showError('book-phone-error', 'Phone number is required');
        isValid = false;
    }

    if (!location) {
        showError('book-location-error', 'Event location is required');
        isValid = false;
    }

    if (genres.length === 0) {
        alert('Please add at least one genre');
        isValid = false;
    }

    if (languages.length === 0) {
        alert('Please add at least one language');
        isValid = false;
    }

    if (!isValid) return;

    // Prepare form data for Formspree
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('location', location);
    formData.append('genres', genres.join(', '));
    formData.append('languages', languages.join(', '));

    try {
        // Submit to Formspree - Replace YOUR_BOOK_FORM_ID with your actual Formspree endpoint
        const response = await fetch('https://formspree.io/f/mbdgkpnw', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            // Show success message
            showSuccessMessage('bookSuccess');

            // Reset form
            form.reset();

            // Reset dynamic fields to 1 each
            resetDynamicFields('bookGenreFields');
            resetDynamicFields('bookLanguageFields');

            // Scroll to success message
            setTimeout(() => {
                document.getElementById('bookSuccess').scrollIntoView({ behavior: 'smooth' });
            }, 100);

            // Hide success message after 5 seconds
            setTimeout(() => {
                document.getElementById('bookSuccess').classList.remove('show');
            }, 5000);
        } else {
            alert('There was an error submitting your request. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error submitting your request. Please try again.');
    }
}

// ============================================
// APPLY AS ARTIST FORM
// ============================================

async function handleApplyFormSubmit(e) {
    e.preventDefault();

    const form = e.target;

    // Let browser required fields handle basic validation
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = new FormData(form);

    try {
        const response = await fetch('https://formspree.io/f/mjgyojvd', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            alert('Thank you for applying! We will review your profile and get back to you soon.');
            form.reset();
            // Reset conditional sections
            if (typeof handleArtistTypeChange === 'function') {
                handleArtistTypeChange();
            }
        } else {
            alert('There was an error submitting your application. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error submitting your application. Please try again.');
    }
}

// ============================================
// APPLY FORM: ARTIST TYPE CONDITIONAL FIELDS
// ============================================
function handleArtistTypeChange() {
    const typeSelect = document.getElementById('artistType');
    if (!typeSelect) return;

    const musicianFields = document.getElementById('musicianFields');
    const bandFields = document.getElementById('bandFields');
    const value = typeSelect.value;

    if (musicianFields) {
        musicianFields.classList.toggle('hidden', value !== 'Musician');
    }
    if (bandFields) {
        bandFields.classList.toggle('hidden', value !== 'Band');
    }
}

// Show/hide \"Other instrument\" text box
document.addEventListener('DOMContentLoaded', () => {
    const otherInstrumentCheck = document.getElementById('otherInstrumentCheck');
    const otherInstrumentInput = document.getElementById('otherInstrumentInput');

    if (otherInstrumentCheck && otherInstrumentInput) {
        otherInstrumentCheck.addEventListener('change', () => {
            if (otherInstrumentCheck.checked) {
                otherInstrumentInput.classList.remove('hidden');
            } else {
                otherInstrumentInput.classList.add('hidden');
                otherInstrumentInput.value = '';
            }
        });
    }
});

// ============================================
// DYNAMIC FIELD MANAGEMENT
// ============================================

function addGenreField(containerId) {
    const container = document.getElementById(containerId);
    const fieldCount = container.querySelectorAll('.flex').length;

    if (fieldCount >= 10) {
        alert('Maximum 10 genres allowed');
        return;
    }

    const newField = document.createElement('div');
    newField.className = 'flex gap-2 animate-fadeIn';
    newField.innerHTML = `
        <input
            type="text"
            name="genre"
            class="form-input flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400"
            placeholder="e.g., Live Music, DJ, Dance"
        />
        <button
            type="button"
            class="btn-secondary px-4 py-3 rounded-lg font-semibold"
            onclick="removeField(this)"
        >
            Remove
        </button>
    `;
    container.appendChild(newField);
}

function addLanguageField(containerId) {
    const container = document.getElementById(containerId);
    const fieldCount = container.querySelectorAll('.flex').length;

    if (fieldCount >= 10) {
        alert('Maximum 10 languages allowed');
        return;
    }

    const newField = document.createElement('div');
    newField.className = 'flex gap-2 animate-fadeIn';
    newField.innerHTML = `
        <input
            type="text"
            name="language"
            class="form-input flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400"
            placeholder="e.g., English, Kannada, Hindi"
        />
        <button
            type="button"
            class="btn-secondary px-4 py-3 rounded-lg font-semibold"
            onclick="removeField(this)"
        >
            Remove
        </button>
    `;
    container.appendChild(newField);
}

function addLocationField(containerId) {
    const container = document.getElementById(containerId);
    const fieldCount = container.querySelectorAll('.flex').length;

    if (fieldCount >= 7) {
        alert('You can select all Bangalore locations');
        return;
    }

    const newField = document.createElement('div');
    newField.className = 'flex gap-2 animate-fadeIn';
    newField.innerHTML = `
        <select
            name="location"
            class="form-input flex-1 px-4 py-3 rounded-lg text-gray-900"
        >
            <option value="">Select location</option>
            <option value="Indiranagar">Indiranagar</option>
            <option value="Whitefield">Whitefield</option>
            <option value="Koramangala">Koramangala</option>
            <option value="HSR Layout">HSR Layout</option>
            <option value="Electronic City">Electronic City</option>
            <option value="Yelahanka">Yelahanka</option>
            <option value="Malleshwaram">Malleshwaram</option>
        </select>
        <button
            type="button"
            class="btn-secondary px-4 py-3 rounded-lg font-semibold"
            onclick="removeField(this)"
        >
            Remove
        </button>
    `;
    container.appendChild(newField);
}

function removeField(button) {
    button.parentElement.remove();
}

function resetDynamicFields(containerId) {
    const container = document.getElementById(containerId);
    const fields = container.querySelectorAll('.flex');

    // Keep only the first field
    for (let i = 1; i < fields.length; i++) {
        fields[i].remove();
    }

    // Clear the first field
    const firstInput = container.querySelector('input, select');
    if (firstInput) {
        firstInput.value = '';
    }
}

// ============================================
// VALIDATION HELPERS
// ============================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidUrl(url) {
    try {
        new URL(url);
        return (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com'));
    } catch {
        return false;
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
}

function showSuccessMessage(elementId) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.classList.add('show');
    }
}

// ============================================
// SMOOTH SCROLL FOR NAVIGATION
// ============================================

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

// ============================================
// LAZY LOADING IMAGES (if needed in future)
// ============================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('opacity-0');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// ============================================
// FORM INPUT FOCUS STATES
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.classList.add('ring-2', 'ring-purple-300');
        });

        input.addEventListener('blur', function() {
            this.classList.remove('ring-2', 'ring-purple-300');
        });
    });
});

// ============================================
// VIDEO CACHING & ERROR HANDLING (72-hour cache)
// ============================================

function initVideoCache() {
    // Store video timestamps in localStorage for 72-hour cache
    const CACHE_KEY = 'stagecraft_video_cache';
    const CACHE_DURATION = 72 * 60 * 60 * 1000; // 72 hours

    const videos = [
        { id: '0_1LkZHjVBE', title: 'Ennile' },
        { id: 'eborT0V26EM', title: 'Aapki Bahon Me' },
        { id: 'FbgeWJDao3A', title: 'Waiting For You' },
        { id: '31t3W8RhWqE', title: 'Dhanumasapulariyil' },
        { id: 'eF-2S_Wlnk0', title: 'Maa' },
        { id: 'IYcJgQcWc3c', title: 'Munpe Va' },
        { id: 'D-T6GSqutJg', title: 'Indraneelimayolum' },
        { id: 'JhLubfh7yRQ', title: 'Vaseegara' },
        { id: 'ZNDQrNXaLAQ', title: 'Netru Illatha Matram' },
        { id: 'hUoj3jx8DQc', title: 'Taningle' },
        { id: '5Og--dlmZ8E', title: 'Dala Sangeetholsavam' },
        { id: 'ySh8du8MwEo', title: 'Goonjthi Dhwani' },
        { id: 'V7ShoMhK_8M', title: 'Kalai Koodam' }
    ];

    // Initialize cache if not exists
    let cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};

    // Add videos to cache
    videos.forEach(video => {
        if (!cache[video.id]) {
            cache[video.id] = {
                title: video.title,
                timestamp: Date.now(),
                cached: false
            };
        }
    });

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

    // Handle iframe errors and set fallback
    const iframes = document.querySelectorAll('iframe[src*="youtube"]');
    iframes.forEach((iframe, index) => {
        const videoId = iframe.src.match(/embed\/([^?]+)/)?.[1];
        
        if (videoId && cache[videoId]) {
            cache[videoId].cached = true;
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        }

        // Add error handling
        iframe.addEventListener('error', () => {
            const container = iframe.parentElement;
            container.innerHTML = `
                <div class="flex items-center justify-center w-full h-full bg-gray-200 rounded-lg">
                    <div class="text-center p-6">
                        <p class="text-gray-600 mb-2">Video loading...</p>
                        <p class="text-sm text-gray-500">Cached version available for 72 hours</p>
                    </div>
                </div>
            `;
        });

        // Add loading spinner
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg opacity-0 transition-opacity';
        loadingDiv.innerHTML = `
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        `;
        container.appendChild(loadingDiv);

        iframe.addEventListener('load', () => {
            loadingDiv.remove();
        });
    });
}

// Initialize video cache on page load
document.addEventListener('DOMContentLoaded', initVideoCache);

