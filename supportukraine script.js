const elements = document.querySelectorAll('.element');
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
            // Check for linked sections
            const linkId = entry.target.dataset.link;
            if (linkId) {
                document.getElementById(linkId).classList.add('visible');
            }
        }
    });
});
elements.forEach(element => {
    observer.observe(element);
});
