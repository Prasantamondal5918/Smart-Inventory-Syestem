const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Stock = require('../models/Stock');
const { toObjectId } = require('../utils/shopQuery');

/**
 * Build base match object scoped to the authenticated user's shop (and branch for workers).
 */
const buildBaseMatch = (user, dateFilter = {}) => {
  const match = { shopId: toObjectId(user.shopId) };
  if (user.role === 'worker' && user.branchId) {
    match.branchId = toObjectId(user.branchId);
  }
  if (dateFilter.startDate || dateFilter.endDate) {
    match.createdAt = {};
    if (dateFilter.startDate) match.createdAt.$gte = new Date(dateFilter.startDate);
    if (dateFilter.endDate) {
      const eod = new Date(dateFilter.endDate);
      eod.setHours(23, 59, 59, 999);
      match.createdAt.$lte = eod;
    }
  }
  return match;
};

/**
 * getSalesSummary – total revenue, cost, gross profit, units sold, invoice count
 * for a given date range.
 */
const getSalesSummary = async (user, startDate, endDate) => {
  const match = buildBaseMatch(user, { startDate, endDate });

  const [salesAgg] = await Sale.aggregate([
    { $match: match },
    { $unwind: '$products' },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$products.subtotal' },
        totalCost: { $sum: { $multiply: ['$products.purchasePrice', '$products.quantity'] } },
        totalUnitsSold: { $sum: '$products.quantity' },
        totalDiscount: { $sum: '$discount' },
        totalTax: { $sum: '$products.tax' },
        invoiceCount: { $sum: 1 },
      },
    },
  ]);

  // Separate group for invoice count (products is unwound above)
  const [invoiceCountAgg] = await Sale.aggregate([
    { $match: match },
    { $group: { _id: null, invoiceCount: { $sum: 1 }, totalRevenue: { $sum: '$total' } } },
  ]);

  if (!salesAgg) {
    return {
      totalRevenue: 0,
      totalCost: 0,
      grossProfit: 0,
      grossMarginPercent: 0,
      totalUnitsSold: 0,
      totalDiscount: 0,
      totalTax: 0,
      invoiceCount: 0,
      dateRange: { startDate: startDate || null, endDate: endDate || null },
      hasData: false,
    };
  }

  const grossProfit = salesAgg.totalRevenue - salesAgg.totalCost;
  const grossMarginPercent =
    salesAgg.totalRevenue > 0
      ? Number(((grossProfit / salesAgg.totalRevenue) * 100).toFixed(2))
      : 0;

  return {
    totalRevenue: Number(salesAgg.totalRevenue.toFixed(2)),
    totalCost: Number(salesAgg.totalCost.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    grossMarginPercent,
    totalUnitsSold: salesAgg.totalUnitsSold,
    totalDiscount: Number((salesAgg.totalDiscount || 0).toFixed(2)),
    totalTax: Number(salesAgg.totalTax.toFixed(2)),
    invoiceCount: invoiceCountAgg ? invoiceCountAgg.invoiceCount : 0,
    dateRange: { startDate: startDate || null, endDate: endDate || null },
    hasData: true,
  };
};

/**
 * compareSalesPeriods – compare two date ranges side by side.
 */
const compareSalesPeriods = async (user, currentStart, currentEnd, previousStart, previousEnd) => {
  const [current, previous] = await Promise.all([
    getSalesSummary(user, currentStart, currentEnd),
    getSalesSummary(user, previousStart, previousEnd),
  ]);

  const revenueDiff = current.totalRevenue - previous.totalRevenue;
  const revenueChangePercent =
    previous.totalRevenue > 0
      ? Number(((revenueDiff / previous.totalRevenue) * 100).toFixed(2))
      : null;

  return {
    currentPeriod: { ...current, label: `${currentStart} to ${currentEnd}` },
    previousPeriod: { ...previous, label: `${previousStart} to ${previousEnd}` },
    comparison: {
      revenueDiff: Number(revenueDiff.toFixed(2)),
      revenueChangePercent,
      profitDiff: Number((current.grossProfit - previous.grossProfit).toFixed(2)),
      unitsDiff: current.totalUnitsSold - previous.totalUnitsSold,
    },
  };
};

/**
 * getTopSellingProducts – ranked by units sold or revenue.
 */
