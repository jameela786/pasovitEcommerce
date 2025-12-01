const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  try {
    console.log("check req==========",req)
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.optional = (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (err) {
    // Token invalid but that's okay for optional routes
  }
  next();
};
