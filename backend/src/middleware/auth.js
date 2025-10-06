const jwt = require('jsonwebtoken');

/**
 * Middleware för att verifiera JWT token
 */
module.exports = async (req, res, next) => {
  try {
    // Hämta token från header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided',
      });
    }
    
    // Verifiera token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    
    // Lägg till user info i request
    req.userId = decoded.userId;
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
      });
    }
    
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
};
