import { Schema, model } from 'mongoose';

const RestaurantSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  businessType: {
    type: String,
    required: [true, 'Please select a business type'],
    enum: {
      values: [
        'restaurant',
        'convenience',
        'grocery',
        'specialty',
        'liquor',
        'florist',
        'pharmacy',
      ],
      message: 'Invalid business type',
    },
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
  },
  countryCode: {
    type: String,
    required: [true, 'Please select a country code'],
    trim: true,
  },
  streetAddress: {
    type: String,
    required: [true, 'Please provide a street address'],
    trim: true,
    maxlength: [100, 'Street address cannot exceed 100 characters'],
  },
  zipcode: {
    type: String,
    required: [true, 'Please provide a zipcode'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'Please provide a city'],
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters'],
  },
  state: {
    type: String,
    required: [true, 'Please provide a state'],
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters'],
  },
  floorSuite: {
    type: String,
    trim: true,
    maxlength: [20, 'Floor/Suite cannot exceed 20 characters'],
  },
  storeName: {
    type: String,
    required: [true, 'Please provide a store name'],
    trim: true,
    maxlength: [100, 'Store name cannot exceed 100 characters'],
    index: true,
  },
  brandName: {
    type: String,
    required: [true, 'Please provide a brand name'],
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters'],
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  image: { type: String, trim: true },
});

// Compound index for common queries
RestaurantSchema.index({ owner: 1, storeName: 1 });
RestaurantSchema.index({ zipcode: 1, city: 1 });

export default model('Restaurant', RestaurantSchema);
