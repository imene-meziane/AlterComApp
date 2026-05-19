function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const source = typeof user.toJSON === 'function' ? user.toJSON() : user;
  const { password, sessions, ...safeUser } = source;

  return safeUser;
}

module.exports = sanitizeUser;
