const express = require('express');


const logout = async (req, res) => {
    /*if (!req.session.userId) {
       return res.status(401).json({ error: 'Not Authenticated' });
   }*/
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
    });
}

module.exports = { logout };