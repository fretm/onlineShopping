const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  products: [{ product: { type: Object } }],
  payment: Object,
  shipping: Object,
  orderedAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.statics.createOrder = function(userDetail) {};

module.exports = mongoose.model('Order', orderSchema);
