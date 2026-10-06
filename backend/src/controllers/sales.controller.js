const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notificationHelper');
const { shopFilter, shopMatch } = require('../utils/shopQuery');

// POST /api/sales - Complete Sale / Checkout
exports.createSale = async (req, res, next) => {
  try {
    const { products: cartItems, discount = 0, customer = {}, paymentMethod = 'cash' } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. At least one product is required to checkout.',
        data: null,
      });
    }

    const processedProducts = [];
    let calculatedSubtotal = 0;
    let calculatedTax = 0;

    // Validate stock and recalculate backend monetary values
    for (const item of cartItems) {
      const dbProduct = await Product.findOne({
        _id: item.productId,
        shopId: req.user.shopId,
      });

      if (!dbProduct) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found in inventory`,
          data: null,
        });
      }

      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product '${dbProduct.productName}'`,
          data: null,
        });
      }

      // Check stock
      if (dbProduct.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${dbProduct.productName}'. Available: ${dbProduct.stock}, Requested: ${qty}`,
          data: null,
        });
      }

      const lineSubtotal = dbProduct.sellingPrice * qty;
      const lineTax = ((dbProduct.sellingPrice * (dbProduct.taxPercentage || 0)) / 100) * qty;

      calculatedSubtotal += lineSubtotal;
      calculatedTax += lineTax;

      processedProducts.push({
        productId: dbProduct._id,
        productName: dbProduct.productName,
        quantity: qty,
        price: dbProduct.sellingPrice,
        purchasePrice: dbProduct.purchasePrice,
        tax: lineTax,
        subtotal: lineSubtotal,
        dbProductRef: dbProduct, // Keep reference for stock reduction
      });
    }

    const discountAmount = Math.max(0, Number(discount) || 0);
    const calculatedTotal = Math.max(0, calculatedSubtotal + calculatedTax - discountAmount);

    // Generate unique invoice number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNo = `INV-${dateStr}-${randomSuffix}`;

    const newSale = new Sale({
      invoiceNo,
      shopId: req.user.shopId,
      branchId: req.user.branchId,
      products: processedProducts.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        quantity: p.quantity,
        price: p.price,
        purchasePrice: p.purchasePrice,
        tax: p.tax,
        subtotal: p.subtotal,
      })),
      subtotal: Number(calculatedSubtotal.toFixed(2)),
      discount: Number(discountAmount.toFixed(2)),
      tax: Number(calculatedTax.toFixed(2)),
      total: Number(calculatedTotal.toFixed(2)),
      cashier: req.user._id,
      customer: {
        name: customer.name || 'Walk-in Customer',
        phone: customer.phone || '',
        address: customer.address || '',
      },
      paymentMethod,
    });

    await newSale.save();

    // Reduce product stock and check stock status
    for (const item of processedProducts) {
      const product = item.dbProductRef;
      product.stock -= item.quantity;
      await product.save();

      if (product.stock === 0) {
        await createNotification({
          shopId: req.user.shopId,
          branchId: req.user.branchId,
          type: 'out_of_stock',
          title: 'Out of Stock Alert',
          message: `Product '${product.productName}' is now out of stock following sale #${invoiceNo}`,
        });
      } else if (product.stock <= product.minimumStock) {
        await createNotification({
          shopId: req.user.shopId,
          branchId: req.user.branchId,
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: `Product '${product.productName}' has low stock (${product.stock} ${product.unit} remaining)`,
        });
      }
    }

    // Upsert Customer if phone provided
    if (customer.phone && customer.phone.trim() !== '') {
      await Customer.findOneAndUpdate(
        { shopId: req.user.shopId, phone: customer.phone.trim() },
        {
          name: customer.name || 'Customer',
          email: customer.email || '',
          address: customer.address || '',
        },
        { upsert: true, new: true }
      );
    }

    await logActivity({
      userId: req.user._id,
      shopId: req.user.shopId,
      branchId: req.user.branchId,
      action: 'COMPLETE_SALE',
      description: `Completed sale #${invoiceNo} for total $${calculatedTotal.toFixed(2)} (${paymentMethod.toUpperCase()})`,
      req,
    });

    if (calculatedTotal >= 1000) {
      await createNotification({
        shopId: req.user.shopId,
        branchId: req.user.branchId,
        type: 'large_sale',
        title: 'Large Sale Completed',
        message: `High value sale #${invoiceNo} completed: $${calculatedTotal.toFixed(2)}`,
      });
    }

    const populatedSale = await Sale.findById(newSale._id)
      .populate('cashier', 'name email workerId designation')
      .populate('shopId', 'shopName email phone address gstNumber logo');

    res.status(201).json({
      success: true,
      message: 'Sale completed and invoice generated successfully',
      data: populatedSale,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/sales - List sales with search and filtering
exports.getSales = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, cashier, paymentMethod, startDate, endDate, branchId } = req.query;

    const query = { shopId: req.user.shopId };

    if (branchId) {
      query.branchId = branchId;
    }

    if (cashier) {
      query.cashier = cashier;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (search) {
      query.$or = [
        { invoiceNo: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const eod = new Date(endDate);
        eod.setHours(23, 59, 59, 999);
        query.createdAt.$lte = eod;
      }
    }

    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .populate('cashier', 'name email workerId designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Sales history retrieved successfully',
      data: {
        sales,
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

// GET /api/sales/:id - Invoice view
exports.getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findOne({
      $or: [{ _id: req.params.id }, { invoiceNo: req.params.id }],
      shopId: req.user.shopId,
    })
      .populate('cashier', 'name email workerId designation')
      .populate('shopId', 'shopName email phone address gstNumber logo businessType');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Invoice/Sale not found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sale details retrieved',
      data: sale,
    });
  } catch (error) {
    next(error);
  }
};
