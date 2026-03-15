// Import required modules
const express = require('express');          // Web framework for Node.js
const mongoose = require('mongoose');        // ODM for MongoDB
const bodyParser = require('body-parser');   // Middleware to parse JSON request bodies
const path = require('path');                // Core module to work with file paths

// Create Express app
const app = express();
const PORT = 3000; // Port for server to listen on

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/equipment_register', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')) // Success message
  .catch(err => console.log(err)); // Error handling if connection fails

// Define Equipment schema
const equipmentSchema = new mongoose.Schema({
  name: String,
  type: String,
  cost: Number,
  room: String,
  registeredBy: String,
  date: { type: Date, default: Date.now } // Automatically record the registration date
});

// Create Mongoose model
const Equipment = mongoose.model('Equipment', equipmentSchema);

// Middleware Configuration
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(bodyParser.json()); // Parse JSON payloads
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from /public

//  ROUTES FOR STATIC HTML PAGES (VIEW ROUTES)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html')); // Serve the homepage (index.html)
});

// Route: Serve the equipment registration form page
app.get('/register-equipment', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// Edit Equipment (Dynamic Route Handling)
app.get('/edit-equipment', async (req, res) => {
  const id = req.query.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {  // Validate ID format & fallback to static page if invalid
    return res.sendFile(path.join(__dirname, 'views', 'edit.html'));
  }
  try {
    const equipment = await Equipment.findById(id); // Look up the equipment entry by its ID
    if (!equipment) return res.status(404).send("Equipment not found."); // Return 404 if no matching equipment is found

   res.send(`
  <html>
  <head>
    <title>Edit Equipment</title>
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <h1>Edit Equipment</h1>
    <form action="/edit" method="POST">
      <input type="hidden" name="id" value="${equipment._id}" />

      <input type="text" name="name" value="${equipment.name || ''}" placeholder="Equipment Name" required />
      <input type="text" name="type" value="${equipment.type || ''}" placeholder="Equipment Type" required />
      <input type="number" name="cost" value="${equipment.cost || ''}" placeholder="Cost (e.g. 1000)" required />
      <input type="text" name="room" value="${equipment.room || ''}" placeholder="Room (e.g. A1)" required />
      <input type="text" name="registeredBy" value="${equipment.registeredBy || ''}" placeholder="Registered By" required />

      <button type="submit">Update Equipment</button>
    </form>
  </body>
  </html>
`);

} catch (err) {
    res.status(500).send('Server error'); // Handle any unexpected server errors
  }
});

// Route: Serve the equipment deletion page
app.get('/delete-equipment', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'delete.html'));
});

// Route: Serve the search page for equipment by room
app.get('/search-room', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'searchRoom.html'));
});

// Route: Serve the search page for equipment by name
app.get('/search-equipment', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'searchEquipment.html'));
});

// Route: Serve the search page for equipment by type
app.get('/search-type', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'searchType.html'));
});

// Route: Serve the About page describing the application
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Route: Serve the Help page for user assistance or contact info
app.get('/help', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'help.html'));
});

// Route: Fetch all equipment data from the MongoDB collection
app.get('/api/all-equipment', async (req, res) => {
  try {
    const all = await Equipment.find(); // Fetch all equipment documents
    res.json(all);  // Respond with JSON array of equipment
  } catch (err) {
    res.status(500).send('Failed to fetch equipment');
  }
});

// Route: Serve the "View All Equipment" HTML page
app.get('/view-all', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'viewall.html'));
});


// Route: Register a new equipment item
app.post('/register', (req, res) => {
  const { name, type, cost, room, registeredBy } = req.body; 
  // Create a new equipment document
  const newEquipment = new Equipment({ name, type, cost, room, registeredBy });
  newEquipment.save() // Save to MongoDB 
    .then(() => res.status(201).send('Equipment registered successfully.'))
    .catch(err => res.status(500).send('Error registering equipment: ' + err));
});

// Route: Update existing equipment by ID
app.post('/edit', async (req, res) => {
  const { id, name, type, cost, room, registeredBy } = req.body;

  // Validate MongoDB Object ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid Equipment ID');
  }
  try {

    // Update the document with new values
    await Equipment.findByIdAndUpdate(id, { name, type, cost, room, registeredBy });
    res.redirect('/view-all'); // Redirect after successful update
  } catch (error) {
    res.status(500).send('Error updating equipment: ' + error);
  }
});

// Delete equipment by ID (POST request)
app.post('/delete', async (req, res) => {
  const { id } = req.body;

  // Check if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid Equipment ID');
  }
  try {
    await Equipment.findByIdAndDelete(id); // Delete the equipment by ID from MongoDB
    res.send(`Equipment with ID: ${id} deleted.`);
  } catch (error) {
    res.status(500).send('Error deleting equipment: ' + error); // Handle server/database error
  }
});

// Search equipment by name (POST request, case-insensitive)
app.post('/search-equipment', async (req, res) => {
  const { name } = req.body;
  try {
    const results = await Equipment.find({ name: { $regex: new RegExp(name, 'i') } });
    res.json(results);
  } catch (error) {
    res.status(500).send('Error searching for equipment: ' + error);
  }
});

// Search by room
app.post('/search-room', async (req, res) => {
  const { room } = req.body;
  try {
    const results = await Equipment.find({ room: { $regex: new RegExp(room, 'i') } });
    res.json(results);
  } catch (error) {
    res.status(500).send('Error searching for room: ' + error);
  }
});

// Search by equipment type
app.post('/search-type', async (req, res) => {
  const { type } = req.body;
  try {
    const results = await Equipment.find({ type: { $regex: new RegExp(type, 'i') } });
    res.json(results);
  } catch (error) {
    res.status(500).send('Error searching for equipment type: ' + error);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
