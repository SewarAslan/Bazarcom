const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

//for cache
const CACHE_SIZE = 10; // Maximum cache size
const cache = new Map(); // in-memory cache is integrated into the front-end 
//for replicas
let catalogReplicaIndex = 0;
let orderReplicaIndex = 0;

// function to get catalog replica URL
function getCatalogReplicaURL() {
    const replicas = ['http://catalog:2001', 'http://catalogReplica:2001'];
    const replica = replicas[catalogReplicaIndex];
    catalogReplicaIndex = (catalogReplicaIndex + 1) % replicas.length;

    //test which replica catch the request
    console.log(`Using ${replica}`); 

    return replica;
}

// function to get order replica URL
function getOrderReplicaURL() {
    const replicas = ['http://order:2002', 'http://orderReplica:2002'];
    const replica = replicas[orderReplicaIndex];
    orderReplicaIndex = (orderReplicaIndex + 1) % replicas.length;

    //test which replica catch the request
    console.log(`Using ${replica}`); 

    return replica;
}

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

// Search books by topic with caching and replication
app.get('/Bazarcom/Search/:topic', async (req, res) => {
    const topicParam = req.params.topic;
    const cacheKey = `topic-${topicParam}`;
    const catalogURL = getCatalogReplicaURL();

    //test url of replica
    console.log(catalogURL);

    // At first, Check cache 
    const cachedData = getFromCache(cacheKey);
    //data is in cache
    if (cachedData) {
        console.log('In Cache - Cache Hit');
        return res.json(cachedData);
    }
    //it is new data, so add it to cache
    else{
        console.log('Not in cache - Cache miss, so add it');
            try {
        const searchBy = "topic";
        const operation = "search";
        const response = await axios.get(`${catalogURL}/CatalogServer/query`, {
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

// Get book info by ID with caching and replication
app.get('/Bazarcom/info/:id', async (req, res) => {
    const idParam = req.params.id;
    const cacheKey = `id-${idParam}`;
    const catalogURL = getCatalogReplicaURL();

    //test url of replica
    console.log(catalogURL);


    // Check cache first
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
        console.log('In Cache - Cache Hit');
        return res.json(cachedData);
    }
    else{
        console.log('Not in cache - Cache miss, so add it');
            try {
        const searchBy = "id";
        const operation = "info";
        const response = await axios.get(`${catalogURL}/CatalogServer/query`, {
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

// Make purchase 
app.post('/Bazarcom/purchase/:id', async (req, res) => {
    try {
        const idParam = req.params.id;
        const orderURL = getOrderReplicaURL() ;
        // Invalidate cache related to this book ID/ delete item from cache
        //cache.delete(`id-${idParam}`);
        //console.log(`Done deleted item: id-${idParam}`);

        const response = await axios.post(`${orderURL}/OrderServer/purchase/${idParam}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error purchasing book:', error);
        res.status(404).json({ error: 'Failed to purchase item' });
    }
});


// Endpoint for push technique where backend replicas send invalidate requests to the in-memory cache (request cache invalidation)
app.post('/invalidateCache', (req, res) => {
    const { id } = req.body;
    const cacheKey = `id-${id}`;


    if (cache.has(cacheKey)) {
        //delete item from cache
        cache.delete(cacheKey);
        console.log(`Done deleted item with id: `+ id);

        console.log(`Cache invalidated for item with ID: ${id}`);
        res.json({ message: `Cache invalidated for item with ID: ${id}` });
    } else {
        console.log(`Item with ID ${id} not found in cache, no invalidation needed`);
        res.json({ message: `Item with ID ${id} not in cache` });
    }
});