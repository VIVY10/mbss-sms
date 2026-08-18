const mainVideo = document.querySelector('#main-Video');
const playlist = document.getElementById('playlist');
const lessons = document.querySelector('.lessons');
const videoTitle = document.querySelector('.title');
const searchInput = document.getElementById("searchInput");

lessons.innerHTML = `${allVideos.length} Lessons`;

let musicIndex = 1;

// Load and set the initial video
window.addEventListener('load', () => {
    loadMusic(musicIndex);
    playingNow();
});

// Function to load a specific video
function loadMusic(indexNumb) {
    mainVideo.src = `${allVideos[indexNumb - 1].src}`; // Set the iframe source
    videoTitle.textContent = `${indexNumb}. ${allVideos[indexNumb - 1].name}`;
}

// Generate the playlist dynamically
for (let i = 0; i < allVideos.length; i++) {
    let liTag = `<li li-index="${i + 1}">
      <div class="row">
         <span>${i + 1}. ${allVideos[i].name}</span>
      </div>
   </li>`;
    playlist.insertAdjacentHTML('beforeend', liTag);
}

// Highlight the currently playing video
function playingNow() {
    const allLiTags = playlist.querySelectorAll('li');
    allLiTags.forEach((liTag, index) => {
        liTag.classList.toggle("playing", index === musicIndex); // Add/remove the 'playing' class
        liTag.removeEventListener("click", handleClick); // Prevent duplicate listeners
        liTag.addEventListener("click", handleClick); // Add click event listener
    });
}

// Handle click event on the playlist
function handleClick(event) {
    const clickedElement = event.currentTarget;
    clicked(clickedElement);
}

// Change the video based on the clicked playlist item
function clicked(element) {
    let getIndex = element.getAttribute("li-index");
    musicIndex = getIndex;
    loadMusic(musicIndex);
    playingNow();
}
