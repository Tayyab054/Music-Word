export function requireAdmin(req, res, next) {
  const role = req.session.role;

  if (role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
}
