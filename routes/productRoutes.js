import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Route to GET all products with specific fields
router.get('/', async (req, res) => {
  try {
    // We use the aggregation pipeline to select and rename fields.
    // $project allows us to shape the output document.
    const products = await Product.aggregate([
      {
        $project: {
          id: '$_id',      // Rename the default '_id' to 'id'
          _id: 1,          // Exclude the original '_id' field
          images: 1,       // Include the 'images' field
          collections: 1,  // Include the 'collections' field
          title: 1,        // Include the 'title' field
          price: 1,        // Include the 'price' field
          new: 1,          // Include the 'new' field
          best: 1,         // Include the 'best' field
          variants: 1,     // Include the 'variants' field
          stock: 1         // Include the 'stock' field
        }
      }
    ]);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Route to GET a single product's details by its ID
router.get('/:id', async (req, res) => {
  try {
    // Find the product by the ID provided in the URL parameters
    const product = await Product.findById(req.params.id);
    
    // If no product is found, return a 404 Not Found error
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    // Handle potential errors, like an invalid ID format
    res.status(500).json({ message: 'Error fetching product details', error: error.message });
  }
});

export default router;