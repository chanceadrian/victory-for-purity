// ------------------------------
// Artifacts
// ------------------------------

const tabButtons = document.querySelectorAll('.tab');
const itemA = document.querySelector('.item.a');
const itemB = document.querySelector('.item.b');
const itemC = document.querySelector('.item.c');

tabButtons.forEach(tab => {
    tab.addEventListener('click', () => {
        const imgA = tab.getAttribute('img-a');
        const imgB = tab.getAttribute('img-b');
        const imgC = tab.getAttribute('img-c');

        if (imgA) itemA.style.backgroundImage = `url(${imgA})`;
        if (imgB) itemB.style.backgroundImage = `url(${imgB})`;
        if (imgC) itemC.style.backgroundImage = `url(${imgC})`;
    });
});

// ------------------------------
// Parallax Cabinet
// ------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const cabinet = document.querySelector('.parallax-cabinet');
    const container = document.querySelector('.cabinet-header');

    const maxOffset = -111;
    const landingThreshold = 0.9;

    function updateCabinetParallax() {
        const rect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight && rect.bottom > 0) {
            const totalScroll = windowHeight + rect.height;
            const visiblePart = windowHeight - rect.top;

            let progress = visiblePart / totalScroll;
            progress = Math.min(1, Math.max(0, progress / landingThreshold));

            const offset = -maxOffset * (1 - progress);
            cabinet.style.transform = `translateY(${offset}px)`;
        }
    }

    window.addEventListener('scroll', updateCabinetParallax);
    window.addEventListener('resize', updateCabinetParallax);
    updateCabinetParallax();
});

// ------------------------------
// Spaces & Rooms Gallery
// ------------------------------


class SpacesRoomsController {
    constructor() {
        // ----- cache elements -----
        this.shelfScroll = document.querySelector('.shelf-scroll');
        this.roomScroll = document.querySelector('.room-scroll');
        this.shelfItems = this.shelfScroll.querySelectorAll('.shelf');
        this.roomItems = this.roomScroll.querySelectorAll('.h-spaces');
        this.rSpaces = document.querySelectorAll('.space.r1, .space.r2, .space.r3');
        this.tabNav = document.querySelector('#mode-toggle');
        this.modeTabs = this.tabNav.querySelectorAll('.tab');
        this.tabIndicator = this.tabNav.querySelector('.tab-indicator');
        this.space = document.querySelector('.space');
        this.rooms = document.querySelector('.spaces-rooms');
        this.descEl = document.querySelector('#mode-toggle + p');
        this.leftBtn = document.querySelector('.gallery-control.left');
        this.rightBtn = document.querySelector('.gallery-control.right');

        // ----- images & copy -----
        this.shelfBackgroundImages = [
            'url("img/spaces/space-1.avif")',
            'url("img/spaces/space-2.avif")',
            'url("img/spaces/space-3.avif")'
        ];
        this.gradientImages = [
            'url("img/spaces/bg-1.avif")',
            'url("img/spaces/bg-2.avif")',
            'url("img/spaces/bg-3.avif")'
        ];
        this.descriptions = {
            spaces: `<span>Make it yours. </span>Spaces let you swipe between different expressions of you: the music you love, a hobby, or even a special someone.`,
            rooms: `<span>One shelf leads to another. </span>Rooms let you dive deeper into the Spaces you’ve already made your own, featuring their own icon and heading.`
        };
        this.scrollSequence = [
            this.shelfItems[0],
            this.shelfItems[1],
            this.shelfItems[2],
            this.roomItems[1], // r1
            this.roomItems[2], // r2
            this.roomItems[3]  // r3
        ];

        // ----- state -----
        this.currentIndex = -1;
        this.currentRoomIndex = -1;
        this.galleryIndex = 0;
        this.suppressTabSwitch = false;
        this.suppressBackgroundUpdate = false;
        this.shelfTicking = false;
        this.roomTicking = false;
        this.lastDescriptionMode = null;

        // ----- initial measurements & resize listener -----
        this.updateMeasurements();
        window.addEventListener('resize', () => this.updateMeasurements(), { passive: true });

        // ----- wire up scroll handlers -----
        this.shelfScroll.addEventListener('scroll', () => this.onShelfScroll(), { passive: true });
        this.roomScroll.addEventListener('scroll', () => this.onRoomScroll(), { passive: true });

        // ----- tabs -----
        this.modeTabs.forEach(tab => tab.addEventListener('click', e => this.onModeClick(e)));

        // ----- gallery buttons -----
        this.leftBtn.addEventListener('click', () => {
            if (this.galleryIndex > 0) {
                this.scrollToGalleryItem(this.galleryIndex - 1);
            }
        });
        this.rightBtn.addEventListener('click', () => {
            if (this.galleryIndex < this.scrollSequence.length - 1) {
                this.scrollToGalleryItem(this.galleryIndex + 1);
            }
        });

        // ----- keyboard navigation -----
        document.addEventListener('keydown', e => this.onKeydown(e));

        // ----- sync initial UI -----
        this.updateButtonStates();
    }

