function checkAlreadyLoggedIn(req, res, next) {
    console.log('Session in checkAlreadyLoggedIn:', req.session);
    if (req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "You're already logged in"
        });
    }
    next();
}

module.exports = { checkAlreadyLoggedIn }