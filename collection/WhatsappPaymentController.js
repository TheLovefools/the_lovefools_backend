const axios = require('axios');
const config = require("./config.json"); // Adjust path if needed
const WHATSAPP_NUMBER = config.WHATSAPP_NUMBER;
const WHATSAPP_API_KEY = config.WHATSAPP_API_KEY;

const WhatsappPaymentConfirmation = async (req, res) => {
  const { mobile, bookingDate, amount } = req.body; // make sure you're sending `mobile` and `otp` in the request body

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: mobile,
    type: "template",
    template: {
      language: { code: "en" },
      name: "booking_success",
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: "text1"
            },
            {
              type: "text",
              text: "text2"
            },
            {
              type: "text",
              text: "text3"
            },
            {
              type: "text",
              text: "text4"
            },
            {
              type: "text",
              text: amount
            },
            {
              type: "text",
              text: bookingDate
            },
            {
              type: "text",
              text: "text7"
            },
          ]
        }
      ]
    }
  }

  const headers = {
    "Content-Type": "application/json",
    "wanumber": WHATSAPP_NUMBER,
    "apikey": WHATSAPP_API_KEY
  };

  try {
    const data = await axios.post(
      "https://partners.pinbot.ai/v1/messages",
      payload,
      { headers }
    );

    res.status(200).json({ StatusCode: 200, data: data.data });
  } catch (error) {
    console.error(error?.response?.data || error.message);
    res.status(500).json({
      message: "Error sending WhatsApp OTP",
      error: error?.response?.data || error.message
    });
  }
};

module.exports = {
  WhatsappPaymentConfirmation,
};
