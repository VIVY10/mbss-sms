// Select relevant HTML elements
const filterButtons = document.querySelectorAll("#filter-buttons button");
const filterableCards = document.querySelectorAll("#filterable-cards .profilecard");

// Function to filter cards based on filter buttons
const filterCards = (e) => {
    document.querySelector("#filter-buttons .active").classList.remove("active");
    e.target.classList.add("active");

    filterableCards.forEach(profilecard => {
        // show the card if it matches the clicked filter or show all cards if "all" filter is clicked
        if(profilecard.dataset.name === e.target.dataset.filter || e.target.dataset.filter === "all") {
            return profilecard.classList.replace("hide", "show");
        }
        profilecard.classList.add("hide");
    });
}

filterButtons.forEach(button => button.addEventListener("click", filterCards));