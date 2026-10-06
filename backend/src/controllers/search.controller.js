const Product = require('../models/Product');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');

// GET /api/search?q=
exports.globalSearch = async (req, res, next) => {
  try {
    const q = req.query.q;
    if (!q || q.trim() === '') {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
          workers: [],
          invoices: [],
          customers: [],
        },
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    const shopId = req.user.shopId;

    // Search Products
    const products = await Product.find({
      shopId,
      $or: [
        { productName: searchRegex },
        { barcode: searchRegex },
        { category: searchRegex },
        { brand: searchRegex },
      ],
    }).limit(6);

    // Search Workers (Owner can search, workers search empty)
    let workers = [];
    if (req.user.role === 'owner') {
      workers = await User.find({
        shopId,
        role: 'worker',
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { workerId: searchRegex },
          { designation: searchRegex },
        ],
      })
        .select('-password')
        .limit(6);
    }

    // Search Invoices / Sales
    const invoices = await Sale.find({
      shopId,
      $or: [
        { invoiceNo: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.phone': searchRegex },
      ],
    }).limit(6);

    // Search Customers
    const customers = await Customer.find({
      shopId,
      $or: [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
      ],
    }).limit(6);

    res.status(200).json({
      success: true,
      message: 'Global search completed',
      data: {
        products,
        workers,
        invoices,
        customers,
      },
    });
  } catch (error) {
    next(error);
  }
};
