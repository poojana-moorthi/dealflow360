const Customer = require('../models/Customer');

async function getCustomers(req, res, next) {
  try {
    const customers = await Customer.findAll();
    res.json({
      success: true,
      message: 'Customers fetched successfully',
      data: customers
    });
  } catch (err) {
    next(err);
  }
}

async function getCustomerById(req, res, next) {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({
      success: true,
      message: 'Customer retrieved',
      data: customer
    });
  } catch (err) {
    next(err);
  }
}

async function createCustomer(req, res, next) {
  try {
    const id = await Customer.create(req.body);
    const customer = await Customer.findById(id);
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (err) {
    next(err);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const customer = await Customer.update(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer
};
