const {
  PaymentHandler,
  APIException,
  validateHMAC_SHA256,
} = require("./PaymentHandler");
const multer = require("multer");
const ReceiptSchema = require("../schema/Receipt");

const upload = multer(); // Middleware for parsing FormData

const InitiatePayment = async (req, res) => {
  await new Promise((resolve) => upload.any()(req, res, resolve)); // Parse FormData

  const orderId = `order_${Date.now()}`;
  const amount = req.body.amount;
  const returnUrl = `https://lovefools-backend.vercel.app/api/user/handlePaymentResponse`;
  const paymentHandler = PaymentHandler.getInstance();
  try {
    const orderSessionResp = await paymentHandler.orderSession({
      order_id: orderId,
      amount,
      currency: "INR",
      return_url: returnUrl,
      // [MERCHANT_TODO]:- please handle customer_id, it's an optional field but we suggest to use it.
      customer_id: "sample-customer-id",
      // please note you don't have to give payment_page_client_id here, it's mandatory but
      // PaymentHandler will read it from config.json file
      // payment_page_client_id: paymentHandler.getPaymentPageClientId()
    });
    res.status(200).json({
      StatusCode: 200,
      orderId: orderId,
      redict_url: orderSessionResp.payment_links.web,
    });
    // return res.redirect(orderSessionResp.payment_links.web);
  } catch (error) {
    // [MERCHANT_TODO]:- please handle errors
    if (error instanceof APIException) {
      return res.send("PaymentHandler threw some error");
    }
    // [MERCHANT_TODO]:- please handle errors
    return res.send("Something went wrong");
  }
};

const HandlePaymentresponse = async (req, res) => {
  const orderId = req.body.order_id || req.body.orderId;
  const paymentHandler = PaymentHandler.getInstance();

  if (orderId === undefined) {
    return res.send("Something went wrong");
  }

  try {
    const orderStatusResp = await paymentHandler.orderStatus(orderId);
    if (!validateHMAC_SHA256(req.body, paymentHandler.getResponseKey())) {
      const deletedReceipt = await ReceiptSchema.findOneAndDelete({
        orderId: orderId,
      });

      return res.redirect("https://thelovefools.in/booking");
    }

    const orderStatus = orderStatusResp.status;
    if (orderStatus) {
      await ReceiptSchema.findOneAndUpdate(
        { orderId },
        { paymentSuccess: true }
      );
      return res.redirect("https://thelovefools.in/order-success");
    }
   
    const html = makeOrderStatusResponse(
      "Merchant Payment Response Page",
      message,
      req,
      orderStatusResp
    );
    res.set("Content-Type", "text/html");
    return res.send(html);
  } catch (error) {
    console.error(error);
    // [MERCHANT_TODO]:- please handle errors
    if (error instanceof APIException) {
      return res.send("PaymentHandler threw some error");
    }
    // [MERCHANT_TODO]:- please handle errors
    return res.send("Something went wrong");
  }
};

const InitiatePaymentRefund = async () => {
  const paymentHandler = PaymentHandler.getInstance();

  try {
    const refundResp = await paymentHandler.refund({
      order_id: req.body.order_id,
      amount: req.body.amount,
      unique_request_id: req.body.unique_request_id || `refund_${Date.now()}`,
    });
    const html = makeOrderStatusResponse(
      "Merchant Refund Page",
      `Refund status:- ${refundResp.status}`,
      req,
      refundResp
    );
    res.set("Content-Type", "text/html");
    return res.send(html);
  } catch (error) {
    console.error(error);
    // [MERCHANT_TODO]:- please handle errors
    if (error instanceof APIException) {
      return res.send("PaymentHandler threw some error");
    }
    // [MERCHANT_TODO]:- please handle errors
    return res.send("Something went wrong");
  }
};

// [MERCHAT_TODO]:- Please modify this as per your requirements
const makeOrderStatusResponse = (title, message, req, response) => {
  let inputParamsTableRows = "";
  for (const [key, value] of Object.entries(req.body)) {
    const pvalue = value !== null ? JSON.stringify(value) : "";
    inputParamsTableRows += `<tr><td>${key}</td><td>${pvalue}</td></tr>`;
  }

  let orderTableRows = "";
  for (const [key, value] of Object.entries(response)) {
    const pvalue = value !== null ? JSON.stringify(value) : "";
    orderTableRows += `<tr><td>${key}</td><td>${pvalue}</td></tr>`;
  }

  return `
          <html>
          <head>
              <title>${title}</title>
          </head>
          <body>
              <h1>${message}</h1>
  
              <center>
                  <font size="4" color="blue"><b>Return url request body params</b></font>
                  <table border="1">
                      ${inputParamsTableRows}
                  </table>
              </center>
  
              <center>
                  <font size="4" color="blue"><b>Response received from order status payment server call</b></font>
                  <table border="1">
                      ${orderTableRows}
                  </table>
              </center>
          </body>
          </html>
      `;
};

module.exports = {
  InitiatePayment,
  InitiatePaymentRefund,
  HandlePaymentresponse,
};
