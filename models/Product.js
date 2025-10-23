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
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  stock: [[String]],
  brand: String,
  type: [String],
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],
  new: Boolean,
  best: Boolean
});

export default mongoose.model('Product', productSchema);
