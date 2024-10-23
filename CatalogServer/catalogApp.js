const data = require('../DB');
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.listen(1001, () => {
    console.log(`CatalogServer is running on port 1001`);
});
//search books by topic
app.get('/CatalogServer/query', async (req, res) => {
    try {
       
      const searchBy=req.query.searchBy;  

      if(searchBy=="topic"){
        const topic=req.query.topicParam;

        const filteredDB=data.filter(book => book.topic === topic);
        if(filteredDB.length > 0 ){
            const bookInfo = filteredDB.map(book => {
                return { id: book.id, topic: book.topic };
            });
            res.json(bookInfo);  // Return only id and topic
        } else {
            res.status(404).json({ message: 'No books found for the given topic', cause: 'not found' });
        }
      
    }
    else if(searchBy=="id"){
     
        const id=req.query.idParam;
        const filteredDB=data.filter(book => book.id === id);
        if(filteredDB.length > 0 ){
            const bookInfo = filteredDB.map(book => {
                return { title: book.title, quantity: book.stock,price: book.cost };
            });
            res.json(bookInfo);  // Return only id and topic
        } else {
            res.status(404).json({ message: 'No books has this id', cause: 'not found' });
        }

    }
    } catch (error) {
        console.error(error);
        console.error('Error fetching data from catalog service:', error);// Send error response to the client
        res.status(404).json({ error: ' Not Found!' }); 
    }
});

//search books by id
/*app.get('/CatalogServer/query', async (req, res) => {
    try {
      
      if(searchBy=="id"){
       
      
    }
    } catch (error) {
        console.error(error);
        console.error('Error fetching data from catalog service:', error);// Send error response to the client
        res.status(404).json({ error: ' Not Found!' }); 
    }
});
*/