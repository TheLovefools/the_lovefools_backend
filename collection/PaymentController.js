const {
  PaymentHandler,
  APIException,
  validateHMAC_SHA256,
} = require("./PaymentHandler");
const multer = require("multer");
const ReceiptSchema = require("../schema/Receipt");
const { default: axios } = require("axios");

const upload = multer(); // Middleware for parsing FormData

const InitiatePayment = async (req, res) => {
  await new Promise((resolve) => upload.any()(req, res, resolve)); // Parse FormData

  // const orderId = `order_${Date.now()}`;
  // const amount = req.body.amount;
  const returnUrl = `https://api.thelovefools.in/api/user/handlePaymentResponse`;
  // const paymentHandler = PaymentHandler.getInstance(req.body.order_id);
  // const paymentHandler = new PaymentHandler(req.body.order_id);
  const paymentHandler = PaymentHandler.getInstance(req.body.order_id);

  const order_id = req.body.order_id;
  const amount = req.body.amount;
  const customer_email = req.body.customer_email;
  const customer_phone = req.body.customer_phone;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const udf6 = req.body.udf6;
  const udf7 = req.body.udf7;
  const udf8 = req.body.udf8;
  const udf9 = req.body.udf9;
  const udf10 = req.body.udf10;

  try {
    const orderSessionResp = await paymentHandler.orderSession({
      order_id: order_id,
      amount: amount,
      currency: "INR",
      return_url: returnUrl,
      customer_id: "sample-customer-id",
      // [MERCHANT_TODO]:- please handle customer_id, it's an optional field but we suggest to use it.
      // please note you don't have to give payment_page_client_id here, it's mandatory but
      // PaymentHandler will read it from config.json file
      // payment_page_client_id: paymentHandler.getPaymentPageClientId()
      customer_email,
      customer_phone,
      first_name,
      last_name,
      udf6,
      udf7,
      udf8,
      udf9,
      udf10
    });
    res.status(200).json({
      StatusCode: 200,
      orderId: order_id,
      udf6,
      udf7,
      udf8,
      udf9,
      udf10,
      redict_url: orderSessionResp.payment_links.web,
    });
    // return res.redirect(orderSessionResp.payment_links.web);
    // res.status(200).json({orderSessionResp})
  } catch (error) {
    // [MERCHANT_TODO]:- please handle errors
    if (error instanceof APIException) {
      return res.send("PaymentHandler threw some error");
    }
    // [MERCHANT_TODO]:- please handle errors
    return res.send("Something went wrong");
    // return res.send(error);
  }
};

const HandlePaymentresponse = async (req, res) => {
  const orderId = req.body.order_id || req.body.orderId;
  const paymentHandler = PaymentHandler.getInstance();

  if (orderId === undefined) {
    return res.send("Something went wrong");
  }

  try {
    const validationParams = {
      status_id: req.body.status_id,
      status: req.body.status,
      order_id: req.body.order_id,
      signature: req.body.signature,
      signature_algorithm: req.body.signature_algorithm
    };
    
    // 🔐 Validate HMAC
    // const isValid = validateHMAC_SHA256(req.body, paymentHandler.getResponseKey());
    const isValid = validateHMAC_SHA256(validationParams, paymentHandler.getResponseKey());

    if (!isValid) {
      return res.send("Signature verification failed");
    }

    // Continue with order status check
    const orderStatusResp = await paymentHandler.orderStatus(orderId);
    const orderStatus = orderStatusResp.status;

    // 1. Send WhatsApp API
    if (orderStatus === "CHARGED") {
      const userMobile = orderStatusResp.customer_phone;
      const amount = orderStatusResp.amount;
      const bookedRoom = orderStatusResp.udf6;
      const bookedTable = orderStatusResp.udf7;
      const bookedDate = orderStatusResp.udf8;
      const bookedTime = orderStatusResp.udf9;
      const bookedMenu = orderStatusResp.udf10;
      try {
        const apiResponse = await axios.post(
          `https://api.thelovefools.in/api/user/whatsappSuccess`,
          {
            "mobile": userMobile,
            "bookingId": orderId,
            "bookedRoom": bookedRoom,
            "bookedTable": bookedTable,
            "bookedMenu": bookedMenu,
            "advancePayment": amount,
            "bookingDate": bookedDate,
            "bookingTime": bookedTime
          }
        );
        console.log("WhatsApp sent successfully:", apiResponse.data);
      } catch (error) {
        console.error("WhatsApp API error:", error.message);
      }
    }
          
    if (orderStatus) {
      try {
        await ReceiptSchema.findOneAndUpdate(
          { orderId },
          {
            orderStatus: orderStatusResp.status,
            paymentSuccess: true,
          }
        );
        return res.redirect("https://thelovefools.in/order-success");
      } catch (error) {
        console.log("orderId error", error);
      }
      let message = "";
      switch (orderStatus) {
        case "CHARGED":
          message = "order payment done successfully";
          break;
        case "PENDING":
        case "PENDING_VBV":
          message = "order payment pending";
          break;
        case "AUTHORIZATION_FAILED":
          message = "order payment authorization failed";
          break;
        case "AUTHENTICATION_FAILED":
          message = "order payment authentication failed";
          break;
        default:
          message = "order status " + orderStatus;
          break;
      }
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
