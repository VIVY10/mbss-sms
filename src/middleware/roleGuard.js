export function requireRole(...roles) {
  return (req, res, next) => {
    const userType = req.user?.usertype ?? req.user?.userType;
    if (!req.user || !roles.includes(userType)) {
      return res.status(403).send('Request Rejected');
    }
    next();
  };
}
