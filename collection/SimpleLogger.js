const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { EOL } = require("os");

class SimpleLoggerS3 {
  constructor(paymentRequestId) {
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
    this.paymentRequestId = paymentRequestId || Date.now(); // Use request ID or timestamp
    this.fileName = `transaction-logs/log_new_${this.paymentRequestId}.log`; // Unique file name for the operation
  }

  // Log a message (log is accumulated in memory)
  async log(level, apiTag, paymentRequestId, message, value) {
    if (this.disableLogging) return;
    const timestamp = this.formatDateTime(Date.now());
    let valueStr = typeof value === "object" ? JSON.stringify(value) : value;
    const logMessage = `${timestamp} [${level.toUpperCase()}] apiTag2=${apiTag}, paymentRequestId=${paymentRequestId}, message=${message}, value=${valueStr}${EOL}`;    
    this.logBuffer += logMessage; // Accumulate log in the buffer
    await this.uploadLogToS3();
  }

  // Upload log to S3 once the operation is completed
  async uploadLogToS3() {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: this.fileName,
        Body: this.logBuffer,
        ContentType: "text/plain",
      });
      await this.s3.send(command);
      console.log("Log uploaded to S3 successfully.");
      this.logBuffer = ""; // Clear the buffer after upload
    } catch (error) {
      console.error("Error uploading log to S3:", error);
    }
  }

  // Convenience methods for logging different levels
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
