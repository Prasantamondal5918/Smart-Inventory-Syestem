const Sale = require('../models/Sale');
const Product = require('../models/Product');

// GET /api/reports/summary
exports.getReportSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, category, cashierId } = req.query;
    const shopId = req.user.shopId;

    const matchQuery = { shopId };

    if (cashierId) {
      matchQuery.cashier = new (require('mongoose').Types.ObjectId)(cashierId);
    }

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const eod = new Date(endDate);
        eod.setHours(23, 59, 59, 999);
        matchQuery.createdAt.$lte = eod;
      }
    }

    // 1. Overall Sales & Profit Aggregation
    const salesAgg = await Sale.aggregate([
      { $match: matchQuery },
      { $unwind: '$products' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$products.subtotal' },
          totalTax: { $sum: '$products.tax' },
          totalUnitsSold: { $sum: '$products.quantity' },
          totalCost: { $sum: { $multiply: ['$products.purchasePrice', '$products.quantity'] } },
        },
      },
    ]);

    const stats = salesAgg.length > 0 ? salesAgg[0] : { totalRevenue: 0, totalTax: 0, totalUnitsSold: 0, totalCost: 0 };
    const netProfit = stats.totalRevenue - stats.totalCost;

    // 2. Category-wise Sales
    const categoryAgg = await Sale.aggregate([
      { $match: matchQuery },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$productDetails.category',
          categoryName: { $first: { $ifNull: ['$productDetails.category', 'Uncategorized'] } },
          totalRevenue: { $sum: '$products.subtotal' },
          totalSold: { $sum: '$products.quantity' },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // 3. Cashier/Worker Performance
    const workerAgg = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$cashier',
          totalSales: { $sum: '$total' },
          totalInvoices: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'workerDetails',
        },
      },
      { $unwind: { path: '$workerDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          workerName: '$workerDetails.name',
          workerId: '$workerDetails.workerId',
          designation: '$workerDetails.designation',
          totalSales: 1,
          totalInvoices: 1,
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    // 4. Most & Least Selling Products
    const productSalesAgg = await Sale.aggregate([
      { $match: matchQuery },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          productName: { $first: '$products.productName' },
          totalQuantity: { $sum: '$products.quantity' },
          totalRevenue: { $sum: '$products.subtotal' },
          costOfGoods: { $sum: { $multiply: ['$products.purchasePrice', '$products.quantity'] } },
        },
      },
      {
        $project: {
          productName: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          profit: { $subtract: ['$totalRevenue', '$costOfGoods'] },
        },
      },
      { $sort: { totalQuantity: -1 } },
    ]);

    const mostSelling = productSalesAgg.slice(0, 5);
    const leastSelling = [...productSalesAgg].reverse().slice(0, 5);

    // 5. Payment Method Breakdown
    const paymentMethodAgg = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'Report summary calculated successfully',
      data: {
        summary: {
          totalRevenue: Number(stats.totalRevenue.toFixed(2)),
          totalCost: Number(stats.totalCost.toFixed(2)),
          netProfit: Number(netProfit.toFixed(2)),
          totalUnitsSold: stats.totalUnitsSold,
          totalTax: Number(stats.totalTax.toFixed(2)),
        },
        categoryBreakdown: categoryAgg,
        workerPerformance: workerAgg,
        mostSelling,
        leastSelling,
        paymentMethods: paymentMethodAgg,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/export - Export Sales Report to CSV format
exports.exportReportCSV = async (req, res, next) => {
  try {
    const shopId = req.user.shopId;
    const sales = await Sale.find({ shopId })
      .populate('cashier', 'name workerId')
      .sort({ createdAt: -1 });

    let csvContent = 'Invoice No,Date,Cashier,Customer,Payment Method,Subtotal,Discount,Tax,Total\n';

    sales.forEach((s) => {
      const date = new Date(s.createdAt).toLocaleDateString();
      const cashierName = s.cashier ? s.cashier.name : 'N/A';
      const customerName = s.customer ? s.customer.name : 'Walk-in';
      csvContent += `"${s.invoiceNo}","${date}","${cashierName}","${customerName}","${s.paymentMethod}",${s.subtotal},${s.discount},${s.tax},${s.total}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-report.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
