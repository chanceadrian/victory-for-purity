// ------------------------------
// Tab Navigation
// ------------------------------

document.querySelectorAll('.tab-nav').forEach(nav => {
    const tabs = nav.querySelectorAll('.tab');
    const indicator = nav.querySelector('.tab-indicator');

    function moveIndicatorTo(tab) {
        const rect = tab.getBoundingClientRect();
        const containerRect = nav.getBoundingClientRect();
        const left = rect.left - containerRect.left;
        const width = rect.width;

        indicator.style.left = `${left}px`;
        indicator.style.width = `${width}px`;
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            nav.querySelector('.tab.selected')?.classList.remove('selected');
            tab.classList.add('selected');
            tab.focus();

            moveIndicatorTo(tab);
        });

        tab.addEventListener('keydown', (e) => {
            const isModeToggle = nav.id === 'mode-toggle';
            if (isModeToggle) return;
            if (e.key === 'ArrowRight' || e.key === 'Right') {
                e.preventDefault();
                const next = tabs[(index + 1) % tabs.length];
                next.click();
            }
            if (e.key === 'ArrowLeft' || e.key === 'Left') {
                e.preventDefault();
                const prev = tabs[(index - 1 + tabs.length) % tabs.length];
                prev.click();
            }
        });
    });

    // Initialize the indicator
    const selected = nav.querySelector('.tab.selected');
    if (selected) moveIndicatorTo(selected);
});

// ------------------------------
// // Global Staggered Fade Ins
// ------------------------------
const elements = [...document.querySelectorAll('.staggered-fade-in')];

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const index = elements.indexOf(entry.target);
            const delay = index * 150; // consistent global stagger

            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);

            observer.unobserve(entry.target); // prevent retrigger
        }
    });
}, {
    threshold: 0.3 // moderate trigger sensitivity
});

elements.forEach(el => observer.observe(el));

// ------------------------------
// Section Focus & Key Routing
// ------------------------------

let activeSectionInView = null;

const sectionObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting);
    if (!visible.length) return;

    const topMost = visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (topMost.target !== activeSectionInView) {
        activeSectionInView = topMost.target;

        const tag = activeSectionInView.tagName;
        const className = activeSectionInView.className;
        console.log(`🟢 New active section: <${tag.toLowerCase()}>.${className}`);

        const tabNav = activeSectionInView.querySelector('.tab-nav');
        const selectedTab = tabNav?.querySelector('.tab.selected');

        if (selectedTab) {
            console.log('🔘 Focusing selected tab');
            selectedTab.focus({ preventScroll: true });
        } else {
            const galleryContainer = activeSectionInView.querySelector('.share-scroll');
            if (galleryContainer) {
                if (!galleryContainer.hasAttribute('tabindex')) {
                    galleryContainer.setAttribute('tabindex', '0');
                }
                console.log('📬 Focusing share-scroll container in .view.share');
                galleryContainer.focus({ preventScroll: true });
            } else {
                console.log('⚠️ No focusable element found in new section');
            }
        }
    }
}, { threshold: [0.3, 0.6, 0.9] });

// Observe all main sections + view.share
document.querySelectorAll('section, .view.share').forEach(el => {
    console.log('👁️ Observing:', el.tagName.toLowerCase(), el.className);
    sectionObserver.observe(el);
});




