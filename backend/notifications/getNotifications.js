const pool = require('../sql/dB.js');

const getNotifications = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    try {
        const userId = req.session.userId;
        const notificationsArray = [];


        // Aggregated views (no actor needed here)
        // Aggregated views
        const views = await pool.query(
            `
            SELECT 
                n.target_id, 
                COUNT(*) AS total_views, 
                MAX(n.created_at) AS latest_view, 
                MAX(n.read_at) AS read_at,
                n.post_title,
                n.user_image
            FROM notifications n
            WHERE n.recipient_id = $1
              AND n.event_type = 'view'
              AND n.created_at >= NOW() - INTERVAL '30 days'
            GROUP BY n.target_id, n.post_title, n.user_image
            HAVING 
                COUNT(*) < 5
             OR (COUNT(*) BETWEEN 5 AND 50 AND COUNT(*) % 5 = 0)
             OR (COUNT(*) BETWEEN 51 AND 100 AND COUNT(*) % 10 = 0)
             OR (COUNT(*) BETWEEN 101 AND 500 AND COUNT(*) % 50 = 0)
             OR (COUNT(*) > 500 AND COUNT(*) <= 1000 AND COUNT(*) % 100 = 0)
             OR (COUNT(*) > 1000 AND COUNT(*) % 1000 = 0)
            `,
            [userId]
        );

        views.rows.forEach(row => {
            notificationsArray.push({
                type: 'view',
                targetId: row.target_id,
                actorId: null,
                user_image: '⚡',
                post_title: row.post_title,
                actor_name: '⚡',
                message: `${row.post_title} got ${row.total_views} views`,
                created_at: row.latest_view,
                read_at: row.read_at || "unread"
            });
        });

        const clicks = await pool.query(
            `
            SELECT 
                n.target_id, 
                n.actor_id, 
                n.actor_name, 
                COUNT(*) AS total_clicks, 
                MAX(n.created_at) AS latest_click, 
                MAX(n.read_at) AS read_at,
                n.post_title,
                n.user_image
            FROM notifications n
            WHERE n.recipient_id = $1
              AND n.event_type = 'click'
              AND n.created_at >= NOW() - INTERVAL '30 days'
            GROUP BY n.target_id, n.actor_id, n.actor_name, n.post_title, n.user_image
            HAVING 
                COUNT(*) < 5
             OR (COUNT(*) BETWEEN 5 AND 50 AND COUNT(*) % 5 = 0)
             OR (COUNT(*) BETWEEN 51 AND 100 AND COUNT(*) % 10 = 0)
             OR (COUNT(*) BETWEEN 101 AND 500 AND COUNT(*) % 50 = 0)
             OR (COUNT(*) > 500 AND COUNT(*) <= 1000 AND COUNT(*) % 100 = 0)
             OR (COUNT(*) > 1000 AND COUNT(*) % 1000 = 0)
            `
            , [userId]
        );

        clicks.rows.forEach(row => {
            notificationsArray.push({
                type: 'click',
                actorId: row.actor_id,
                actor_name: row.actor_name,
                user_image: row.user_image,
                post_title: row.post_title,
                targetId: row.target_id,
                message: `${row.actor_name} clicked your ${row.post_title}`,
                created_at: row.latest_click,  // use MAX(created_at)
                read_at: row.read_at || "unread"
            });
        });

        // Bookmarks
        const bookmarks = await pool.query(
            `SELECT actor_id, actor_name, target_id, created_at, read_at, post_title, user_image
             FROM notifications
             WHERE recipient_id = $1
             AND event_type = 'bookmark'
             AND created_at >= NOW() - INTERVAL '30 days'`,
            [userId]
        );

        bookmarks.rows.forEach(row => {
            notificationsArray.push({
                type: 'bookmark',
                actorId: row.actor_id,
                actor_name: row.actor_name,
                user_image: row.user_image,
                post_title: row.post_title,
                targetId: row.target_id,
                message: `${row.actor_name} bookmarked your post: ${row.post_title}`,
                created_at: row.created_at,
                read_at: row.read_at || "unread"
            });
        });


        // sort notifications by most recent
        notificationsArray.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json({ notifications: notificationsArray });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getViews = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not Authenticated' });
    }

    try {
        const userId = req.session.userId;

        // 1. Daily totals for last 6 days
        const viewsResult = await pool.query(
            `
            SELECT
                g.day::date AS day,
                COALESCE(n.total_views, 0) AS total_views
            FROM generate_series(
                    CURRENT_DATE - INTERVAL '5 days',
                    CURRENT_DATE,
                    INTERVAL '1 day'
                ) AS g(day)
            LEFT JOIN (
                SELECT DATE(created_at) AS day, COUNT(*) AS total_views
                FROM notifications
                WHERE recipient_id = $1 AND event_type = 'view'
                GROUP BY DATE(created_at)
            ) n ON n.day = g.day
            ORDER BY g.day;
            `,
            [userId]
        );

        const viewsData = viewsResult.rows.map(row => ({
            day: row.day.toISOString().slice(0, 10),
            total: parseInt(row.total_views, 10),
        }));

        // 2. Total views this week and last week
        const totalResult = await pool.query(
            `
            SELECT
                COALESCE(this_week.total, 0) AS this_week_total,
                COALESCE(last_week.total, 0) AS last_week_total,
                CASE 
                    WHEN COALESCE(last_week.total, 0) = 0 THEN NULL
                    ELSE ROUND(((COALESCE(this_week.total, 0) - COALESCE(last_week.total, 0))::decimal / last_week.total) * 100, 2)
                END AS percent_change
            FROM
                (SELECT COUNT(*) AS total 
                 FROM notifications 
                 WHERE recipient_id = $1 AND event_type = 'view' 
                   AND created_at >= CURRENT_DATE - INTERVAL '5 days') AS this_week
            CROSS JOIN
                (SELECT COUNT(*) AS total 
                 FROM notifications 
                 WHERE recipient_id = $1 AND event_type = 'view' 
                   AND created_at BETWEEN CURRENT_DATE - INTERVAL '11 days' AND CURRENT_DATE - INTERVAL '6 days') AS last_week;
            `,
            [userId]
        );

        const { this_week_total, last_week_total, percent_change } = totalResult.rows[0];

        // 3. Return combined data
        res.json({
            dailyViews: viewsData,
            summary: {
                thisWeek: parseInt(this_week_total, 10),
                lastWeek: parseInt(last_week_total, 10),
                percentChange: percent_change !== null ? parseFloat(percent_change) : null,
            },
        });

    } catch (error) {
        console.error('Error fetching views:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getClicks = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not Authenticated' });

    try {
        const userId = req.session.userId;

        // Day-by-day clicks
        const clickResult = await pool.query(
            `
        SELECT
            g.day::date AS day,
            COALESCE(n.total_clicks, 0) AS total_clicks
        FROM generate_series(
            CURRENT_DATE - INTERVAL '5 days',
            CURRENT_DATE,
            INTERVAL '1 day'
        ) AS g(day)
        LEFT JOIN (
            SELECT DATE(created_at) AS day, COUNT(*) AS total_clicks
            FROM notifications
            WHERE recipient_id = $1 AND event_type = 'click'
            GROUP BY DATE(created_at)
        ) n ON n.day = g.day
        ORDER BY g.day;
        `,
            [userId]
        );

        // Previous week clicks for comparison
        const prevWeekResult = await pool.query(
            `
        SELECT COALESCE(SUM(total_clicks),0) AS prev_total
        FROM (
            SELECT DATE(created_at) AS day, COUNT(*) AS total_clicks
            FROM notifications
            WHERE recipient_id = $1 AND event_type = 'click'
              AND created_at >= CURRENT_DATE - INTERVAL '12 days'
              AND created_at < CURRENT_DATE - INTERVAL '6 days'
            GROUP BY DATE(created_at)
        ) t;
        `,
            [userId]
        );

        const clickData = clickResult.rows.map(row => ({
            day: row.day.toISOString().slice(0, 10),
            total: parseInt(row.total_clicks, 10),
        }));

        const totalThisWeek = clickData.reduce((sum, row) => sum + row.total, 0);
        const totalLastWeek = parseInt(prevWeekResult.rows[0].prev_total, 10);
        const trend = totalThisWeek >= totalLastWeek ? 'up' : 'down';
        const difference = totalThisWeek - totalLastWeek;

        res.json({ data: clickData, weekComparison: { trend, difference } });

    } catch (error) {
        console.error('Error fetching clicks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getBookmarks = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not Authenticated' });

    try {
        const userId = req.session.userId;

        const bookmarkResult = await pool.query(
            `
        SELECT
            g.day::date AS day,
            COALESCE(n.total_bookmarks, 0) AS total_bookmarks
        FROM generate_series(
            CURRENT_DATE - INTERVAL '5 days',
            CURRENT_DATE,
            INTERVAL '1 day'
        ) AS g(day)
        LEFT JOIN (
            SELECT DATE(created_at) AS day, COUNT(*) AS total_bookmarks
            FROM notifications
            WHERE recipient_id = $1 AND event_type = 'bookmark'
            GROUP BY DATE(created_at)
        ) n ON n.day = g.day
        ORDER BY g.day;
        `,
            [userId]
        );

        const prevWeekResult = await pool.query(
            `
        SELECT COALESCE(SUM(total_bookmarks),0) AS prev_total
        FROM (
            SELECT DATE(created_at) AS day, COUNT(*) AS total_bookmarks
            FROM notifications
            WHERE recipient_id = $1 AND event_type = 'bookmark'
              AND created_at >= CURRENT_DATE - INTERVAL '12 days'
              AND created_at < CURRENT_DATE - INTERVAL '6 days'
            GROUP BY DATE(created_at)
        ) t;
        `,
            [userId]
        );

        const bookmarkData = bookmarkResult.rows.map(row => ({
            day: row.day.toISOString().slice(0, 10),
            total: parseInt(row.total_bookmarks, 10),
        }));

        const totalThisWeek = bookmarkData.reduce((sum, row) => sum + row.total, 0);
        const totalLastWeek = parseInt(prevWeekResult.rows[0].prev_total, 10);
        const trend = totalThisWeek >= totalLastWeek ? 'up' : 'down';
        const difference = totalThisWeek - totalLastWeek;

        res.json({ data: bookmarkData, weekComparison: { trend, difference } });

    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const markAsReadNotifications = async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not Authenticated' });
    try {
        const userId = req.session.userId;

        await pool.query(
            'UPDATE notifications SET read_at = NOW() WHERE recipient_id = $1 AND read_at IS NULL',
            [userId]
        )
        res.json({ success: true })
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
}

module.exports = { getClicks, getBookmarks, getViews, getNotifications, markAsReadNotifications };
