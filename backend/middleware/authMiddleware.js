import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Not authorized, token failed or expired.' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided.' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
};