import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  console.log(req.cookies); // make sure cookie-parser middleware is used

  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'User not authenticated'
    });
  }

  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Invalid token'
      });
    }

    // Attach user info from token to request
    req.userId = payload.userId;

    console.log({ token });
    next(); // proceed to next middleware/route
  });
};
