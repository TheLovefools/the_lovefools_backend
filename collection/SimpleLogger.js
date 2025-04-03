const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

class SimpleLoggerS3 {
  constructor() {
    this.disableLogging = false;
    this.s3 = new S3Client({
      region: process.env.AWS_REGION, // e.g., "us-east-1"
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.AWS_BUCKET_NAME; // e.g., "my-app-logs"
    this.logBuffer = "";
  }

  async log(level, apiTag, paymentRequestId, message, value) {
    if (this.disableLogging) return;
    
    const timestamp = this.formatDateTime(Date.now());
    let valueStr = typeof value === "object" ? JSON.stringify(value) : value;
    const logMessage = `${timestamp} [${level.toUpperCase()}] apiTag=${apiTag}, paymentRequestId=${paymentRequestId}, message=${message}, value=${valueStr}\n`;
    
    this.logBuffer += logMessage;
    await this.uploadLogToS3();
  }

  async uploadLogToS3() {
    try {
      const fileName = `logs/log_${Date.now()}.log`; // Save logs in "logs/" folder
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: this.logBuffer,
        ContentType: "text/plain",
      });
      await this.s3.send(command);
      this.logBuffer = "";
    } catch (error) {
      console.error("Error uploading log to S3:", error);
    }
  }

  info(apiTag, paymentRequestId, message, value) {
    this.log("info", apiTag, paymentRequestId, message, value);
  }

  error(apiTag, paymentRequestId, message, value) {
    this.log("error", apiTag, paymentRequestId, message, value);
  }

  formatDateTime(timestamp) {
    return new Date(timestamp).toISOString();
  }
}

module.exports = { SimpleLoggerS3 };