    updateMeasurements() {
        this.shelfWidth = this.shelfItems[0].offsetWidth;
        this.roomFullWidth = this.roomItems[0].offsetWidth + 120;
    }

    // throttle with RAF
    onShelfScroll() {
        if (this.shelfTicking) return;
        this.shelfTicking = true;
        requestAnimationFrame(() => {
            this.updateBackgrounds();
            this.shelfTicking = false;
        });
    }
    onRoomScroll() {
        if (this.roomTicking) return;
        this.roomTicking = true;
        requestAnimationFrame(() => {
            this.updateRoomState();
            this.roomTicking = false;
        });
    }

    // update space background
    updateBackgrounds() {
        if (this.suppressBackgroundUpdate) return;
        const idx = Math.round(this.shelfScroll.scrollLeft / this.shelfWidth);
        if (idx === this.currentIndex) return;

        this.currentIndex = idx;
        this.space.style.backgroundImage = this.shelfBackgroundImages[idx];
        this.rooms.style.backgroundImage = this.gradientImages[idx];
        this.galleryIndex = idx;
        this.updateButtonStates();
    }

    // update tabs & description on room scroll
    updateRoomState() {
        if (this.suppressTabSwitch) return;
        const idx = Math.round(this.roomScroll.scrollLeft / this.roomFullWidth);
        if (idx === this.currentRoomIndex) return;

        this.currentRoomIndex = idx;
        this.toggleTab(idx === 0 ? 'spaces' : 'rooms');
        this.rSpaces.forEach(el => el.classList.toggle('show', idx >= 1));
        this.galleryIndex = idx + 2;
        this.updateButtonStates();

        // only re-fade when mode actually changes
        const mode = idx === 0 ? 'spaces' : 'rooms';
        if (mode !== this.lastDescriptionMode) {
            this.lastDescriptionMode = mode;
            this.updateDescription(mode);
        }
    }

    // tab clicks
    onModeClick(e) {
        const isSpaces = e.currentTarget === this.modeTabs[0];
        const mode = isSpaces ? 'spaces' : 'rooms';

        this.toggleTab(mode);
        this.suppressTabSwitch = true;
        this.suppressBackgroundUpdate = true;

        // scroll shelf to start or end
        this.shelfScroll.scrollTo({
            left: isSpaces
                ? 0
                : this.shelfItems[this.shelfItems.length - 1].offsetLeft,
            behavior: 'smooth'
        });
        // scroll rooms to first
        this.roomScroll.scrollTo({
            left: isSpaces ? 0 : this.roomItems[0].offsetLeft,
            behavior: 'smooth'
        });

        // show/hide room items
        this.rSpaces.forEach(el => el.classList[isSpaces ? 'remove' : 'add']('show'));

        // reset & fade description
        this.lastDescriptionMode = mode;
        this.updateDescription(mode);

        // restore bg after exact same delays
        setTimeout(() => {
            const bgIndex = isSpaces ? 0 : 2;
            this.space.style.backgroundImage = this.shelfBackgroundImages[bgIndex];
            this.rooms.style.backgroundImage = this.gradientImages[bgIndex];
            this.currentIndex = bgIndex;
            this.suppressBackgroundUpdate = false;
        }, isSpaces ? 450 : 200);

        setTimeout(() => { this.suppressTabSwitch = false; }, 1000);
    }

    // move the underline + active class
    toggleTab(mode) {
        this.modeTabs.forEach(t => t.classList.remove('selected'));
        const tab = mode === 'spaces' ? this.modeTabs[0] : this.modeTabs[1];
        tab.classList.add('selected');

        const r = tab.getBoundingClientRect();
        const nr = this.tabNav.getBoundingClientRect();
        this.tabIndicator.style.left = `${r.left - nr.left}px`;
        this.tabIndicator.style.width = `${r.width}px`;
    }

    // fade helper
    fade(el, fn) {
        el.classList.add('fading');
        setTimeout(() => {
            fn();
            el.classList.remove('fading');
        }, 150);
    }
    updateDescription(mode) {
        this.fade(this.descEl, () => {
            this.descEl.innerHTML = this.descriptions[mode];
        });
    }

    // exact original gallery logic
    scrollToGalleryItem(index) {
        const el = this.scrollSequence[index];
        if (!el) return;
        console.log(`🧭 Scrolling to index ${index}:`, el);

        if (index === 3) {
            const s3 = document.querySelector('.s3');
            s3?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });

        this.galleryIndex = index;
        this.updateButtonStates();
    }
    updateButtonStates() {
        this.leftBtn.classList.toggle('disabled', this.galleryIndex === 0);
        this.rightBtn.classList.toggle(
            'disabled',
            this.galleryIndex === this.scrollSequence.length - 1
        );
    }

    // ← now perfectly mirror the button logic ←
    onKeydown(e) {
        if (typeof activeSectionInView === 'undefined' || !activeSectionInView) return;
        if (!activeSectionInView.classList.contains('spaces-rooms')) return;

        if (e.key === 'ArrowRight') this.rightBtn.click();
        if (e.key === 'ArrowLeft') this.leftBtn.click();
    }
}

