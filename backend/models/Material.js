import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true,
    maxlength: [100, 'Material name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['cement', 'steel', 'wood', 'bricks', 'sand', 'gravel', 'paint', 'other'],
      message: '{VALUE} is not a valid category',
    },
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
  },
  unitOfMeasurement: {
    type: String,
    required: [true, 'Unit of measurement is required'],
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative'],
  },
  totalCost: {
    type: Number,
    default: function () {
      return this.quantity * this.unitPrice;
    },
  },
  supplier: {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid contact number'],
    },
    email: {
      type: String,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
  },
  stockStatus: {
    type: String,
    enum: {
      values: ['in_stock', 'low_stock', 'out_of_stock'],
      message: '{VALUE} is not a valid stock status',
    },
    default: 'in_stock',
  },
  minimumStockThreshold: {
    type: Number,
    default: 10,
    min: [0, 'Minimum stock threshold cannot be negative'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    enum: {
      values: ['warehouse', 'site_a', 'site_b', 'site_c', 'other'],
      message: '{VALUE} is not a valid location',
    },
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Update totalCost before saving if quantity or unitPrice changes
materialSchema.pre('save', function (next) {
  this.totalCost = this.quantity * this.unitPrice;
  this.lastUpdated = Date.now();
  
  // Update stock status based on quantity and minimum threshold
  if (this.quantity === 0) {
    this.stockStatus = 'out_of_stock';
  } else if (this.quantity <= this.minimumStockThreshold) {
    this.stockStatus = 'low_stock';
  } else {
    this.stockStatus = 'in_stock';
  }
  next();
});

const Material = mongoose.model('Material', materialSchema);

export default Material;