const getTopSellingProducts = async (user, startDate, endDate, limit = 10) => {
  const safeLimit = Math.min(Number(limit) || 10, 50);
  const match = buildBaseMatch(user, { startDate, endDate });

  const results = await Sale.aggregate([
    { $match: match },
    { $unwind: '$products' },
    {
      $group: {
        _id: '$products.productId',
        productName: { $first: '$products.productName' },
        totalUnitsSold: { $sum: '$products.quantity' },
        totalRevenue: { $sum: '$products.subtotal' },
        totalCost: { $sum: { $multiply: ['$products.purchasePrice', '$products.quantity'] } },
        avgSellingPrice: { $avg: '$products.price' },
      },
    },
    {
      $addFields: {
        grossProfit: { $subtract: ['$totalRevenue', '$totalCost'] },
        grossMarginPercent: {
          $cond: [
            { $gt: ['$totalRevenue', 0] },
            {
              $multiply: [
                { $divide: [{ $subtract: ['$totalRevenue', '$totalCost'] }, '$totalRevenue'] },
                100,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { totalUnitsSold: -1 } },
    { $limit: safeLimit },
  ]);

  return results.map((r) => ({
    productId: r._id,
    productName: r.productName,
    totalUnitsSold: r.totalUnitsSold,
    totalRevenue: Number(r.totalRevenue.toFixed(2)),
    grossProfit: Number(r.grossProfit.toFixed(2)),
    grossMarginPercent: Number(r.grossMarginPercent.toFixed(2)),
    avgSellingPrice: Number(r.avgSellingPrice.toFixed(2)),
  }));
};

/**
 * getSlowMovingProducts – products with zero or very few sales in the last N days.
 */
const getSlowMovingProducts = async (user, days = 30, limit = 20) => {
  const safeDays = Math.min(Number(days) || 30, 365);
  const safeLimit = Math.min(Number(limit) || 20, 50);
  const shopIdObj = toObjectId(user.shopId);
  const branchFilter =
    user.role === 'worker' && user.branchId ? { branchId: toObjectId(user.branchId) } : {};

  const since = new Date();
  since.setDate(since.getDate() - safeDays);
  since.setHours(0, 0, 0, 0);

  // Products that exist in the shop
  const allProducts = await Product.find({
    shopId: shopIdObj,
    ...branchFilter,
    stock: { $gt: 0 },
  })
    .select('_id productName category brand stock minimumStock sellingPrice purchasePrice unit')
    .lean();

  if (!allProducts.length) return [];

  // Sales for those products in the window
  const soldProductIds = await Sale.aggregate([
    {
      $match: {
        shopId: shopIdObj,
        ...branchFilter,
        createdAt: { $gte: since },
      },
    },
    { $unwind: '$products' },
    {
      $group: {
        _id: '$products.productId',
        totalSold: { $sum: '$products.quantity' },
      },
    },
  ]);

  const soldMap = {};
  soldProductIds.forEach((p) => {
    soldMap[p._id.toString()] = p.totalSold;
  });

  const slowMovers = allProducts
    .map((p) => ({
      ...p,
      unitsSoldInPeriod: soldMap[p._id.toString()] || 0,
      daysAnalyzed: safeDays,
    }))
    .filter((p) => p.unitsSoldInPeriod === 0 || p.unitsSoldInPeriod < 3)
    .sort((a, b) => a.unitsSoldInPeriod - b.unitsSoldInPeriod)
    .slice(0, safeLimit);

  return slowMovers;
};

/**
 * getLowStockProducts – products at or below minimum stock threshold.
 */
const getLowStockProducts = async (user) => {
  const shopIdObj = toObjectId(user.shopId);
  const branchFilter =
    user.role === 'worker' && user.branchId ? { branchId: toObjectId(user.branchId) } : {};

  const lowStock = await Product.find({
    shopId: shopIdObj,
    ...branchFilter,
    $expr: { $lte: ['$stock', '$minimumStock'] },
  })
    .select('productName category brand stock minimumStock unit sellingPrice purchasePrice')
    .sort({ stock: 1 })
    .limit(50)
    .lean();

  return lowStock.map((p) => ({
    ...p,
    stockDeficit: p.minimumStock - p.stock,
    isOutOfStock: p.stock === 0,
  }));
};

/**
 * getStockoutRiskProducts – products that may run out soon based on sales velocity.
 */
const getStockoutRiskProducts = async (user) => {
  const shopIdObj = toObjectId(user.shopId);
  const branchFilter =
    user.role === 'worker' && user.branchId ? { branchId: toObjectId(user.branchId) } : {};

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Sales velocity per product (last 30 days)
  const velocityAgg = await Sale.aggregate([
    {
      $match: {
        shopId: shopIdObj,
        ...branchFilter,
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    { $unwind: '$products' },
    {
      $group: {
        _id: '$products.productId',
        productName: { $first: '$products.productName' },
        totalSold30Days: { $sum: '$products.quantity' },
      },
    },
    {
      $addFields: {
        dailySalesRate: { $divide: ['$totalSold30Days', 30] },
      },
    },
  ]);

  if (!velocityAgg.length) return [];

  // Get current stock for those products
  const productIds = velocityAgg.map((v) => v._id);
  const products = await Product.find({
    _id: { $in: productIds },
    shopId: shopIdObj,
    stock: { $gt: 0 },
  })
    .select('_id productName stock minimumStock unit category sellingPrice')
    .lean();

  const productMap = {};
  products.forEach((p) => {
    productMap[p._id.toString()] = p;
  });

  const risks = velocityAgg
    .filter((v) => productMap[v._id.toString()])
    .map((v) => {
      const p = productMap[v._id.toString()];
      const daysUntilStockout =
        v.dailySalesRate > 0 ? Math.floor(p.stock / v.dailySalesRate) : null;

      return {
        productId: v._id,
        productName: p.productName,
        currentStock: p.stock,
        minimumStock: p.minimumStock,
        unit: p.unit,
        category: p.category,
        sellingPrice: p.sellingPrice,
        totalSold30Days: v.totalSold30Days,
        dailySalesRate: Number(v.dailySalesRate.toFixed(2)),
        daysUntilStockout,
        riskLevel:
          daysUntilStockout === null
            ? 'none'
            : daysUntilStockout <= 3
            ? 'critical'
            : daysUntilStockout <= 7
            ? 'high'
            : daysUntilStockout <= 14
            ? 'medium'
            : 'low',
      };
    })
    .filter((r) => r.riskLevel !== 'none' && r.daysUntilStockout !== null && r.daysUntilStockout <= 14)
    .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);

  return risks;
};

/**
 * getProductProfitability – gross profit per product in a date range.
 */
const getProductProfitability = async (user, startDate, endDate, limit = 20) => {
  const safeLimit = Math.min(Number(limit) || 20, 50);
  const match = buildBaseMatch(user, { startDate, endDate });

  const results = await Sale.aggregate([
    { $match: match },
    { $unwind: '$products' },
    {
      $group: {
        _id: '$products.productId',
        productName: { $first: '$products.productName' },
        totalRevenue: { $sum: '$products.subtotal' },
        totalCost: { $sum: { $multiply: ['$products.purchasePrice', '$products.quantity'] } },
        totalUnitsSold: { $sum: '$products.quantity' },
        avgPrice: { $avg: '$products.price' },
        avgPurchasePrice: { $avg: '$products.purchasePrice' },
      },
    },
    {
      $addFields: {
        grossProfit: { $subtract: ['$totalRevenue', '$totalCost'] },
        grossMarginPercent: {
          $cond: [
            { $gt: ['$totalRevenue', 0] },
            {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ['$totalRevenue', '$totalCost'] },
                    '$totalRevenue',
                  ],
                },
                100,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { grossProfit: -1 } },
    { $limit: safeLimit },
  ]);

  return results.map((r) => ({
    productId: r._id,
    productName: r.productName,
    totalRevenue: Number(r.totalRevenue.toFixed(2)),
    totalCost: Number(r.totalCost.toFixed(2)),
    grossProfit: Number(r.grossProfit.toFixed(2)),
    grossMarginPercent: Number(r.grossMarginPercent.toFixed(2)),
    totalUnitsSold: r.totalUnitsSold,
    avgSellingPrice: Number(r.avgPrice.toFixed(2)),
    avgPurchasePrice: Number(r.avgPurchasePrice.toFixed(2)),
  }));
};

/**
 * getBusinessOverview – high-level summary combining sales, stock, and top performers.
 */
const getBusinessOverview = async (user, startDate, endDate) => {
  const [
    salesSummary,
    topProducts,
    lowStockProducts,
    stockoutRisks,
  ] = await Promise.all([
    getSalesSummary(user, startDate, endDate),
    getTopSellingProducts(user, startDate, endDate, 5),
    getLowStockProducts(user),
    getStockoutRiskProducts(user),
  ]);

  const shopIdObj = toObjectId(user.shopId);
  const branchFilter =
    user.role === 'worker' && user.branchId ? { branchId: toObjectId(user.branchId) } : {};

  const [totalProducts, outOfStockCount] = await Promise.all([
    Product.countDocuments({ shopId: shopIdObj, ...branchFilter }),
    Product.countDocuments({ shopId: shopIdObj, ...branchFilter, stock: 0 }),
  ]);

  return {
    salesSummary,
    topProducts,
    lowStockProducts: lowStockProducts.slice(0, 10),
    stockoutRisks: stockoutRisks.slice(0, 10),
    inventoryStats: {
      totalProducts,
      outOfStockCount,
      lowStockCount: lowStockProducts.length,
      criticalStockoutRisks: stockoutRisks.filter((r) => r.riskLevel === 'critical').length,
    },
  };
};

/**
 * getSalesTrend – daily sales for the last N days.
 */
const getSalesTrend = async (user, days = 30) => {
  const safeDays = Math.min(Number(days) || 30, 90);
  const since = new Date();
  since.setDate(since.getDate() - (safeDays - 1));
  since.setHours(0, 0, 0, 0);

  const match = buildBaseMatch(user, { startDate: since });

  const agg = await Sale.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        dailyRevenue: { $sum: '$total' },
        invoiceCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const resultMap = {};
  agg.forEach((a) => {
    resultMap[a._id] = { revenue: a.dailyRevenue, invoices: a.invoiceCount };
  });

  const trend = [];
  for (let i = safeDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    trend.push({
      date: dateStr,
      revenue: resultMap[dateStr] ? Number(resultMap[dateStr].revenue.toFixed(2)) : 0,
      invoices: resultMap[dateStr] ? resultMap[dateStr].invoices : 0,
    });
  }

  return { trend, daysAnalyzed: safeDays };
};

module.exports = {
  getSalesSummary,
  compareSalesPeriods,
  getTopSellingProducts,
  getSlowMovingProducts,
  getLowStockProducts,
  getStockoutRiskProducts,
  getProductProfitability,
  getBusinessOverview,
  getSalesTrend,
};
