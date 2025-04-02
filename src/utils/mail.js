const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "server353.web-hosting.com",
  port: 465,
  secure: true,
  auth: {
    user: "no-reply@microwebglobal.com",
    pass: "_U#az=0FD*kq",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

class MailService {
  static async sendMail(to, subject, html) {
    try {
      const mailOptions = {
        from: "no-reply@microwebglobal.com",
        to,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      return null;
    }
  }

  static getPasswordSetupTemplate(userName, passwordLink) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Set Up Your Password</title>
            <style>
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .container {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .link-text {
                    word-break: break-all;
                    color: #007bff;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Welcome to Our Platform!</h2>
                <p>Hello ${userName},</p>
                <p>Your service provider account has been approved. Please set up your password using the link below:</p>
                <p>
                    <a href="${passwordLink}" class="button">Set Up Password</a>
                </p>
                <p>Or copy and paste this link in your browser:</p>
                <p class="link-text">
                    ${passwordLink}
                </p>
                <p>This link will expire in 24 hours for security reasons.</p>
                <p>If you did not request this, please ignore this email.</p>
                <p>Best regards,<br>Your Platform Team</p>
            </div>
        </body>
        </html>
        `;
  }

  static getRegistrationSuccessTemplate(userName) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Registration Successful</title>
            <style>
                .container {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Registration Successful!</h2>
                <p>Hello ${userName},</p>
                <p>Thank you for registering as a service provider. Your registration has been received and is currently under review.</p>
                <p>Our team will review your application and get back to you shortly. Once approved, you will receive another email with instructions to set up your password.</p>
                <p>Best regards,<br>Your Platform Team</p>
            </div>
        </body>
        </html>
        `;
  }

  static async sendPasswordSetupEmail(user, passwordLink) {
    const template = this.getPasswordSetupTemplate(user.name, passwordLink);
    return this.sendMail(
      user.email,
      "Set Up Your Password - Service Provider Account",
      template
    );
  }

  static async sendRegistrationSuccessEmail(user) {
    const template = this.getRegistrationSuccessTemplate(user.name);
    return this.sendMail(
      user.email,
      "Registration Received - Service Provider Account",
      template
    );
  }

  static getEnquiryReceivedTemplate(userName, businessType) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Enquiry Received</title>
            <style>
                .container {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Enquiry Received</h2>
                <p>Hello ${userName},</p>
                <p>Thank you for your interest in becoming a ${businessType} service provider. We have received your enquiry and our team will review it shortly.</p>
                <p>You will receive another email once your enquiry has been reviewed with further instructions.</p>
                <p>Best regards,<br>Your Platform Team</p>
            </div>
        </body>
        </html>
        `;
  }

  static getEnquiryApprovedTemplate(userName, registrationLink) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Enquiry Approved</title>
            <style>
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .container {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .link-text {
                    word-break: break-all;
                    color: #007bff;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Enquiry Approved!</h2>
                <p>Hello ${userName},</p>
                <p>We're pleased to inform you that your service provider enquiry has been approved.</p>
                <p>Please click the button below to complete your registration:</p>
                <p>
                    <a href="${registrationLink}" class="button">Complete Registration</a>
                </p>
                <p>Or copy and paste this link in your browser:</p>
                <p class="link-text">
                    ${registrationLink}
                </p>
                <p>This registration link will expire in 7 days for security reasons.</p>
                <p>Best regards,<br>Your Platform Team</p>
            </div>
        </body>
        </html>
        `;
  }

  static getEnquiryRejectedTemplate(userName, reason) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Enquiry Rejected</title>
            <style>
                .container {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    background-color: #f8f8f8;
                }
                .reason {
                    font-style: italic;
                    color: #d9534f;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Enquiry Rejected</h2>
                <p>Hello ${userName},</p>
                <p>We regret to inform you that your service provider enquiry has been rejected.</p>
                <p><strong>Reason:</strong> <span class="reason">${reason}</span></p>
                <p>If you believe this was a mistake or need further clarification, please contact our support team.</p>
                <p>Best regards,<br>Your Platform Team</p>
            </div>
        </body>
        </html>
        `;
  }

  static async sendEnquiryReceivedEmail(user, businessType) {
    const template = this.getEnquiryReceivedTemplate(user.name, businessType);
    return this.sendMail(
      user.email,
      "Service Provider Enquiry Received",
      template
    );
  }

  static async sendEnquiryApprovedEmail(user, registrationLink) {
    const template = this.getEnquiryApprovedTemplate(
      user.name,
      registrationLink
    );
    return this.sendMail(
      user.email,
      "Service Provider Enquiry Approved - Complete Your Registration",
      template
    );
  }

  static async sendEnquiryRejectEmail(user, reason) {
    const template = this.getEnquiryRejectedTemplate(user.name, reason);
    return this.sendMail(
      user.email,
      "Service Provider Enquiry Rejected - Plaese Re-Apply",
      template
    );
  }

  static getProviderRejectTemplate(
    userName,
    reason,
    fields,
    reRegistrationLink
  ) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Enquiry Rejected</title>
            <style>
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .container {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .link-text {
                    word-break: break-all;
                    color: #007bff;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Enquiry Approved!</h2>
                <p>Hello ${userName},</p>
                <p>We're sorry to inform you that your service provider enquiry has been rejected.</p>
                <p>Reason: ${reason}</p>
                ${
                  fields && fields.length > 0
                    ? `<p>Affected Submissions: ${fields
                        .map((field) => field.label)
                        .join(", ")}</p>`
                    : ""
                }
                <p>Please click the button below to complete your registration:</p>
                <p>
                    <a href="${reRegistrationLink}" class="button">Complete Registration</a>
                </p>
                <p>Or copy and paste this link in your browser:</p>
                <p class="link-text">
                    ${reRegistrationLink}
                </p>
                <p>This registration link will expire in 7 days for security reasons.</p>
                <p>Best regards,<br>Your Platform Team</p>
            </div>
        </body>
        </html>
        `;
  }

  static async sendProviderRejectEmail(
    user,
    reason,
    fields,
    reRegistrationLink
  ) {
    const template = this.getProviderRejectTemplate(
      user.name,
      reason,
      fields,
      reRegistrationLink
    );
    return this.sendMail(
      user.email,
      "Service Provider Rejected - Plaese Re-Apply",
      template
    );
  }
}

module.exports = MailService;
