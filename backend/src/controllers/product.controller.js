const Product = require('../models/Product');
const Sale = require('../models/Sale');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notificationHelper');
const { shopFilter, shopMatch } = require('../utils/shopQuery');

// POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const {
      productName,
      barcode,
      category,
      brand,
      purchasePrice,
      sellingPrice,
      taxPercentage,
      unit,
      minimumStock,
      description,
      initialStock,
    } = req.body;

    // ── Diagnostic logging ─────────────────────────────────────────────────
    console.log('[createProduct] Incoming request from user:', req.user?.email, '| role:', req.user?.role);
    console.log('[createProduct] shopId:', req.user?.shopId, '| branchId:', req.user?.branchId);
    console.log('[createProduct] Fields received:', {
      productName,
      barcode,
      category,
      brand,
      purchasePrice,
      sellingPrice,
      taxPercentage,
      unit,
      minimumStock,
      initialStock,
      hasFile: !!req.file,
      hasImageBody: !!req.body.image,
    });
    // ── End diagnostic logging ─────────────────────────────────────────────

    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const newStock = initialStock ? Number(initialStock) : 0;

    const product = new Product({
      shopId: req.user.shopId,
      branchId: req.user.branchId,
      productName,
      image,
      barcode: barcode || '',
      category: category || 'General',
      brand: brand || 'Generic',
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      taxPercentage: Number(taxPercentage || 0),
      unit: unit || 'pcs',
      minimumStock: Number(minimumStock || 5),
      description: description || '',
      stock: newStock,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    await product.save();

    // ── Confirm successful MongoDB write ───────────────────────────────────
    console.log('[createProduct] ✅ Saved to MongoDB! _id:', product._id, '| productName:', product.productName);
    // ── End confirmation ───────────────────────────────────────────────────

    await logActivity({
      userId: req.user._id,
      shopId: req.user.shopId,
      branchId: req.user.branchId,
      action: 'PRODUCT_CREATED',
      productId: product._id,
      description: `Added new product '${productName}' with initial stock ${newStock}`,
      req,
    });

    if (newStock <= product.minimumStock && newStock > 0) {
      await createNotification({
        shopId: req.user.shopId,
        branchId: req.user.branchId,
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `Product '${productName}' initial stock is low (${newStock} left)`,
      });
    } else if (newStock === 0) {
      await createNotification({
        shopId: req.user.shopId,
        branchId: req.user.branchId,
        type: 'out_of_stock',
        title: 'Out of Stock Alert',
        message: `Product '${productName}' is currently out of stock`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('[createProduct] ❌ FAILED to save product to MongoDB:', error.message);
    if (error.name === 'ValidationError') {
      console.error('[createProduct] Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    next(error);
  }
};

// GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, category, brand, stockStatus, branchId } = req.query;

    const query = shopFilter(req);

    if (branchId) {
      query.branchId = branchId;
    }

    if (category) {
      query.category = category;
    }

    if (brand) {
      query.brand = brand;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    if (stockStatus) {
      if (stockStatus === 'in_stock') {
        query.$expr = { $gt: ['$stock', '$minimumStock'] };
      } else if (stockStatus === 'low_stock') {
        query.$expr = {
          $and: [
            { $lte: ['$stock', '$minimumStock'] },
            { $gt: ['$stock', 0] },
          ],
        };
      } else if (stockStatus === 'out_of_stock') {
        query.stock = 0;
      }
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get categories & brands for filter dropdowns
    const categories = await Product.distinct('category', shopFilter(req));
    const brands = await Product.distinct('brand', shopFilter(req));

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit) || 1,
          limit,
        },
        meta: {
          categories,
          brands,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne(shopFilter(req, { _id: req.params.id }))
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null,
      });
    }

    // Calculate total sold quantity for this product from Sales
    const totalSoldAggregate = await Sale.aggregate([
      { $match: shopMatch(req) },
      { $unwind: '$products' },
      { $match: { 'products.productId': product._id } },
      { $group: { _id: null, totalSold: { $sum: '$products.quantity' } } },
    ]);

    const totalSold = totalSoldAggregate.length > 0 ? totalSoldAggregate[0].totalSold : 0;

    let stockStatus = 'IN STOCK';
    if (product.stock === 0) {
      stockStatus = 'OUT OF STOCK';
    } else if (product.stock <= product.minimumStock) {
      stockStatus = 'LOW STOCK';
    }

    res.status(200).json({
      success: true,
      message: 'Product details fetched',
      data: {
        product,
        totalSold,
        stockStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      shopId: req.user.shopId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null,
      });
    }

    const {
      productName,
      barcode,
      category,
      brand,
      purchasePrice,
      sellingPrice,
      taxPercentage,
      unit,
      minimumStock,
      description,
      stock,
    } = req.body;

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      product.image = req.body.image;
    }

    if (productName !== undefined) product.productName = productName;
    if (barcode !== undefined) product.barcode = barcode;
    if (category !== undefined) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (purchasePrice !== undefined) product.purchasePrice = Number(purchasePrice);
    if (sellingPrice !== undefined) product.sellingPrice = Number(sellingPrice);
    if (taxPercentage !== undefined) product.taxPercentage = Number(taxPercentage);
    if (unit !== undefined) product.unit = unit;
    if (minimumStock !== undefined) product.minimumStock = Number(minimumStock);
    if (description !== undefined) product.description = description;
    if (stock !== undefined) product.stock = Number(stock);

    product.updatedBy = req.user._id;

    await product.save();

    await logActivity({
      userId: req.user._id,
      shopId: req.user.shopId,
      branchId: req.user.branchId,
      action: 'PRODUCT_UPDATED',
      productId: product._id,
      description: `Updated product details for '${product.productName}'`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      shopId: req.user.shopId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null,
      });
    }

    await logActivity({
      userId: req.user._id,
      shopId: req.user.shopId,
      branchId: req.user.branchId,
      action: 'PRODUCT_DELETED',
      productId: product._id,
      description: `Deleted product '${product.productName}'`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
