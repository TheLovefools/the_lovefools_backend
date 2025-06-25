const {
  PaymentHandler,
  APIException,
  validateHMAC_SHA256,
} = require("./PaymentHandler");
const multer = require("multer");
const ReceiptSchema = require("../schema/Receipt");
const MenuSchema = require("../schema/Menu");
const { default: axios } = require("axios");
const upload = multer(); // Middleware for parsing FormData
const fixedPriceForAlacarteMenu = 500; // 500 Rs per person
const setMenuMultiple = 0.5   // your business rule: 50% advance

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
      menu_id,
      menuType,
      subMenuType,
      quantity,
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

    // 1. Validate quantity: must be >= 1
    const qty = Math.max(Number(quantity) || 1, 1);

    // 2. Calculate total amount
    let unitPrice = 0;
    let totalPrice = 0;

    if (menuType === "1") {
      // Ala Carte
      unitPrice = fixedPriceForAlacarteMenu;
      totalPrice = unitPrice * qty;
    } else if (menuType === "2") {
      // Set Menu must have valid ID
      if (!menu_id) {
        return res.status(400).json({ error: "menu_id required for Set Menu" });
      }
      const menu = await MenuSchema.findById(menu_id);
      if (!menu) {
        return res.status(400).json({ error: "Invalid set menu ID" });
      }
      unitPrice = menu.price;
      totalPrice = unitPrice * setMenuMultiple;
    } else {
      return res.status(400).json({ error: "Unknown menu type" });
    }

    // 3. Save trusted booking
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
      price: totalPrice,
      unitPrice: unitPrice,
      quantity: qty,
      type: menuType,
      sub_type: subMenuType,
      orderName: udf10,
      orderStatus: "new",
      orderStatusID: "001",
      paymentSuccess: false,
    });
    await newReceipt.save();

    // 4. Proceed to create payment session
    const returnUrl = `https://api.thelovefools.in/api/user/handlePaymentResponse`;

    const paymentHandler = PaymentHandler.getInstance(order_id);
    const orderSessionResp = await paymentHandler.orderSession({
      order_id,
      amount: totalPrice,
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
    console.error("CBI error:", error);
    if (error instanceof APIException) {
      return res.send("PaymentHandler threw some error");
    }
    return res.status(500).send("CBI_: Something went wrong");
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
    return res.send("IP: Something went wrong");
    // return res.send(error);
  }
};

const HandlePaymentresponse = async (req, res) => {
  const orderId = req.body.order_id || req.body.orderId;
  const paymentHandler = PaymentHandler.getInstance();

  if (!orderId) {
    return res.send("HPR_1: Something went wrong");
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
    const orderStatusId = orderStatusResp.status_id;

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

    // Update orderStatus in DB if charged/not 21==="CHARGED"
    if (orderStatusId === 21 || orderStatus === "CHARGED") {
      try {
        await ReceiptSchema.findOneAndUpdate(
          { orderId },
          {
            orderStatus: orderStatusResp.status,
            orderStatusID: orderStatusId,
            paymentSuccess: true,
          }
        );
        return res.redirect("https://thelovefools.in/order-success");
      } catch (error) {
        console.log("order status charged error", error);
      }
    } else {
      try {
        await ReceiptSchema.findOneAndUpdate(
          { orderId },
          {
            orderStatus: orderStatusResp.status,
            orderStatusID: orderStatusId,
            paymentSuccess: false,
          }
        );
      } catch (error) {
        console.log("orderId update error", error);
      }
    }

    let message = "";
    if (orderStatus) {
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
    return res.send("HPR_2: Something went wrong");
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
    return res.send("IPR: Something went wrong");
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
