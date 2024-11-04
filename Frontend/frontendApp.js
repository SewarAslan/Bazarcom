const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

//for cache
const CACHE_SIZE = 10; // Maximum cache size
const cache = new Map(); // in-memory cache is integrated into the front-end 


// checks the cache first if data in it
function getFromCache(key) {
    if (cache.has(key)) {
        // Move new item to the end to mark it as recently used/ we used LRU cache replacement policy
        const value = cache.get(key);
        cache.delete(key);
        cache.set(key, value);
        return value;
    }
    return null;
}

// set new data in cache
function setCache(key, value) {
    if (cache.size >= CACHE_SIZE) {
        // Remove the first (least recently used) item from the cache according 
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
    }
    cache.set(key, value);
}

app.listen(2000, () => {
    console.log(`Frontend is running on port 2000`);
});

// Search books by topic with caching
app.get('/Bazarcom/Search/:topic', async (req, res) => {
    const topicParam = req.params.topic;
    const cacheKey = `topic-${topicParam}`;

    // At first, Check cache 
    const cachedData = getFromCache(cacheKey);
    //data is in cache
    if (cachedData) {
        console.log('In Cache');
        return res.json(cachedData);
    }
    //it is new data, so add it to cache
    else{
        console.log('Not in cache, so add it');
            try {
        const searchBy = "topic";
        const operation = "search";
        const response = await axios.get('http://localhost:2001/CatalogServer/query', {
            params: { topicParam, searchBy, operation }
        });

        setCache(cacheKey, response.data); // Store result in cache
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from catalog server:', error);
        res.status(404).json({ error: 'Item not found' });
    }
    }

});

// Get book info by ID with caching
app.get('/Bazarcom/info/:id', async (req, res) => {
    const idParam = req.params.id;
    const cacheKey = `id-${idParam}`;

    // Check cache first
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
        console.log('In Cache');
        return res.json(cachedData);
    }
    else{
        console.log('Not in cache, so add it');
            try {
        const searchBy = "id";
        const operation = "info";
        const response = await axios.get('http://localhost:2001/CatalogServer/query', {
            params: { idParam, searchBy, operation }
        });

        setCache(cacheKey, response.data); // Store result in cache
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from catalog server:', error);
        res.status(404).json({ error: 'Item not found' });
    }
    }

});

// Make purchase and invalidate item in cache for consistency (here we have a write operation)
app.post('/Bazarcom/purchase/:id', async (req, res) => {
    try {
        const idParam = req.params.id;

        // Invalidate cache related to this book ID/ delete item from cache
        cache.delete(`id-${idParam}`);

        const response = await axios.post(`http://localhost:2002/OrderServer/purchase/${idParam}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error purchasing book:', error);
        res.status(404).json({ error: 'Failed to purchase item' });
    }
});