// instantiate once
new SpacesRoomsController();

// ------------------------------
// Shareing Gallery
// ------------------------------

document.querySelectorAll('.view.share').forEach(shareSection => {
    const scrollContainer = shareSection.querySelector('.share-scroll');
    const items = Array.from(scrollContainer.querySelectorAll('.h-share'));
    const leftBtn = shareSection.querySelector('.gallery-control.left');
    const rightBtn = shareSection.querySelector('.gallery-control.right');

    let currentIndex = 0;

    function scrollToIndex(index) {
        index = Math.max(0, Math.min(index, items.length - 1));
        const target = items[index];
        if (!target) return;

        currentIndex = index;
        target.scrollIntoView({ behavior: 'smooth', inline: 'start' });
        updateButtons();
    }

    function updateButtons() {
        leftBtn.classList.toggle('disabled', currentIndex === 0);
        rightBtn.classList.toggle('disabled', currentIndex === items.length - 1);
    }

    leftBtn.addEventListener('click', () => {
        scrollToIndex(currentIndex - 1);
    });

    rightBtn.addEventListener('click', () => {
        scrollToIndex(currentIndex + 1);
    });

    // Update index roughly based on scroll position
    scrollContainer.addEventListener('scroll', () => {
        const scrollLeft = scrollContainer.scrollLeft;
        const itemWidth = items[0].offsetWidth + parseInt(getComputedStyle(items[0]).marginRight || 0);
        const index = Math.round(scrollLeft / itemWidth);
        if (index !== currentIndex && index >= 0 && index < items.length) {
            currentIndex = index;
            updateButtons();
        }
    });

    updateButtons(); // initial state
});


// ------------------------------
// Modal functionality
// ------------------------------

// Modal functionality
let modalAnimationFrameId = null;
let scrollPosition = 0;

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const body = document.body;

    if (!modal) return;

    // Cancel any pending animation
    if (modalAnimationFrameId) {
        cancelAnimationFrame(modalAnimationFrameId);
    }

    // Store current scroll position
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Prevent body scroll and maintain position
    body.style.position = 'fixed';
    body.style.top = `-${scrollPosition}px`;
    body.style.width = '100%';

    // Show modal immediately but keep it invisible
    modal.style.display = 'flex';

    // Force a reflow to ensure display change is applied
    modal.offsetHeight;

    // Use requestAnimationFrame for smooth animation
    modalAnimationFrameId = requestAnimationFrame(() => {
        modal.setAttribute('data-modal', 'open');
        modalAnimationFrameId = null;
    });

    // Add escape key listener
    document.addEventListener('keydown', handleModalEscapeKey);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const body = document.body;

    if (!modal) return;

    // Cancel any pending animation
    if (modalAnimationFrameId) {
        cancelAnimationFrame(modalAnimationFrameId);
    }

    // Start close animation
    modal.setAttribute('data-modal', 'closed');

    // Restore body scroll and position
    body.style.position = '';
    body.style.top = '';
    body.style.width = '';

    // Restore scroll position
    window.scrollTo(0, scrollPosition);

    // Clean up after animation completes
    setTimeout(() => {
        if (modal.getAttribute('data-modal') === 'closed') {
            modal.style.display = 'none';

            // Clear will-change to save resources
            const container = modal.querySelector('.modal-container');
            if (container) {
                container.style.willChange = 'auto';
            }
        }
    }, 500); // Match the CSS transition duration (changed to 500ms)

    // Remove escape key listener
    document.removeEventListener('keydown', handleModalEscapeKey);
}

// Handle escape key press
function handleModalEscapeKey(event) {
    if (event.key === 'Escape') {
        const openModal = document.querySelector('.modal-overlay[data-modal="open"]');
        if (openModal) {
            closeModal(openModal.id);
        }
    }
}

// Close modal when clicking outside content
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('modal-backdrop')) {
        const modal = event.target.closest('.modal-overlay');
        if (modal && modal.getAttribute('data-modal') === 'open') {
            closeModal(modal.id);
        }
    }
});

// Prevent modal from closing when clicking inside content
document.addEventListener('click', function (event) {
    if (event.target.closest('.modal-content')) {
        event.stopPropagation();
    }
});

// Clean up animations on page unload
window.addEventListener('beforeunload', function () {
    if (modalAnimationFrameId) {
        cancelAnimationFrame(modalAnimationFrameId);
    }
});

// Initialize modals on page load
document.addEventListener('DOMContentLoaded', function () {
    // Ensure all modals start in closed state
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.setAttribute('data-modal', 'closed');
        modal.style.display = 'none';
    });
});