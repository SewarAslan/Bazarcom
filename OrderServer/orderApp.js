//const data = require('../CatalogServer/DB');
const ordersList = require('./orders');
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.listen(2002, () => {
    console.log('Order server is running on port 2002');
});

app.post('/OrderServer/purchase/:itemNumber', async (req, res) => {
    console.log('iam in order originn');

     const itemNumber = req.params.itemNumber;
     const opertaion="order";
    try {
        const response = await axios.get('http://catalog:2001/CatalogServer/query', {
            params: { searchBy: 'id', idParam: itemNumber, opertaion:opertaion }
        });
            
       //Check if the item is in stock
       const item = response.data[0];  // Access the first item in the array
       
        if (item.quantity > 0) {
            
            const updateResponse = await axios.put(`http://catalog:2001/CatalogServer/updateStock/${itemNumber}`);

            // Add to ordersList
            const order = {
                orderNumber: ordersList.length + 1, // Incremental series number
                bookId: itemNumber,
                title: item.title,
                remaining_quantity:updateResponse.data.item.stock
            };
            ordersList.push(order); // Add the new order to the list 
            
           // Print messages in sequence
           console.log(`Successfully purchased item: ${item.title}`);
           console.log('The orders list in origin:');
           console.log(JSON.stringify(ordersList, null, 2));

           res.json({ message: `Successfully purchased item: ${item.title}`, remainingStock: updateResponse.data.item.stock, ordersList: ordersList });

           
        } else {
            console.error(`Item is out of stock`, item);
            res.status(500).json({ error: 'Item is out of stock', item });
        }
        
    }
    catch(error){
        console.error('Error querying or updating the database, Book not found:', error);
        res.status(404).json({ error: 'Failed to purchase item, not found. Please try again later.' });
    }
}
)
