document.querySelectorAll('section').forEach(section => {
    const scrollView = section.querySelector('.scroll.view');
    const controls = section.querySelector('.controls');

    if (!scrollView || !controls) return;

    const leftBtn = controls.querySelector('.left');
    const rightBtn = controls.querySelector('.right');

    const firstCard = scrollView.querySelector('.card');
    const gap = 20;
    const scrollAmount = firstCard ? firstCard.offsetWidth + gap : 0;

    const updateButtonState = () => {
        const maxScrollLeft = scrollView.scrollWidth - scrollView.clientWidth;
        const currentScroll = scrollView.scrollLeft;

        if (currentScroll <= 0) {
            leftBtn.classList.add('disabled');
        } else {
            leftBtn.classList.remove('disabled');
        }

        if (currentScroll >= maxScrollLeft - 1) {
            // the -1 accounts for potential rounding issues
            rightBtn.classList.add('disabled');
        } else {
            rightBtn.classList.remove('disabled');
        }
    };

    // Initial state
    updateButtonState();

    leftBtn?.addEventListener('click', () => {
        scrollView.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    rightBtn?.addEventListener('click', () => {
        scrollView.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Update button state on scroll and after smooth scroll ends
    scrollView.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateButtonState);
    });
});

document.addEventListener('keydown', event => {
    const activeSection = document.activeElement.closest?.('section') || document.querySelector('section:has(.scroll.view)');
    if (!activeSection) return;

    const scrollView = activeSection.querySelector('.scroll.view');
    const firstCard = scrollView?.querySelector('.card');
    const gap = 20;
    const scrollAmount = firstCard ? firstCard.offsetWidth + gap : 0;

    if (!scrollView || !scrollAmount) return;

    if (event.key === 'ArrowLeft') {
        scrollView.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }

    if (event.key === 'ArrowRight') {
        scrollView.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
});

