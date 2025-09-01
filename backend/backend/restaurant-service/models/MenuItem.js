import { Schema, model } from 'mongoose';

const MenuItemSchema = new Schema({
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [100, 'Menu item name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },

  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['appetizer', 'main', 'dessert', 'beverage', 'side'],
      message: 'Invalid category',
    },
  },
  cuisineType: {
    type: String,
    trim: true,
    maxlength: [50, 'Cuisine type cannot exceed 50 characters'],
  },
  image: {
    type: String,
    default: '',
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

MenuItemSchema.index({ restaurant: 1, category: 1 });

export default model('MenuItem', MenuItemSchema);
