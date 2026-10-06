const mongoose = require('mongoose');

const toObjectId = (id) => {
  if (!id) return id;
  if (id instanceof mongoose.Types.ObjectId) return id;
  return new mongoose.Types.ObjectId(id);
};

const shopFilter = (req, extra = {}) => {
  const query = { shopId: req.user.shopId, ...extra };
  if (req.user.role === 'worker' && req.user.branchId) {
    query.branchId = req.user.branchId;
  }
  return query;
};

const shopMatch = (req, extra = {}) => {
  const match = { shopId: toObjectId(req.user.shopId), ...extra };
  if (req.user.role === 'worker' && req.user.branchId) {
    match.branchId = toObjectId(req.user.branchId);
  }
  return match;
};

module.exports = { toObjectId, shopFilter, shopMatch };
