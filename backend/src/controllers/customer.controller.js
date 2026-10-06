const Customer = require('../models/Customer');

// GET /api/customers
exports.getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { shopId: req.user.shopId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 }).limit(20);

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/customers
exports.createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;

    const customer = new Customer({
      shopId: req.user.shopId,
      name,
      phone: phone || '',
      email: email || '',
      address: address || '',
    });

    await customer.save();

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};
