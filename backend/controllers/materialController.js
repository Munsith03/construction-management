import nodemailer from 'nodemailer';
import Material from '../models/Material.js'; // Adjust path to your Material model

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail, SendGrid)
  auth: {
    user: process.env.EMAIL_USER, // Store in .env (e.g., your-email@gmail.com)
    pass: process.env.EMAIL_PASS, // Store in .env (e.g., Gmail app password)
  },
});

// Function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

// Function to send low stock email
const sendLowStockEmail = async (material) => {
  try {
    const recipient = isValidEmail(material.supplier?.email)
      ? material.supplier.email
      : process.env.ADMIN_EMAIL || 'admin@company.com';
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: `Low Stock Alert: ${material.name}`,
      text: `Material "${material.name}" is low on stock.\nCurrent Quantity: ${material.quantity} ${material.unitOfMeasurement}\nMinimum Stock Threshold: ${material.minimumStockThreshold}\nSupplier: ${material.supplier?.name || 'N/A'}\nContact: ${material.supplier?.contact || 'N/A'}\nPlease restock soon.`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #12161C; color: #ffffff; padding: 20px;">
          <h2 style="color: #F5C242;">Low Stock Alert</h2>
          <p><strong>Material:</strong> ${material.name}</p>
          <p><strong>Current Quantity:</strong> ${material.quantity} ${material.unitOfMeasurement}</p>
          <p><strong>Minimum Stock Threshold:</strong> ${material.minimumStockThreshold}</p>
          <p><strong>Supplier:</strong> ${material.supplier?.name || 'N/A'}</p>
          <p><strong>Contact:</strong> ${material.supplier?.contact || 'N/A'}</p>
          <p style="color: #F5C242;">Please restock soon.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending low stock email:', error);
    return false;
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      quantity,
      unitOfMeasurement,
      unitPrice,
      supplier,
      minimumStockThreshold,
      location,
      purchaseDate,
    } = req.body;

    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Store previous quantity and notified status
    const previousQuantity = material.quantity;
    const wasNotified = material.notified || false;

    // Update fields
    material.name = name || material.name;
    material.description = description || material.description;
    material.category = category || material.category;
    material.quantity = quantity !== undefined ? quantity : material.quantity;
    material.unitOfMeasurement = unitOfMeasurement || material.unitOfMeasurement;
    material.unitPrice = unitPrice !== undefined ? unitPrice : material.unitPrice;
    material.supplier = supplier || material.supplier;
    material.minimumStockThreshold = minimumStockThreshold !== undefined ? minimumStockThreshold : material.minimumStockThreshold;
    material.location = location || material.location;
    material.purchaseDate = purchaseDate || material.purchaseDate;

    // Check low stock status
    const isLowStock = material.quantity < material.minimumStockThreshold;
    const wasLowStock = previousQuantity < material.minimumStockThreshold;

    // Send email if newly low stock
    if (isLowStock && (!wasNotified || !wasLowStock)) {
      const emailSent = await sendLowStockEmail(material);
      if (emailSent) {
        material.notified = true; // Mark as notified
      }
    } else if (!isLowStock && wasNotified) {
      // Reset notified flag if stock is replenished
      material.notified = false;
    }

    const updatedMaterial = await material.save();
    return res.status(200).json(updatedMaterial);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Expose sendLowStockEmail endpoint for frontend
const sendLowStockEmailEndpoint = async (req, res) => {
  try {
    const { materialName, quantity, unit, supplier, minimumStockThreshold } = req.body;
    const emailSent = await sendLowStockEmail({
      name: materialName,
      quantity,
      unitOfMeasurement: unit,
      supplier,
      minimumStockThreshold,
    });
    if (emailSent) {
      return res.status(200).json({ message: 'Low stock email sent' });
    }
    return res.status(500).json({ message: 'Failed to send low stock email' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new material
// @access  Public
export const createMaterial = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      quantity,
      unitOfMeasurement,
      unitPrice,
      supplier,
      minimumStockThreshold,
      location,
      purchaseDate,
    } = req.body;

    // Basic validation
    if (!name || !category || !quantity || !unitOfMeasurement || !unitPrice || !supplier?.name || !location) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const material = new Material({
      name,
      description,
      category,
      quantity,
      unitOfMeasurement,
      unitPrice,
      supplier,
      minimumStockThreshold: minimumStockThreshold || 10,
      location,
      purchaseDate: purchaseDate || Date.now(),
    });

    const savedMaterial = await material.save();
    res.status(201).json(savedMaterial);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all materials with filtering, sorting, and pagination
// @access  Public
export const getAllMaterials = async (req, res) => {
  try {
    const { category, stockStatus, location, page = 1, limit = 10, sort = 'name' } = req.query;

    // Build query
    const query = {};
    if (category) query.category = category;
    if (stockStatus) query.stockStatus = stockStatus;
    if (location) query.location = location;

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOption = sort.startsWith('-') ? { [sort.slice(1)]: -1 } : { [sort]: 1 };

    const materials = await Material.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Material.countDocuments(query);

    res.status(200).json({
      materials,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single material by ID
// @access  Public
// @access  Public
export const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(200).json(material);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




// @access  Public
export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(204).send(); // Use 204 No Content to match client-side expectation
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};