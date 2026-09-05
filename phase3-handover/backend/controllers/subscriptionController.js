const Subscription = require('../models/Subscription');
const BillingSchedule = require('../models/BillingSchedule');

async function getSubscriptions(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === 'CUSTOMER') {
      filter.customerId = req.user.customer_id;
    }
    const subscriptions = await Subscription.findAll(filter);
    res.json({
      success: true,
      message: 'Subscriptions retrieved',
      data: subscriptions
    });
  } catch (err) {
    next(err);
  }
}

async function getSubscriptionById(req, res, next) {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    const schedules = await BillingSchedule.findBySubscriptionId(req.params.id);

    res.json({
      success: true,
      message: 'Subscription detail retrieved',
      data: {
        subscription,
        schedules
      }
    });
  } catch (err) {
    next(err);
  }
}

async function updateSubscriptionStatus(req, res, next) {
  try {
    const { status } = req.body;
    const updated = await Subscription.updateStatus(req.params.id, status);
    res.json({
      success: true,
      message: `Subscription marked as ${status}`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSubscriptions,
  getSubscriptionById,
  updateSubscriptionStatus
};
