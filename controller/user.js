const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectID;

const User = require('../model/user');
const Product = require('../model/admin');
const Order = require('../model/order');

// @desc      Get All user products
// @route     GET / ||  /user
// @access    Public

exports.getAllProducts = async (req, res, next) => {
  const products = await Product.find();
  const { cartListCount } = await getloggedUser(req, res, next);

  res.render('user/shop', { products, cartListCount });
};
// @desc      Add item to the user cart
// @route     Post /user/addtocart
// @access    Public

exports.addToCart = async (req, res, next) => {
  const productId = req.body.id;

  const id = req.user._id; // Get current user id

  const currentUser = await User.findById(id);

  currentUser.addItemToCart(productId);

  res.redirect('/');
};

// @desc      Get user cart list
// @route     GET /user/cart
// @access    Public

exports.getUserCart = async (req, res, next) => {
  const id = req.user._id;
  const currentUser = await User.findById(id);
  let cartList = await currentUser
    .populate('cart.items.productId')
    .execPopulate();
  cartList = cartList.cart.items;

  res.render('user/cartlist', { products: cartList });
};

// @desc      Delete item from the user cart
// @route     Delete /user/deleteCartItem
// @access    Public

exports.deleteCartItem = async (req, res, next) => {
  const productId = req.params.productid;

  const id = req.user._id;
  const currentUser = await User.findById(id);

  currentUser.deleteItemFromCart(productId);

  res.redirect(`/user/cart`);
};

// @desc      Get payment form to checkout
// @route     Get /user/payment
// @access    Private

exports.paymentForm = async (req, res, next) => {
  const id = req.user._id;

  const currentUser = await User.findById(id);
  let cartList = await currentUser
    .populate('cart.items.productId')
    .execPopulate();
  cartList = cartList.cart.items;
  const { cartListCount } = await getloggedUser(req, res, next);
  res.render('user/payment', { products: cartList, cartListCount });
};

// @desc      Place order for user
// @route     Post /user/order
// @access    Private

exports.placeOrder = async (req, res, next) => {
  const id = req.user._id;

  const currentUser = await User.findById(id);
  let cartList = await currentUser
    .populate('cart.items.productId')
    .execPopulate();

  cartList = cartList.cart.items;
  let orderList = [];
  cartList.forEach(element => {
    const { title, imageUrl, price } = element.productId;
    const { quantity } = element;
    orderList.push({ product: { title, imageUrl, price, quantity } });
  });

  await Order.create({
    user: id,
    products: orderList,
    shipping: {
      customer: currentUser.name,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      tracking: {
        company: 'ups',
        tracking_number: '22122X211SD',
        status: 'ontruck',
        estimated_delivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days
      },
      payment: {
        method: 'visa',
        transaction_id: '2312213312XXXTD'
      }
    }
  });
  await User.updateOne({ _id: ObjectId(id) }, { $set: { 'cart.items': [] } });
  res.redirect('/user/orderhistory');
};

// @desc      Get order history
// @route     Get /user/orderhistory
// @access    Public

exports.orderHistory = async (req, res, next) => {
  const id = req.user._id;

  const userOrder = await Order.find({ user: id });
  res.render('user/orderhistory', { userOrder: userOrder });
};

// @desc    Get current logged in user and return number of item in the cart

const getloggedUser = async (req, res, next) => {
  if (req.cookies.token) {
    token = req.cookies.token;
    const decoded = jwt.verify(token, 'asdfrewq'); //"asdfrewq" is the secret
    user = await User.aggregate([
      { $match: { _id: ObjectId(decoded.id) } },
      { $unwind: '$cart.items' },
      {
        $group: {
          _id: null,
          cartListCount: { $sum: '$cart.items.quantity' }
        }
      },
      { $project: { _id: 0, cartListCount: 1 } }
    ]);
    if (!user[0]) return { cartListCount: 0 };
    return user[0];
  }
  return 0;
};
