// const OrderSchema = require("../schema/OrderStatusSchema");

const GetOrderStatus = async (req, res) => {  
  const { orderId } = req.query;
  res.status(200).json({ StatusCode: 200, data: orderId });
}

module.exports = { GetOrderStatus };
