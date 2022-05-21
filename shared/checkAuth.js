const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
    if (req.method === "OPTION") {
        return next();
    }
    try {
        let decodedToken;
        let token = req.header("Authorization").split(" ")[1];
        console.log("Token AUth", token);
        if (!token) {
            throw new HttpError("Authentication failed...", 401);
        }
        try {
            decodedToken = jwt.verify(token, "mySecretKey");
        } catch (err) {
            throw new HttpError(err, 500);
        }

        if (!decodedToken) {
            throw new HttpError("not authenticated", 401);
        }

        req.userId = decodedToken.userId;
        // req.userMobile = decodedToken.mobile;

        next();
    } catch (err) {
        return next(new HttpError(err, 401));
    }
};
