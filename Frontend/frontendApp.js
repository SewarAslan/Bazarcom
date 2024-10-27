const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.listen(2000, () => {
    console.log(`frontend is running on port 2000`);
});

//search books by topic
app.get('/Bazarcom/Search/:topic', async (req, res) => {
    try {
        const topicParam = req.params.topic;
        const searchBy = "topic";
        const opertaion="search";
        const response = await axios.get('http://catalog:2001/CatalogServer/query', {
            params: { topicParam, searchBy ,opertaion}
        });
        res.json(response.data); // Send the response back to the client
    } catch (error) {
        //console.error(error);
        console.error('Error fetching data from database:', error);// Send error response to the client
        res.status(404).json({ error: 'Error fetching data from database, item is not found'}); 
    }
});

//search books by id
app.get('/Bazarcom/info/:id', async (req, res) => {
    try {
        const idParam = req.params.id;
        const searchBy = "id";
        const opertaion="info";
        const response = await axios.get('http://catalog:2001/CatalogServer/query', {
            params: { idParam, searchBy, opertaion }
        });
        res.json(response.data); // Send the response back to the client
    } catch (error) {
        console.error('Error fetching data from database:', error);// Send error response to the client
        res.status(404).json({ error: ' Error fetching data from database, item is not found' }); 
    }
});

//make purchase 
app.post('/Bazarcom/purchase/:id', async (req, res) => {
    try {
        const idParam = req.params.id;
        const response = await axios.post(`http://order:2002/OrderServer/purchase/${idParam}`);
        
        res.json(response.data); // Send the response back to the client
    } catch (error) {
        console.error('Error purchasing book:', error); // Log the error
        res.status(404).json({ error: 'Failed to purchase item' });
    }
});