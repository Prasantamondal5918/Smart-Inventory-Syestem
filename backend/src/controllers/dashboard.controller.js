const Sale = require('../models/Sale');
const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');

// GET /api/dashboard
exports.getDashboardData = async (req, res, next) => {
  try {
    const shopId = req.user.shopId;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 1. Today's Sales
    const todaySalesAgg = await Sale.aggregate([
      { $match: { shopId, createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, totalSales: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);
    const todaySales = todaySalesAgg.length > 0 ? todaySalesAgg[0].totalSales : 0;
    const todaySalesCount = todaySalesAgg.length > 0 ? todaySalesAgg[0].count : 0;

    // 2. Monthly Sales
    const monthSalesAgg = await Sale.aggregate([
      { $match: { shopId, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, totalSales: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);
    const monthlySales = monthSalesAgg.length > 0 ? monthSalesAgg[0].totalSales : 0;

    // 3. Product Counts
    const totalProducts = await Product.countDocuments({ shopId });

    // Low stock products ($lte minimumStock and > 0)
    const lowStockProductsList = await Product.find({
      shopId,
      $expr: {
        $and: [
          { $lte: ['$stock', '$minimumStock'] },
          { $gt: ['$stock', 0] },
        ],
      },
    })
      .select('productName stock minimumStock unit category image price sellingPrice')
      .limit(10);

    const lowStockCount = await Product.countDocuments({
      shopId,
      $expr: {
        $and: [
          { $lte: ['$stock', '$minimumStock'] },
          { $gt: ['$stock', 0] },
        ],
      },
    });

    const outOfStockCount = await Product.countDocuments({ shopId, stock: 0 });

    // 4. Sales Chart Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const salesChartAgg = await Sale.aggregate([
      { $match: { shopId, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format 7 day chart
    const salesChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = salesChartAgg.find((item) => item._id === dateStr);
      salesChart.push({
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: match ? Number(match.totalSales.toFixed(2)) : 0,
        orders: match ? match.count : 0,
      });
    }

    // 5. Recent Sales
    const recentSales = await Sale.find({ shopId })
      .populate('cashier', 'name workerId designation')
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Recently Added Products
    const recentProducts = await Product.find({ shopId })
      .sort({ createdAt: -1 })
      .limit(5);

    // 7. Top Selling Products
    const topSellingAgg = await Sale.aggregate([
      { $match: { shopId } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          productName: { $first: '$products.productName' },
          totalSold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: '$products.subtotal' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    // 8. Recent Activities
    const recentActivities = await ActivityLog.find({ shopId })
      .populate('userId', 'name role designation workerId')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      message: 'Dashboard metrics fetched successfully',
      data: {
        summaryCards: {
          todaySales: Number(todaySales.toFixed(2)),
          todaySalesCount,
          monthlySales: Number(monthlySales.toFixed(2)),
          totalProducts,
          lowStockCount,
          outOfStockCount,
        },
        salesChart,
        recentSales,
        recentProducts,
        topSellingProducts: topSellingAgg,
        recentActivities,
        lowStockProductsList,
      },
    });
  } catch (error) {
    next(error);
  }
};
