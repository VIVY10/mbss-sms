const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//const ws = new WebSocket(`ws://${window.location.host}`);
const ws = new WebSocket('wss://localhost:3000');

ws.onopen = () => {
// console.log('WebSocket connection established.');
};

ws.onmessage = (event) => {
const data = JSON.parse(event.data);
// console.log('Data received:', data); // Debugging line
updateCards(data); // Function to update the dashboard data
};

ws.onclose = () => {
// console.log('WebSocket connection closed.');
};


function updateCards(data) {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card) => {
        const title = card.querySelector('p').textContent.trim(); // Trim any extra spaces
        const titleLowerCase = title.toLowerCase(); // Convert title to lowercase

        if (data[title]) {
        const count = data[title];
        const progress = calculateProgress(count); // Assuming you want to calculate progress based on count

        // Update count value
        card.querySelector('h2').textContent = count;

        // Update progress bar width
        const progressElement = card.querySelector('.progress');
        progressElement.style.width = `${progress}%`;

        // Optionally log to verify changes
        // console.log(`Updated ${title}: count = ${count}, progress = ${progress}%`);
        }
    });
    }

    // Function to calculate progress (this is just an example; you should modify it based on your requirements)
    function calculateProgress(count) {
    const maxCount = 1000; // Example: The maximum expected count
    return (count / maxCount) * 100;
    }