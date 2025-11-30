const nodemailer = require('nodemailer');

const sendOrderEmail = async (order, user) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const itemsHTML = order.items
      .map(item => `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px;">${item.name}</td>
          <td style="padding: 10px; text-align: center;">${item.size}</td>
          <td style="padding: 10px; text-align: center;">x${item.quantity}</td>
          <td style="padding: 10px; text-align: right;">₹${item.price.toFixed(2)}</td>
          <td style="padding: 10px; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `)
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px; background-color: #f9f9f9; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${user.name}</strong>,</p>
              <p>Thank you for your order! Your order has been confirmed and will be processed soon.</p>
              
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>Status:</strong> <span style="color: green; font-weight: bold;">${order.status.toUpperCase()}</span></p>
              
              <h3>Items Ordered</h3>
              <table>
                <thead>
                  <tr style="background-color: #007bff; color: white;">
                    <th style="padding: 10px;">Product</th>
                    <th style="padding: 10px;">Size</th>
                    <th style="padding: 10px;">Qty</th>
                    <th style="padding: 10px;">Price</th>
                    <th style="padding: 10px;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
              
              <div style="text-align: right; padding: 20px; background-color: white; border-radius: 5px;">
                <h3 style="color: #007bff;">Total Amount: ₹${order.totalPrice.toFixed(2)}</h3>
              </div>
              
              <p style="margin-top: 20px;">Thank you for shopping with us!</p>
              <p>If you have any questions, please contact our customer support.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Clothing Store. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order Confirmation - Order #${order._id}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${user.email}`);
  } catch (err) {
    console.error('❌ Error sending email:', err.message);
    throw err;
  }
};

module.exports = { sendOrderEmail };