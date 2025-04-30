const axios = require('axios');

const WhatsappOtp = async (req, res) => {
  const { mobile, otp } = req.body; // make sure you're sending `mobile` and `otp` in the request body

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: mobile,
    type: "template",
    template: {
      language: { code: "en" },
      name: "booking_confirmation",
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: '' + otp
            }
          ]
        }
      ]
    }
  };

  const headers = {
    "Content-Type": "application/json",
    "wanumber": "919820203350",
    "apikey": "0f23b062-0f82-11f0-ad4f-92672d2d0c2d"
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
  WhatsappOtp,
};
