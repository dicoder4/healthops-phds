// Middleware to check if a user is logged in
export function checkAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  next();
}