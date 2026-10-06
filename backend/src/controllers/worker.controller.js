const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logActivity = require('../utils/activityLogger');

// POST /api/workers
exports.createWorker = async (req, res, next) => {
  try {
    const { name, email, phone, password, designation, joiningDate, branchId } = req.body;
  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Auto-generate worker ID
    const workerCount = await User.countDocuments({ shopId: req.user.shopId, role: 'worker' });
    const autoWorkerId = `WRK-${1001 + workerCount}`;

    const worker = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: 'worker',
      shopId: req.user.shopId,
      branchId: branchId || req.user.branchId,
      status: 'active',
      designation: designation || 'Sales Representative',
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      workerId: autoWorkerId,
    });

    await worker.save();

    await logActivity({
      userId: req.user._id,
      shopId: req.user.shopId,
      branchId: req.user.branchId,
      action: 'ADD_WORKER',
      description: `Created new worker '${name}' with ID ${autoWorkerId}`,
      req,
    });

    const workerObj = worker.toObject();
    delete workerObj.password;

    res.status(201).json({
      success: true,
      message: 'Worker created successfully',
      data: workerObj,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/workers
exports.getWorkers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, status } = req.query;

    const query = { shopId: req.user.shopId, role: 'worker' };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { workerId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const workers = await User.find(query)
      .select('-password')
      .populate('branchId', 'branchName branchId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Workers retrieved successfully',
      data: {
        workers,
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

// GET /api/workers/:id
exports.getWorkerById = async (req, res, next) => {
  try {
    const worker = await User.findOne({
      _id: req.params.id,
      shopId: req.user.shopId,
      role: 'worker',
    })
      .select('-password')
      .populate('branchId', 'branchName branchId');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Worker details fetched',
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/workers/:id
exports.updateWorker = async (req, res, next) => {
  try {
    const worker = await User.findOne({
      _id: req.params.id,
      shopId: req.user.shopId,
      role: 'worker',
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
        data: null,
      });
    }

    const { name, phone, designation, status, joiningDate, password, branchId } = req.body;

    if (name !== undefined) worker.name = name;
    if (phone !== undefined) worker.phone = phone;
    if (designation !== undefined) worker.designation = designation;
    if (status !== undefined) worker.status = status;
    if (joiningDate !== undefined) worker.joiningDate = new Date(joiningDate);
    if (branchId !== undefined) worker.branchId = branchId;

    if (password && password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      worker.password = await bcrypt.hash(password, salt);
    }

    await worker.save();

    await logActivity({
      userId: req.user._id,
      shopId: req.user.shopId,
      branchId: req.user.branchId,
      action: 'UPDATE_WORKER',
      description: `Updated worker profile/status for '${worker.name}' (${worker.workerId})`,
      req,
    });

    const workerObj = worker.toObject();
    delete workerObj.password;

    res.status(200).json({
      success: true,
      message: 'Worker updated successfully',
      data: workerObj,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/workers/:id
exports.deleteWorker = async (req, res, next) => {
  try {
    const worker = await User.findOneAndDelete({
      _id: req.params.id,
      shopId: req.user.shopId,
      role: 'worker',
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
        data: null,
      });
    }

    await logActivity({
      userId: req.user._id,
      shopId: req.user.shopId,
      branchId: req.user.branchId,
      action: 'DELETE_WORKER',
      description: `Deleted worker '${worker.name}' (${worker.workerId})`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Worker deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
