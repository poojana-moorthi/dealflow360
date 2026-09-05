const Product = require('../models/Product');
const PriceList = require('../models/PriceList');
const DiscountRule = require('../models/DiscountRule');

async function getProducts(req, res, next) {
  try {
    const products = await Product.findAll();
    res.json({
      success: true,
      message: 'Products retrieved',
      data: products
    });
  } catch (err) {
    next(err);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({
      success: true,
      message: 'Product retrieved',
      data: product
    });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const id = await Product.create(req.body);
    const product = await Product.findById(id);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await Product.update(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    await Product.delete(req.params.id);
    res.json({
      success: true,
      message: 'Product deactivated successfully'
    });
  } catch (err) {
    next(err);
  }
}

async function getDiscountRules(req, res, next) {
  try {
    const rules = await DiscountRule.findAll();
    res.json({
      success: true,
      message: 'Discount rules retrieved',
      data: rules
    });
  } catch (err) {
    next(err);
  }
}

async function updateDiscountRule(req, res, next) {
  try {
    const { max_discount_pct, required_approval_level } = req.body;
    const rule = await DiscountRule.updateRule(req.params.id, max_discount_pct, required_approval_level);
    res.json({
      success: true,
      message: 'Discount rule updated',
      data: rule
    });
  } catch (err) {
    next(err);
  }
}

async function getTierPricing(req, res, next) {
  try {
    const { tier } = req.params;
    const prices = await PriceList.findByTier(tier);
    res.json({
      success: true,
      message: `Pricing for ${tier} fetched`,
      data: prices
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getDiscountRules,
  updateDiscountRule,
  getTierPricing
};
