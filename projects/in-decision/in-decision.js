const tabButtons = document.querySelectorAll('.tab');
const itemA = document.querySelector('.item.a');
const itemB = document.querySelector('.item.b');
const itemC = document.querySelector('.item.c');
const paragraphs = document.querySelectorAll('.cab-tabs .copy p');

tabButtons.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        const imgA = tab.getAttribute('img-a');
        const imgB = tab.getAttribute('img-b');
        const imgC = tab.getAttribute('img-c');

        if (imgA) itemA.style.backgroundImage = `url(${imgA})`;
        if (imgB) itemB.style.backgroundImage = `url(${imgB})`;
        if (imgC) itemC.style.backgroundImage = `url(${imgC})`;

        // Handle paragraph visibility
        paragraphs.forEach((p, i) => {
            p.classList.toggle('reveal', i === index);
        });
    });
});
