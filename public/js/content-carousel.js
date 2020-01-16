/***  Benjazor - 01/15/2020 ***/
// Variables
let currentIndex = 0
let itemsArray = () =>Array.from(document.getElementById('content-carousel-items').children)

// Display the right items in the carousel
let updateDisplay = (item, index) => { item.style.display = (index >= currentIndex && index < currentIndex + 3) ? 'flex' : 'none' }

// Update every items
let updateItems = () => { itemsArray().forEach( updateDisplay )  }

// Previous button
function previous() {
    if (currentIndex > 0) {
        currentIndex--
        updateItems()
    }
}

// Next button
function next() {
    if (currentIndex + 3 < itemsArray().length) {
        currentIndex++
        updateItems()
    }
}

// Executed when the page loads
window.onload = () => { updateItems() }