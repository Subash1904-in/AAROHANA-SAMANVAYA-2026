// Wait for the HTML document to be fully loaded before running any script
document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle Functionality ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-navigation');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => mainNav.classList.toggle('active'));
    } else {
        if (!menuToggle) console.error('Error: Menu toggle button (.menu-toggle) not found.');
        if (!mainNav) console.error('Error: Main navigation element (.main-navigation) not found.');
    }

    // Close mobile menu on link click and scroll (if mobile)
    const navLinks = document.querySelectorAll('.main-navigation a');
    if (navLinks && mainNav) {
        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                const isExternal = link.getAttribute('target') === '_blank';
                const href = link.getAttribute('href');
                
                // Close mobile menu in all cases
                mainNav.classList.remove('active');

                // Only handle smooth scroll for hash links on mobile
                if (href && href.startsWith('#') && window.innerWidth <= 768) {
                    event.preventDefault();
                    const targetId = href.split('#')[1];
                    if (targetId) {
                        setTimeout(() => {
                            const targetElement = document.getElementById(targetId);
                            if (targetElement) {
                                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }, 250);
                    }
                }
                // Let other links work normally without prevention
            });
        });
    }

    // --- Countdown Timer Functionality (If on index.html) ---
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        const festStartDate = new Date("April 26, 2026 09:00:00").getTime();
        const countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = festStartDate - now;
            const daysSpan = document.getElementById('days');
            const hoursSpan = document.getElementById('hours');
            const minutesSpan = document.getElementById('minutes');
            const secondsSpan = document.getElementById('seconds');
            const timerWrapper = countdownElement; // Use the element itself
            const timerLaunchText = document.querySelector('.timer-launch-text');

            if (distance < 0) {
                clearInterval(countdownInterval);
                if(timerWrapper && timerWrapper.querySelector('#days')) { // Check content before replacing
                    timerWrapper.innerHTML = "<div style='font-size: 1.8rem; color: var(--primary-color); font-family: var(--font-heading);'>AAROHANA 2K26 IS LIVE!</div>";
                }
                if(timerLaunchText) timerLaunchText.style.display = 'none';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if(daysSpan) daysSpan.textContent = days < 10 ? '0' + days : days.toString();
            if(hoursSpan) hoursSpan.textContent = hours < 10 ? '0' + hours : hours.toString();
            if(minutesSpan) minutesSpan.textContent = minutes < 10 ? '0' + minutes : minutes.toString();
            if(secondsSpan) secondsSpan.textContent = seconds < 10 ? '0' + seconds : seconds.toString();
        }, 1000);
    } // End countdown check


    // --- Event Modal Functionality (If on events.html) ---
    const eventCards = document.querySelectorAll('.event-card');
    const modal = document.getElementById('eventModal');
    const closeModalButton = modal ? modal.querySelector('.modal-close-button') : null;

    if (modal && closeModalButton && eventCards.length > 0) {
        // Select modal elements safely
        const modalTitle = document.getElementById('modalEventTitle');
        const modalDate = document.getElementById('modalEventDate');
        const modalTime = document.getElementById('modalEventTime');
        const modalVenue = document.getElementById('modalEventVenue');
        const modalFee = document.getElementById('modalEventFee');
        const modalDescription = document.getElementById('modalEventDescription');
        const modalRulesLinkDiv = document.getElementById('modalEventRulesLink'); // Get the div container
        const modalRegisterButton = document.getElementById('modalRegisterButton'); // ****** Get the register button ******
        const modalPoster = document.getElementById('modalEventPoster'); // Added poster reference
        const modalType = document.getElementById('modalEventType'); 

        function openModal(card) {
             // Check if essential modal elements exist
            if (!card || !modalTitle || !modalDate || !modalTime || !modalVenue || !modalFee || !modalDescription || !modalRulesLinkDiv || !modalRegisterButton || !modalType) {
                console.error("Modal elements missing, cannot open.");
                return;
            }

            // Populate general modal content
            modalTitle.textContent = card.dataset.title || 'Event Details';
            modalDate.textContent = card.dataset.date || 'TBA';
            modalTime.textContent = card.dataset.time || 'TBA';
            modalVenue.textContent = card.dataset.venue || 'TBA';
            modalFee.textContent = card.dataset.fee || 'N/A';
            modalDescription.textContent = card.dataset.description || 'More details coming soon.';
            modalType.innerHTML = card.dataset.type === 'Group' ? '<i class="fas fa-users"></i> Group Event' : '<i class="fas fa-user"></i> Solo Event';

            // Handle Poster Image
            const cardImg = card.querySelector('.event-poster-image');
            if (modalPoster && cardImg && cardImg.src) {
                modalPoster.src = cardImg.src;
                modalPoster.style.display = 'block';
            } else if (modalPoster) {
                modalPoster.style.display = 'none';
            }

            // Handle Rulebook Link
            const rulesPath = card.dataset.rules;
            modalRulesLinkDiv.innerHTML = ''; // Clear previous rules link
            if (rulesPath && rulesPath.trim() !== '') {
                 // Create new link if rules exist
                 modalRulesLinkDiv.innerHTML = `<a href="${rulesPath}" class="button button-secondary" target="_blank"><i class="fas fa-book"></i> View Rulebook</a>`;
                 modalRulesLinkDiv.style.display = 'block';
            } else {
                 modalRulesLinkDiv.style.display = 'none'; // Hide if no rules
            }

            // ****** Handle Konfhub Link ******
            const konfhubLink = card.dataset.konfhubLink;
            if (konfhubLink && konfhubLink.trim() !== '') {
                modalRegisterButton.href = konfhubLink; // Set the button's link
                modalRegisterButton.style.display = 'block'; // Make sure button is visible
            } else {
                // If no specific Konfhub link for this event (e.g., free audition, faculty event)
                modalRegisterButton.style.display = 'none'; // Hide the register button
                // Alternatively, you could link to a general page:
                // modalRegisterButton.href = 'YOUR_GENERAL_KONFHUB_EVENT_PAGE_LINK';
                // modalRegisterButton.style.display = 'block';
            }
            // **********************************

            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        function closeModal() {
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = ''; // Restore scroll
            }
        }

        // Add event listeners
        eventCards.forEach(card => {
            card.addEventListener('click', (e) => {
                 if (e.target.tagName !== 'A') {
                     openModal(card);
                 }
            });
        });

        if (closeModalButton) {
            closeModalButton.addEventListener('click', closeModal);
        }
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

    } // End modal check

    // --- Scroll Reveal Animation ---
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    reveals.forEach(reveal => observer.observe(reveal));

    // --- 3D Tilt Effect for Premium Cards ---
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Adjust factor (e.g., 10) for more/less extreme tilt
            const rotateX = ((y - centerY) / centerY) * -8; 
            const rotateY = ((x - centerX) / centerX) * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.transition = 'transform 0.1s ease-out';
            card.style.zIndex = 10;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
            card.style.zIndex = 1;
        });
    });
}); // End of DOMContentLoaded listener

