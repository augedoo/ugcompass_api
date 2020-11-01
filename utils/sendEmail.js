const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const sendEmail = async (options) => {
  let transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key: `${process.env.SMTP_KEY}`,
      },
    })
  );

  const message = {
    to: options.email,
    from: `${process.env.FROM_EMAIL}`,
    subject: options.subject,
    html: options.message,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info);
};

module.exports = sendEmail;
