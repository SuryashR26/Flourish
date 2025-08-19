const pool = require('../sql/dB.js');
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

const weeklyDigest = async () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    if (dayOfWeek !== 0) {
        console.log('Today is not Sunday. Exiting function.');
        return;
    }

    try {
        const users = await pool.query(
            'SELECT id, email, first_name FROM users WHERE (first_name IS NOT NULL OR last_name IS NOT NULL) AND hasPosted = false'
        );

        const emails = users.rows.map(user => user.email);





        const most_viewed = await pool.query(`
            SELECT post_id, COUNT(*) AS view_count
            FROM notifications
            WHERE type = 'view'
            AND created_at >= NOW() - INTERVAL '7 days'
            GROUP BY post_id
            ORDER BY view_count DESC
            LIMIT 1
        `);

        let mostViewedHTML = "";
        if (most_viewed.rows.length > 0) {
            const most_viewed_post = await pool.query(
                'SELECT title FROM postData WHERE id = $1',
                [most_viewed.rows[0].post_id]
            );

            if (most_viewed_post.rows.length > 0) {
                mostViewedHTML = `<li><b>${most_viewed_post.rows[0].title}</b> was viewed ${most_viewed.rows[0].view_count} times this week.</li>`;
            }
        }

        const most_bookmarked = await pool.query(`
            SELECT post_id, COUNT(*) AS bookmark_count
            FROM notifications
            WHERE type = 'bookmark'
            AND created_at >= NOW() - INTERVAL '7 days'
            GROUP BY post_id
            ORDER BY bookmark_count DESC
            LIMIT 1
        `);

        let mostBookmarkedHTML = "";
        if (most_bookmarked.rows.length > 0) {
            const most_bookmarked_post = await pool.query(
                'SELECT title FROM postData WHERE id = $1',
                [most_bookmarked.rows[0].post_id]
            );

            if (most_bookmarked_post.rows.length > 0) {
                mostBookmarkedHTML = `<li><b>${most_bookmarked_post.rows[0].title}</b> inspired ${most_bookmarked.rows[0].bookmark_count} people to save it this week.</li>`;
            }
        }

        const most_clicked = await pool.query(`
            SELECT post_id, COUNT(*) AS click_count
            FROM notifications
            WHERE type = 'click'
            AND created_at >= NOW() - INTERVAL '7 days'
            GROUP BY post_id
            ORDER BY click_count DESC
            LIMIT 1
        `);

        let mostClickedHTML = "";
        if (most_clicked.rows.length > 0) {
            const most_clicked_post = await pool.query(
                'SELECT title FROM postData WHERE id = $1',
                [most_clicked.rows[0].post_id]
            );

            if (most_clicked_post.rows.length > 0) {
                mostClickedHTML = `<li><b>${most_clicked_post.rows[0].title}</b> caught attention with ${most_clicked.rows[0].click_count} clicks this week!</li>`;
            }
        }



        if (emails.length === 0) {
            console.log('No users found');
            return;
        }


        for (const user of users.rows) {
            const mailOptions = {
                from: '"Flourish" <FlourishIdeaBoard@gmail.com>',
                to: user.email,
                subject: 'See What You Missed on Flourish This Week',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px;">
                        <h2 style="color:#4CAF50;">Hi ${user.first_name || "there"},</h2>
                        <p style="font-size:16px; color:#333;">Here’s what’s been happening on <b>Flourish</b> this week:</p>
          
                         <!-- Community highlights -->
                        <div style="margin:20px 0;">
                            <h3 style="color:#333;">Trending Projects</h3>
                            <ul style="font-size:15px; color:#555; line-height:1.6;">
                                ${mostViewedHTML || "<li>No projects caught many views this week — yours could be the one everyone notices!</li>"}
                                ${mostBookmarkedHTML || "<li>No projects were bookmarked this week — save your favorites and start a trend!</li>"}
                                ${mostClickedHTML || "<li>No projects were clicked into this week — dive in and discover something new!</li>"}
                            </ul>
                        </div>
    
                         <!-- Call to action -->
                        <div style="text-align:center; margin:30px 0;">
                            <a href="" style="background:#4CAF50; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">
                            Share Your First Project
                            </a>
                        </div>
    
                        <p style="font-size:14px; color:#777;">Your ideas matter. Start building today 🚀</p>
                        <p style="font-size:14px; color:#777;">– The Flourish Team</p>
                    </div>  `
            };
            try {
                await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${user.email}`);
            } catch (err) {
                console.error(`Failed to send email to ${user.email}:`, err);
            }
        }




        const post_users = await pool.query(`
            SELECT id, email, first_name
            FROM users
            WHERE (first_name IS NOT NULL OR last_name IS NOT NULL)
            AND hasPosted = true
        `);

        const userIds = post_users.rows.map(u => u.id);

        if (userIds.rows.length < 1) {
            console.log("No Posting Users")
            return;
        }


        const allUserPosts = await pool.query(`
            SELECT p.user_id, p.title,
                COUNT(n_view.*) AS view_count,
                COUNT(n_click.*) AS click_count,
                COUNT(n_bookmark.*) AS bookmark_count
            FROM postData p
            LEFT JOIN notifications n_view
                ON n_view.post_id = p.id AND n_view.type='view'
                AND n_view.created_at >= NOW() - INTERVAL '7 days'
            LEFT JOIN notifications n_click
                ON n_click.post_id = p.id AND n_click.type='click'
                AND n_click.created_at >= NOW() - INTERVAL '7 days'
            LEFT JOIN notifications n_bookmark
                ON n_bookmark.post_id = p.id AND n_bookmark.type='bookmark'
                AND n_bookmark.created_at >= NOW() - INTERVAL '7 days'
            WHERE p.user_id = ANY($1)
            GROUP BY p.user_id, p.id
            ORDER BY p.user_id;
        `, [userIds]);

        const postsByUser = {};
        allUserPosts.rows.forEach(post => {
            if (!postsByUser[post.user_id]) postsByUser[post.user_id] = [];
            postsByUser[post.user_id].push(post);
        });


        for (const user of post_users.rows) {
            const userPosts = postsByUser[user.id] || [];

            const userPostsHTML = userPosts.length > 0
                ? userPosts.map(post =>
                    `<li><b>${post.title}</b> — ${post.view_count} views, ${post.click_count} clicks, ${post.bookmark_count} bookmarks this week</li>`
                ).join('')
                : `<li>You haven’t posted anything yet — share your ideas and see them grow!</li>`;

            const mailOptions = {
                from: '"Flourish" <FlourishIdeaBoard@gmail.com>',
                to: user.email,
                subject: 'See How Your Projects Performed This Week',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px;">
                    <h2 style="color:#4CAF50;">Hi ${user.first_name || "there"},</h2>
                    <p style="font-size:16px; color:#333;">Here’s how your projects performed this week:</p>
            
                    <div style="margin:20px 0;">
                        <h3 style="color:#333;">Your Projects</h3>
                        <ul style="font-size:15px; color:#555; line-height:1.6;">
                        ${userPostsHTML}
                        </ul>
                    </div>
            
                    <div style="text-align:center; margin:30px 0;">
                        <a href="https://flourish.com/dashboard" style="background:#4CAF50; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">
                        View Your Projects
                        </a>
                    </div>
            
                    <p style="font-size:14px; color:#777;">Keep sharing your ideas — the community is waiting! </p>
                    <p style="font-size:14px; color:#777;">– The Flourish Team</p>
                    </div>
      `
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${user.email}`);
            } catch (err) {
                console.error(`Failed to send email to ${user.email}:`, err);
            }
        }






    } catch (error) {
        console.error('Error sending weekly digest email:', error);
    }
}

module.exports = { weeklyDigest };