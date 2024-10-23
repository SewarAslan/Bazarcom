const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.listen(1000, () => {
    console.log(`frontend is running on port 1000`);
});

//search books by topic
app.get('/Bazarcom/Search/:topic', async (req, res) => {
    try {
        const topicParam = req.params.topic;
        const searchBy = "topic";
        const response = await axios.get('http://localhost:1001/CatalogServer/query', {
            params: { topicParam, searchBy }
        });
        res.json(response.data); // Send the response back to the client
    } catch (error) {
        console.error(error);
        console.error('Error fetching data from catalog service:', error);// Send error response to the client
        res.status(404).json({ error: ' Not Found!' }); 
    }
});

//search books by id
app.get('/Bazarcom/info/:id', async (req, res) => {
    try {
        const idParam = req.params.id;
        const searchBy = "id";
        const response = await axios.get('http://localhost:1001/CatalogServer/query', {
            params: { idParam, searchBy }
        });
        res.json(response.data); // Send the response back to the client
    } catch (error) {
        console.error('Error fetching data from catalog service:', error);// Send error response to the client
        res.status(404).json({ error: ' Not Found!' }); 
    }
});

//make purchase 
app.post('/Bazarcom/purchase/:id', async (req, res) => {
    try {
        const idParam = req.params.id;
        const response = await axios.get('http://order:1002/OrderServer/purchase', {
            params: { idParam }
        });
        
        res.json(response.data); // Send the response back to the client
    } catch (error) {
        console.error('Error purchasing book:', error);// Send error response to the client
        res.status(404).json({ error: ' Not Found!' }); 
    }
});