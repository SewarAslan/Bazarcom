const data = require('../DB');
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.listen(1002, () => {
    console.log('Order service is running on port 1002');
});

app.post('/OrderServer/purchase/:itemNumber', async (req, res) => {
     const itemNumber = req.params.itemNumber;

    try {
        const response = await axios.get('http://localhost:1001/CatalogServer/query', {
            params: { searchBy: 'id', idParam: itemNumber }
        });
            
       //Check if the item is in stock
       const item = response.data[0];  // Access the first item in the array
       
        if (item.quantity > 0) {
           
            const updateResponse = await axios.put(`http://localhost:1001/CatalogServer/updateStock/${itemNumber}`);
            
            res.json({ message: `Successfully purchased item: ${item.title}`, remainingStock: updateResponse.data.item.stock });
        } else {
            
            res.status(400).json({ error: 'Item is out of stock', item });
        }
        
    }
    catch(error){
        console.error('Error querying or updating the catalog server:', error);
        res.status(500).json({ error: 'Failed to purchase item. Please try again later.' });
    }
}
)
