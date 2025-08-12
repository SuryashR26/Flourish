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

const inactiveUsers = async () => {
    try {
        const users = await pool.query(
            'SELECT email FROM users WHERE (first_name IS NOT NULL OR last_name IS NOT NULL) AND last_active < NOW() - INTERVAL \'3 days\''
        );

        const emails = users.rows.map(user => user.email);

        if (emails.length === 0) {
            console.log('No Inactive users found');
            return;
        }

        for (const email of emails) {
            const mailOptions = {
                from: '"Flourish" <FlourishIdeaBoard@gmail.com>',
                to: email,
                subject: 'We Miss You at Flourish! Come Back and Explore',
                html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                  <h2 style="color: #4CAF50;">We Miss You at Flourish!</h2>
                  <p>Dear Flourish User,</p>
                  <p>It’s been some time since we last saw you on Flourish, and we truly miss having you as part of our vibrant community. We've been hard at work adding exciting new features, tools, and opportunities designed to help you bring your ideas to life and connect with others who share your passions.</p>
                  <p>Whether you're looking to collaborate on innovative projects, learn new skills, or simply find inspiration, Flourish offers a supportive space tailored for creators like you.</p>
                  <p style="text-align: center;">
                    <a href="http://localhost:3000/login"
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
                      Log Back In and Explore
                    </a>
                  </p>
                  <p>If you’ve encountered any issues or have questions, our team is always here to help. Feel free to reach out or check out our latest updates and resources once you log back in.</p>
                  <p>Thank you for being an important part of the Flourish community. We’re excited to see what you’ll create next!</p>
                  <hr style="border:none; border-top:1px solid #eee;" />
                  <p style="font-size: 0.9em; color: #666;">Warm regards,<br />The Flourish Team</p>
                </div>
              `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${email} (Inactive User)`);
        }



    } catch (error) {
        console.error('Error sending incomplete registration emails:', error);
    }
};

module.exports = inactiveUsers;
