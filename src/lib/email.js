import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // app password or email password
  },
});

export const sendTeamNotificationEmail = async (order) => {
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
  console.log('TEAM_EMAIL:', process.env.TEAM_EMAIL);

  console.log('function working');
  const productList = order.products
    .map((p) => `${p.title} (x${p.quantity})`)
    .join(', ');

  const mailOptions = {
    from: `"Your Store" <${process.env.EMAIL_USER}>`,
    to: process.env.TEAM_EMAIL, // team email address
    subject: 'New Bulky Product Order Received',
    html: `
      <h2>Bulky Product Order Alert</h2>
      <p><strong>User ID:</strong> ${order.user}</p>
      <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
      <p><strong>Products:</strong> ${productList}</p>
      <p><strong>Total:</strong> ₹${order.total}</p>
      <p>Check the admin panel for more details.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
