
// Register Equipment Form Submission
const registerForm = document.getElementById('registerForm');
if (registerForm) {

     // Attach listener to handle register form submission
    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Get input values from form fields
        const name = document.querySelector('input[name="name"]').value;
        const type = document.querySelector('input[name="type"]').value;
        const cost = parseFloat(document.querySelector('input[name="cost"]').value);
        const room = document.querySelector('input[name="room"]').value;
        const registeredBy = document.querySelector('input[name="registeredBy"]').value;

        // Send POST request to backend to register new equipment
        fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type, cost, room, registeredBy })
        })
        .then(response => response.text()) // Parse response text
        .then(data => {
            // Display response message and reset the form
            document.getElementById('registerResult').innerText = data;
            registerForm.reset();
        })
        .catch(error => console.error('Error:', error));
    });
}


// Edit Equipment Form Submission
const editForm = document.getElementById('editForm');
if (editForm) {

    // Attach listener to handle edit form submission
    editForm.addEventListener('submit', function(event) {
        event.preventDefault();

         // Get updated values including the equipment ID
        const id = document.querySelector('input[name="id"]').value;
        const name = document.querySelector('input[name="name"]').value;
        const type = document.querySelector('input[name="type"]').value;
        const cost = parseFloat(document.querySelector('input[name="cost"]').value);
        const room = document.querySelector('input[name="room"]').value;
        const registeredBy = document.querySelector('input[name="registeredBy"]').value;

        // Send updated data via POST request to backend
        fetch('/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name, type, cost, room, registeredBy })
        })
        .then(response => response.text())
        .then(data => {
            // Show result and clear form
            document.getElementById('editResult').innerText = data;
            editForm.reset();
        })
        .catch(error => console.error('Error:', error));
    });
}


// Delete Equipment Form Submission
const deleteForm = document.getElementById('deleteForm');
if (deleteForm) {

    // Handle deletion when form is submitted
    deleteForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const id = document.querySelector('input[name="id"]').value;

        fetch('/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        })
        .then(response => response.text())
        .then(data => {
            document.getElementById('deleteResult').innerText = data;
            deleteForm.reset();
        })
        .catch(error => console.error('Error:', error));
    });
}


// Search Equipment by Room
const searchRoomForm = document.getElementById('searchRoomForm');
if (searchRoomForm) {

    // Attach submit event handler to the search form
    searchRoomForm.addEventListener('submit', function(event) {
        event.preventDefault();
        // Get the room value from the input field
        const room = document.querySelector('input[name="room"]').value;

        // Send a POST request to search equipment by room
        fetch('/search-room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room })
        })
        .then(response => response.json())  // Parse the JSON response
        .then(data => {
             // Display results inside a <ul> as list items
            const resultDiv = document.getElementById('searchRoomResult');
            resultDiv.innerHTML = "<ul>" + data.map(eq =>
                `<li>${eq.name} (${eq.type}) - €${eq.cost} - ${eq.registeredBy} - ${new Date(eq.date).toLocaleDateString()}</li>`
            ).join('') + "</ul>";
        })
        .catch(error => console.error('Error:', error));  // Log fetch errors
    });
}


// Search Equipment by Name
const searchEquipmentForm = document.getElementById('searchEquipmentForm');
if (searchEquipmentForm) {
    searchEquipmentForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.querySelector('input[name="name"]').value;

        fetch('/search-equipment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })
        .then(response => response.json())
        .then(data => {
            const resultDiv = document.getElementById('searchEquipmentResult');
            resultDiv.innerHTML = "<ul>" + data.map(eq =>
                `<li>${eq.name} (${eq.type}) - €${eq.cost} - ${eq.room} - ${new Date(eq.date).toLocaleDateString()}</li>`
            ).join('') + "</ul>";
        })
        .catch(error => console.error('Error:', error));
    });
}


// Search Equipment by Type
const searchTypeForm = document.getElementById('searchTypeForm');
if (searchTypeForm) {
    searchTypeForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const type = document.querySelector('input[name="type"]').value;

        fetch('/search-type', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type })
        })
        .then(response => response.json())
        .then(data => {
            const resultDiv = document.getElementById('searchTypeResult');
            resultDiv.innerHTML = "<ul>" + data.map(eq =>
                `<li>${eq.name} (${eq.type}) - €${eq.cost} - ${eq.room} - ${new Date(eq.date).toLocaleDateString()}</li>`
            ).join('') + "</ul>";
        })
        .catch(error => console.error('Error:', error));
    });
}


// Pre-fill form on Edit Page based on URL ID
const editPage = document.getElementById('editForm');
if (editPage) {

    // Extract the 'id' parameter from the URL (e.g., /edit-equipment?id=12345)
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

     // Get the loading message element and show it
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.style.display = 'block';

    // If no ID is provided in the URL, show error
    if (!id) {
        loadingMessage.innerHTML = "<span style='color:red;'>Invalid access. No ID provided.</span>";
    } else {

        // Fetch all equipment records from the server
        fetch('/api/all-equipment')
            .then(res => res.json())
            .then(data => {

                // Find the equipment matching the ID
                const eq = data.find(item => item._id === id);

                // If no match is found, show not found error
                if (!eq) {
                    loadingMessage.innerHTML = "<span style='color:red;'>Equipment not found.</span>";
                    return;
                }
                // Populate the form fields with the equipment data
                document.getElementById('id').value = eq._id;
                document.getElementById('name').value = eq.name;
                document.getElementById('type').value = eq.type;
                document.getElementById('cost').value = eq.cost;
                document.getElementById('room').value = eq.room;
                document.getElementById('registeredBy').value = eq.registeredBy;

                // Hide the loading message
                loadingMessage.style.display = 'none';
            })
            .catch(err => {
                // Handle errors in fetch or JSON parsing
                loadingMessage.innerHTML = "<span style='color:red;'>Error fetching equipment.</span>";
            });
    }
}
