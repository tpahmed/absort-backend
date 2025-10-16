import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  rating: Number,
  description: String,
  details: String,
  images: [String],
  variants: {
    sizes: [String],
    color: [String],
  },
  stock: [[String]],
  brand: String,
  type: [String],
  collectionId: Number,
  new: Boolean,
  best: Boolean
});

export default mongoose.model('Product', productSchema);
