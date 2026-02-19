function buildPublicUrl(req, assetPath) {
  if (!assetPath) return null;

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  const normalizedPath = String(assetPath).startsWith("/")
    ? String(assetPath)
    : `/${String(assetPath)}`;

  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.get("host");

  return `${protocol}://${host}${normalizedPath}`;
}

module.exports = {
  buildPublicUrl,
};
