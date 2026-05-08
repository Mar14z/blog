document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    initProjectCards();
});

function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projects = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            projects.forEach((project, index) => {
                const category = project.dataset.category;
                
                if (filter === 'all' || category === filter) {
                    project.classList.remove('filtered-out');
                    setTimeout(() => {
                        project.classList.add('visible');
                    }, index * 100);
                } else {
                    project.classList.remove('visible');
                    setTimeout(() => {
                        project.classList.add('filtered-out');
                    }, 300);
                }
            });
        });
    });
}

function initProjectCards() {
    const projects = document.querySelectorAll('.project-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    projects.forEach(project => {
        if (!project.classList.contains('filtered-out')) {
            observer.observe(project);
        }
    });
}
