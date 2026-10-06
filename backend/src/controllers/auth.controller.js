const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Branch = require('../models/Branch');
const logActivity = require('../utils/activityLogger');
const createNotification = require('../utils/notificationHelper');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_jwt_key_smart_inventory_2026_xyz', {
    expiresIn: '7d',
  });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { shopName, ownerName, email, phone, password, shopAddress, gstNumber, businessType } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Temp shop object ID for mutual references
    const shopId = new (require('mongoose').Types.ObjectId)();
    const branchId = new (require('mongoose').Types.ObjectId)();
    const userId = new (require('mongoose').Types.ObjectId)();

    const newShop = new Shop({
      _id: shopId,
      shopName,
      owner: userId,
      email,
      phone,
      address: shopAddress || '',
      gstNumber: gstNumber || '',
      businessType: businessType || 'Retail',
      branchCount: 1,
    });
    await newShop.save();

    const defaultBranch = new Branch({
      _id: branchId,
      shopId,
      branchId: 'BR001',
      branchName: `${shopName} - Main Branch`,
      address: shopAddress || 'Main Branch Address',
      manager: userId,
      status: 'active',
    });
    await defaultBranch.save();

    const newUser = new User({
      _id: userId,
      name: ownerName,
      email,
      password: hashedPassword,
      phone,
      role: 'owner',
      shopId,
      branchId,
      status: 'active',
      designation: 'Shop Owner',
    });
    await newUser.save();

    const token = generateToken({
      userId: newUser._id,
      role: newUser.role,
      shopId: newUser.shopId,
      branchId: newUser.branchId,
    });

    await logActivity({
      userId: newUser._id,
      shopId: newUser.shopId,
      branchId: newUser.branchId,
      action: 'REGISTER',
      description: `Owner registered shop '${shopName}'`,
      req,
    });

    await createNotification({
      shopId: newUser.shopId,
      branchId: newUser.branchId,
      type: 'system',
      title: 'Welcome to Smart Inventory',
      message: `Shop '${shopName}' successfully set up!`,
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'Shop Owner registered successfully',
      data: {
        token,
        user: userObj,
        shop: newShop,
        branch: defaultBranch,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      await logActivity({
        userId: null,
        shopId: null,
        action: 'FAILED_LOGIN',
        description: `Failed login attempt for unknown email ${email}`,
        req,
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        data: null,
      });
    }

    if (user.status !== 'active') {
      await createNotification({
        shopId: user.shopId,
        branchId: user.branchId,
        type: 'failed_login',
        title: 'Deactivated Account Login Attempt',
        message: `Inactive user ${user.email} attempted login`,
      });
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact shop owner.',
        data: null,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logActivity({
        userId: user._id,
        shopId: user.shopId,
        branchId: user.branchId,
        action: 'FAILED_LOGIN',
        description: `Failed login attempt for email ${email}`,
        req,
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        data: null,
      });
    }

    const token = generateToken({
      userId: user._id,
      role: user.role,
      shopId: user.shopId,
      branchId: user.branchId,
    });

    await logActivity({
      userId: user._id,
      shopId: user.shopId,
      branchId: user.branchId,
      action: 'LOGIN',
      description: `User '${user.name}' (${user.role}) logged in`,
      req,
    });

    if (user.role === 'worker') {
      await createNotification({
        shopId: user.shopId,
        branchId: user.branchId,
        type: 'worker_login',
        title: 'Worker Login',
        message: `Worker '${user.name}' (${user.workerId || user.email}) logged in`,
      });
    }

    const shop = await Shop.findById(user.shopId);
    const branch = user.branchId ? await Branch.findById(user.branchId) : null;

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userObj,
        shop,
        branch,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const shop = await Shop.findById(req.user.shopId);
    const branch = user.branchId ? await Branch.findById(user.branchId) : null;

    res.status(200).json({
      success: true,
      message: 'User profile fetched successfully',
      data: {
        user,
        shop,
        branch,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await logActivity({
        userId: req.user._id,
        shopId: req.user.shopId,
        branchId: req.user.branchId,
        action: 'LOGOUT',
        description: `User '${req.user.name}' logged out`,
        req,
      });
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
