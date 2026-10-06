const Branch = require('../models/Branch');
const Shop = require('../models/Shop');
const logActivity = require('../utils/activityLogger');

// POST /api/branches
exports.createBranch = async (req, res, next) => {
  try {
    const { branchName, address, manager } = req.body;

    const branchCount = await Branch.countDocuments({ shopId: req.user.shopId });
    const branchId = `BR00${branchCount + 1}`;

    const branch = new Branch({
      shopId: req.user.shopId,
      branchId,
      branchName,
      address: address || '',
      manager: manager || req.user._id,
      status: 'active',
    });

    await branch.save();

    // Increment branchCount in Shop
    await Shop.findByIdAndUpdate(req.user.shopId, { $inc: { branchCount: 1 } });

    await logActivity({
      userId: req.user._id,
      shopId: req.user.shopId,
      branchId: branch._id,
      action: 'ADD_BRANCH',
      description: `Created new branch '${branchName}' (${branchId})`,
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/branches
exports.getBranches = async (req, res, next) => {
  try {
    const branches = await Branch.find({ shopId: req.user.shopId })
      .populate('manager', 'name email phone workerId designation')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: 'Branches fetched successfully',
      data: branches,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/branches/:id
exports.updateBranch = async (req, res, next) => {
  try {
    const { branchName, address, manager, status } = req.body;

    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user.shopId },
      { branchName, address, manager, status },
      { new: true }
    ).populate('manager', 'name email');

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found',
        data: null,
      });
    }

    await logActivity({
      userId: req.user._id,
      shopId: req.user.shopId,
      branchId: branch._id,
      action: 'UPDATE_BRANCH',
      description: `Updated branch details for '${branch.branchName}'`,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Branch updated successfully',
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};
