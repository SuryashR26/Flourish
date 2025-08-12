const pool = require('../sql/dB');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'FlourishIdeaBoard@gmail.com',
        pass: 'itzd ikju gkpr mudb',
    },
    family: 4 // force IPv4
});

const incompleteRegistration = async () => {
    try {
        const users = await pool.query(
            'SELECT email FROM users WHERE first_name IS NULL OR last_name IS NULL'
        );

        const emails = users.rows.map(user => user.email);

        if (emails.length === 0) {
            console.log('No incomplete registrations found');
            return;
        }

        for (const email of emails) {
            const mailOptions = {
                from: '"Flourish" <FlourishIdeaBoard@gmail.com>',
                to: email,
                subject: 'Complete Your Registration on Flourish',
                html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                  <h2 style="color: #4CAF50;">Complete Your Flourish Registration</h2>
                  <p>Dear Flourish User,</p>
                  <p>Thank you for starting your journey with Flourish! We noticed that your registration is not yet complete, and we want to help you unlock all the exciting features and benefits that Flourish has to offer.</p>
                  <p>Completing your registration will give you full access to our platform where you can connect with creative minds, collaborate on inspiring projects, and grow your ideas in a supportive community.</p>
                  <p style="text-align: center;">
                    <a href="http://localhost:3000/signup"
                      style="
                        background-color: #4CAF50;
                        color: white;
                        padding: 14px 28px;
                        text-decoration: none;
                        border-radius: 6px;
                        display: inline-block;
                        font-weight: bold;
                        font-size: 16px;
                      ">
                      Complete Your Registration
                    </a>
                  </p>
                  <p>If you’ve already completed your registration, please ignore this message. Otherwise, we encourage you to finish signing up today to start making the most of Flourish.</p>
                  <p>If you have any questions or need assistance, our support team is here to help you every step of the way.</p>
                  <p>Thank you for being a valued member of the Flourish community. We’re excited to see what you’ll create!</p>
                  <hr style="border:none; border-top:1px solid #eee;" />
                  <p style="font-size: 0.9em; color: #666;">Warm regards,<br />The Flourish Team</p>
                </div>
              `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${email}`);
        }


    } catch (error) {
        console.error('Error sending incomplete registration emails:', error);
    }
};

module.exports = incompleteRegistration;
