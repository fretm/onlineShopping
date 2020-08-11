const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'public/images' });

const {
  getAllProducts,
  addProductForm,
  createProducts,
  editProduct,
  deleteProduct
} = require('../controller/admin');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get(['/', '/products'], protect, authorize('admin'), getAllProducts);

router.get('/addproduct', protect, authorize('admin'), addProductForm);
router.post(
  '/addproduct',
  protect,
  authorize('admin'),
  upload.single('photo'),
  createProducts
);

router.post(
  '/editproduct',
  protect,
  authorize('admin'),
  upload.single('photo'),
  editProduct
);

router.post('/deleteProduct', protect, authorize('admin'), deleteProduct);

module.exports = router;
