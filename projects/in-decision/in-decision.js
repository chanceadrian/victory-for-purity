document.querySelectorAll('.cab-tabs').forEach((tabsSection) => {
    const tabButtons = tabsSection.querySelectorAll('.tab');
    const itemA = tabsSection.querySelector('.item.a');
    const itemB = tabsSection.querySelector('.item.b');
    const itemC = tabsSection.querySelector('.item.c');
    const paragraphs = tabsSection.querySelectorAll('.copy p');

    tabButtons.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Background image switching
            const imgA = tab.getAttribute('img-a');
            const imgB = tab.getAttribute('img-b');
            const imgC = tab.getAttribute('img-c');

            if (imgA) itemA.style.backgroundImage = `url(${imgA})`;
            if (imgB) itemB.style.backgroundImage = `url(${imgB})`;
            if (imgC) itemC.style.backgroundImage = `url(${imgC})`;

            // Update paragraph visibility (if any exist)
            if (paragraphs.length > 0) {
                paragraphs.forEach((p, i) => {
                    p.classList.toggle('reveal', i === index);
                });
            }
        });
    });
});

