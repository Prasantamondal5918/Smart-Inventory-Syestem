const Stock = require('../models/Stock');
const Product = require('../models/Product');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notificationHelper');

// POST /api/stock
exports.addStock = async (req, res, next) => {
  try {
    const { productId, quantity, supplier, purchaseDate, invoiceNumber, expiryDate, batchNumber } = req.body;

    const product = await Product.findOne({ _id: productId, shopId: req.user.shopId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found. A product must exist before stock can be added.',
        data: null,
      });
    }

    const qtyToAdd = Number(quantity);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer',
        data: null,
      });
    }

    const stockEntry = new Stock({
      shopId: req.user.shopId,
      branchId: req.user.branchId,
      productId: product._id,
      quantity: qtyToAdd,
      supplier: supplier || 'General Supplier',
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      invoiceNumber: invoiceNumber || '',
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      batchNumber: batchNumber || '',
      workerId: req.user._id,
    });
    await stockEntry.save();

    // Increment stock in Product
    product.stock += qtyToAdd;
    product.updatedBy = req.user._id;
    await product.save();

    await logActivity({
      userId: req.user._id,
      shopId: req.user.shopId,
      branchId: req.user.branchId,
      action: 'ADD_STOCK',
      productId: product._id,
      quantity: qtyToAdd,
      description: `Worker '${req.user.name}' added ${qtyToAdd} ${product.unit} stock for '${product.productName}'`,
      req,
    });

    if (product.stock > product.minimumStock) {
      // Create notification if restocked
      await createNotification({
        shopId: req.user.shopId,
        branchId: req.user.branchId,
        type: 'system',
        title: 'Stock Updated',
        message: `Product '${product.productName}' restocked. Current stock: ${product.stock}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Stock added successfully',
      data: {
        stockEntry,
        currentStock: product.stock,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/stock
exports.getStockLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { shopId: req.user.shopId };

    if (req.query.productId) {
      query.productId = req.query.productId;
    }

    const total = await Stock.countDocuments(query);
    const stockLogs = await Stock.find(query)
      .populate('productId', 'productName image unit minimumStock stock category barcode')
      .populate('workerId', 'name email workerId designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Stock logs fetched successfully',
      data: {
        stockLogs,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit) || 1,
          limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/stock/:productId
exports.getStockByProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.productId, shopId: req.user.shopId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null,
      });
    }

    const stockLogs = await Stock.find({ shopId: req.user.shopId, productId: product._id })
      .populate('workerId', 'name workerId designation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Stock history for product fetched successfully',
      data: {
        product,
        stockLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};
