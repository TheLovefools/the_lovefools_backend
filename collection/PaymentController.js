const {
  PaymentHandler,
  APIException,
  validateHMAC_SHA256,
} = require("./PaymentHandler");
const multer = require("multer");
const ReceiptSchema = require("../schema/Receipt");
const { default: axios } = require("axios");

const upload = multer(); // Middleware for parsing FormData

const CreateBookingAndInitiatePayment = async (req, res) => {
  try {
    const {
      order_id,
      receiptName,
      emailId,
      mobileNo,
      room,
      room_id,
      table_number,
      table_id,
      date,
      bookingDate,
      time,
      bookingSlot,
      price,
      type,
      sub_type,
      customer_email,
      customer_phone,
      first_name,
      last_name,
      udf6,
      udf7,
      udf8,
      udf9,
      udf10,
    } = req.body;

    // 1. Save trusted booking
    const newReceipt = new ReceiptSchema({
      orderId: order_id,
      receiptName,
      emailId,
      mobileNo,
      room,
      room_id,
      table_number,
      table_id,
      date,
      bookingDate,
      time,
      bookingSlot,
      price,
      type,
      sub_type,
      orderStatus: "new",
      paymentSuccess: false,
    });
    await newReceipt.save();

    // 2. Get trusted amount
    const amount = newReceipt.price;
    const returnUrl = `https://api.thelovefools.in/api/user/handlePaymentResponse`;

    // 3. Create payment session
    const paymentHandler = PaymentHandler.getInstance(order_id);
    const orderSessionResp = await paymentHandler.orderSession({
      order_id,
      amount,
      currency: "INR",
      return_url: returnUrl,
      customer_id: "customer_" + order_id,
      customer_email,
      customer_phone,
      first_name,
      last_name,
      udf6,
      udf7,
      udf8,
      udf9,
      udf10,
    });

    return res.status(200).json({
      StatusCode: 200,
      orderId: order_id,
      redict_url: orderSessionResp.payment_links.web,
    });

  } catch (error) {
    console.error(error);
    if (error instanceof APIException) {
      return res.send("PaymentHandler threw some error");
    }
    return res.status(500).send("Something went wrong");
  }
};

const InitiatePayment = async (req, res) => {
  await new Promise((resolve) => upload.any()(req, res, resolve)); // Parse FormData

  const order_id = req.body.order_id;

  const order = await ReceiptSchema.findOne({ orderId: order_id });
  if (!order) {
    return res.status(400).json({ error: "Invalid order ID" });
  }

  const amount = order.price; // trusted
  const returnUrl = `https://api.thelovefools.in/api/user/handlePaymentResponse`;
  const paymentHandler = PaymentHandler.getInstance(order_id);

  try {
    const orderSessionResp = await paymentHandler.orderSession({
      order_id,
      amount,
      currency: "INR",
      return_url: returnUrl,
      customer_id: "customer_" + order_id,
      customer_email: req.body.customer_email,
      customer_phone: req.body.customer_phone,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      udf6: req.body.udf6,
      udf7: req.body.udf7,
      udf8: req.body.udf8,
      udf9: req.body.udf9,
      udf10: req.body.udf10,
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

  if (!orderId) {
    return res.send("Something went wrong");
  }

  try {

    // Wait 5 seconds to test logs
    // await new Promise(resolve => setTimeout(resolve, 10000));

    // Continue after delay & Get real order from DB
    const receipt = await ReceiptSchema.findOne({ orderId });
    if (!receipt) {
      return res.send("HPR: Invalid order ID");
    }

    const trustedAmount = receipt.price; // your trusted amount
    console.log("Client says amount:", req.body.amount);
    console.log("Trusted DB amount:", trustedAmount);

    // 🔐 Validate HMAC
    if (!validateHMAC_SHA256(req.body, paymentHandler.getResponseKey())) {
      return res.send("Signature verification failed");
    }

    const orderStatusResp = await paymentHandler.orderStatus(orderId);
    const orderStatus = orderStatusResp.status;

    const gatewayAmount = orderStatusResp.amount;
    if (Number(gatewayAmount) !== Number(trustedAmount)) {
      return res.send("Amount mismatch: possible tampering detected.");
    }

    // Send WhatsApp & update DB
    if (orderStatus === "CHARGED") {
      try {
        await axios.post(
          `https://api.thelovefools.in/api/user/whatsappSuccess`,
          {
            mobile: orderStatusResp.customer_phone,
            bookingId: orderId,
            bookedRoom: orderStatusResp.udf6,
            bookedTable: orderStatusResp.udf7,
            bookedMenu: orderStatusResp.udf10,
            advancePayment: gatewayAmount,
            bookingDate: orderStatusResp.udf8,
            bookingTime: orderStatusResp.udf9,
          }
        );
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
    const receipt = await ReceiptSchema.findOne({ orderId: req.body.order_id });
    if (!receipt) {
      return res.status(400).send("IPR: Invalid order ID");
    }

    const originalAmount = receipt.price;
    const requestedAmount = Number(req.body.amount);
    if (requestedAmount <= 0 || requestedAmount > originalAmount) {
      return res.status(400).send("IPR: Invalid refund amount");
    }

    const refundResp = await paymentHandler.refund({
      order_id: req.body.order_id,
      amount: requestedAmount,
      unique_request_id: req.body.unique_request_id || `refund_${Date.now()}`,
    });

    const html = makeOrderStatusResponse(
      "Merchant Refund Page",
      `Refund status: ${refundResp.status}`,
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
  CreateBookingAndInitiatePayment,
  InitiatePayment,
  InitiatePaymentRefund,
  HandlePaymentresponse,
};
