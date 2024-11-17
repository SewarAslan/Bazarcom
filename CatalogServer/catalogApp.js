const data = require('./DB');
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.listen(1001, () => {
    console.log(`CatalogServer is running on port 1001`);
});
//search books by topic
app.get('/CatalogServer/query', async (req, res) => {
    console.log('In catalogServer ...');
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
            console.log("Fetched successfully");
            console.log(bookInfo);
        } else {
            res.status(404).json({ message: 'No books found for the given topic' });
        }
      
    }
    else if(searchBy=="id"){
     
        const id=req.query.idParam;
        const opertaion=req.query.opertaion;
        const filteredDB=data.filter(book => book.id === id);
        if(filteredDB.length > 0 ){
            const bookInfo = filteredDB.map(book => {
                return { title: book.title, quantity: book.stock,price: book.cost };
            });

            if(opertaion=="info"){
                console.log("Fetched successfully");
                console.log(bookInfo);
            }

            res.json(bookInfo);  // Return only id and topic

            
           
        } else {
            res.status(404).json({ message: 'No books has this id', cause: 'not found' });
        }

    }
    } catch (error) {
        console.error(error);
        console.error('Error fetching data from database:', error);// Send error response to the client
        res.status(500).json({ error: ' Error fetching data from database:' }); 
    }
});

// Handle purchase and update stock
app.put('/CatalogServer/updateStock/:itemNumber', async (req, res) => {
    try {
        const itemNumber = req.params.itemNumber;
        const item = data.find(book => book.id === itemNumber);

        catalogURl=req.body.catalogURl;      
        console.log("ensure: " + catalogURl);

        if(catalogURl == "http://catalog:1001") {
            sendTo = "http://catalogReplica:1001";
            console.log("sendToReplica: " + sendTo);
        } else if(catalogURl == "http://catalogReplica:1001") {
            sendTo = "http://catalog:1001";
            console.log("sendToOrigin: " + sendTo);
        }

        
        // Check if the item exists
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Update stock (decrement by 1)
        if (item.stock > 0) {
            item.stock -= 1;


            console.log(`Stock updated successfully. Remaining stock: ${item.stock}.`);
            console.log('Item:',JSON.stringify(item));
            res.json({ message: `Stock updated successfully. Remaining stock: ${item.stock}`, item });
           
              // Notify other replicas about the stock update
              try {
                // Notify catalog replica about the update
                await axios.put(`${sendTo}/CatalogServer/updateReplicaStock/${itemNumber}`, { stock: item.stock });

                // Notify the frontend about cache invalidation
                await axios.post('http://frontend:1000/invalidateCache', { id: itemNumber });
            } catch (error) {
                console.error('Error notifying replicas or cache invalidation:', error);
            }


        } else {
            // Item is out of stock
            res.status(500).json({ error: 'Item is out of stock', item });
        }

    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ error: 'Failed to update stock. Please try again later.' });
    }
});

app.put('/CatalogServer/updateReplicaStock/:itemNumber', (req, res) => {
    const itemNumber = req.params.itemNumber;
    const { stock } = req.body;
    const item = data.find(book => book.id === itemNumber);

    if (item) {
        item.stock = stock;
        console.log(`stock updated for item ${itemNumber}. New stock: ${item.stock}`);
        res.json({ message: `Stock updated for item ${itemNumber}` });
    } else {
        res.status(404).json({ message: 'Item not found on replica' });
    }
});
