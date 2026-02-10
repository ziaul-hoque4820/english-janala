const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    link.addEventListener('click', function () {
        navLinks.forEach(item => {
            item.classList.remove('bg-primary', 'text-white', 'hover:bg-primary');
            item.classList.add('btn-ghost');
        });

        this.classList.add('bg-primary', 'text-white');
        this.classList.remove('btn-ghost');
    });
});

window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('shadow-xl');
    } else {
        header.classList.remove('shadow-xl');
    }
});