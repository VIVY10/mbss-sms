document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelector('.slides');
    const slideElements = document.querySelectorAll('.slide');
    const slideCount = slideElements.length;
    let currentIndex = 0;

    if (slideCount === 0) {
        // console.error('No slides found');
        return;
    }

    // Clone the first and last slide
    const firstSlide = slideElements[0].cloneNode(true);
    const lastSlide = slideElements[slideCount - 1].cloneNode(true);

    // Append and prepend cloned slides
    slides.appendChild(firstSlide);
    slides.insertBefore(lastSlide, slides.firstChild);

    slides.style.transform = `translateX(-100%)`;

    // Add animation class to the active slide's caption
    function addAnimationToCaption(index) {
        const captions = document.querySelectorAll('.caption');
        captions.forEach(caption => caption.classList.remove('animate'));
        if (captions[index]) {
            captions[index].classList.add('animate');
        }
    }

    // Initialize with the first slide's caption animation
    addAnimationToCaption(0);

    // Next Slide
    document.querySelector('.next').addEventListener('click', () => {
        if (currentIndex >= slideCount) {
            slides.style.transition = 'none';
            currentIndex = 0;
            slides.style.transform = `translateX(-100%)`;
        }
        setTimeout(() => {
            slides.style.transition = 'transform 0.5s ease-in-out';
            currentIndex++;
            updateSlidePosition();
            addAnimationToCaption(currentIndex);
        }, 0);
    });

    // Previous Slide
    document.querySelector('.prev').addEventListener('click', () => {
        if (currentIndex <= 0) {
            slides.style.transition = 'none';
            currentIndex = slideCount;
            slides.style.transform = `translateX(-${(slideCount) * 100}%)`;
        }
        setTimeout(() => {
            slides.style.transition = 'transform 0.5s ease-in-out';
            currentIndex--;
            updateSlidePosition();
            addAnimationToCaption(currentIndex);
        }, 0);
    });

    function updateSlidePosition() {
        slides.style.transform = `translateX(-${(currentIndex + 1) * 100}%)`;
    }

    // Auto Slide
    setInterval(() => {
        if (currentIndex >= slideCount) {
            slides.style.transition = 'none';
            currentIndex = 0;
            slides.style.transform = `translateX(-100%)`;
        }
        setTimeout(() => {
            slides.style.transition = 'transform 0.5s ease-in-out';
            currentIndex++;
            updateSlidePosition();
            addAnimationToCaption(currentIndex);
        }, 0);
    }, 5000);
});
