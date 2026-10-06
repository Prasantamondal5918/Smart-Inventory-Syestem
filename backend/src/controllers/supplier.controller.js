const Supplier = require('../models/Supplier');

// POST /api/suppliers
exports.createSupplier = async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;

    const supplier = new Supplier({
      shopId: req.user.shopId,
      name,
      phone: phone || '',
      email: email || '',
      address: address || '',
    });

    await supplier.save();

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/suppliers
exports.getSuppliers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search } = req.query;

    const query = { shopId: req.user.shopId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Supplier.countDocuments(query);
    const suppliers = await Supplier.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Suppliers fetched successfully',
      data: {
        suppliers,
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

// PUT /api/suppliers/:id
exports.updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      req.body,
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/suppliers/:id
exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOneAndDelete({
      _id: req.params.id,
      shopId: req.user.shopId,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
