const fs = require('fs');

const Product = require('../model/admin');

// @desc      Get All products
// @route     GET /admin ||  /admin/products
// @access    Public

exports.getAllProducts = async (req, res, next) => {
  const products = await Product.find();

  res.render('admin/product', { products });
};

// @desc      Get Form for adding product item
// @route     GET admin/addproduct
// @access    Public
exports.addProductForm = (req, res, next) => {
  res.render('admin/addproduct');
};

// @desc      Create product item
// @route     POST admin/addproduct
// @access    Private
exports.createProducts = async (req, res, next) => {
  const img = fs.readFileSync(req.file.path);
  const encode_img = img.toString('base64');
  req.body.photo = encode_img;

  await Product.create(req.body);
  res.redirect('/admin');
};

// @desc      Edit products item detail
// @route     POST admin/editproduct
// @access    Private
exports.editProduct = async (req, res, next) => {
  await Product.findOne({ _id: req.body.id }).then(async productItem => {
    let encode_img = productItem.photo;

    if (req.file) {
      const img = fs.readFileSync(req.file.path);
      encode_img = img.toString('base64');
    }
    await Product.updateOne(
      { _id: req.body.id },
      {
        title: req.body.title,
        photo: encode_img,
        price: req.body.price,
        quantity: req.body.quantity,
        description: req.body.description
      }
    );
  });

  res.redirect('/admin');
};


// @desc      delete products item
// @route     POST admin/deleteProduct
// @access    Private
exports.deleteProduct = async (req, res, next) => {
  await Product.findByIdAndDelete({ _id: req.body.id });
  res.redirect('/admin');
};
