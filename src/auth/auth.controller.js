/* eslint-disable camelcase */
const jwt = require('jsonwebtoken');

const { ldapAuth } = require('../services/ldap');
const config = require('../config');

const signJWT = (user) => {
  const tokenData = {
    iss: `${config.protocol}://${config.host}`,
    aud: config.hostUrl,
    sub: user.userId,
    email: user.email,
    identityContext: user.identityContext,
    scopes: user.scopes,
  };
  // generate a signed json web token with the contents of user object and return it in the response
  return jwt.sign(tokenData, config.secrets.jwt, {
    expiresIn: config.jwtExpiry,
    // expiresIn: 0,
  });
};

const signRefreshToken = (userId) => {
  const tokenData = {
    sub: userId,
  };
  // generate a signed json web token with the contents of user object and return it in the response
  return jwt.sign(tokenData, config.secrets.refresh, {
    expiresIn: config.refreshExpiry,
    // expiresIn: 0,
  });
};

const generateToken = async (user) => {
  // Ensure case for db consistency
  user.userId = user.userId;
  try {
    const access_token = await signJWT(user);
    const refresh_token = await signRefreshToken(user.userId);
    return {
      access_token,
      token_type: 'Bearer',
      expires_in: config.jwtExpiry,
      refresh_token,
      uid: user.userId,
    };
  } catch (error) {
    throw error;
  }
};

const localStrategy = async (userId, password, db) => {
  try {
    const user = await ldapAuth({ userId, password });
    const data = await generateToken(user);
    const dbRecord = await db.refresh_tokens.findOne({ user_id: userId });
    const writeToDb = dbRecord ? 'save' : 'insert';
    await db.refresh_tokens[writeToDb]({
      user_id: userId.toUpperCase(),
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

const handleTokenVerification = (token, secret) => jwt.verify(token, secret, (err, decoded) => {
  if (err) return err;
  return decoded;
});

const oauth2Strategy = async (refreshToken, db) => {
  try {
    // check token is legit, not expired and return user
    await handleTokenVerification(refreshToken, config.secrets.refresh);
    // find refresh token in the db
    const dbRecord = await db.refresh_tokens.findOne({ refresh_token: refreshToken });
    // get user details from old JWT token
    const user = await handleTokenVerification(dbRecord.access_token, config.secrets.jwt);
    const writeToUser = {
      userId: user.sub,
      email: user.email,
      identityContext: user.identityContext,
      scopes: user.scopes,
    };
    // generate a new set of tokens
    const newToken = await generateToken(writeToUser);
    // write new token details to token data store
    await db.refresh_tokens.save({
      user_id: newToken.uid.toUpperCase(),
      access_token: newToken.access_token,
      refresh_token: newToken.refresh_token,
    });
    return newToken;
  } catch (error) {
    throw new Error(error);
  }
};

const authenticate = async (req, res, next) => {
  const massive = req.app.get('massiveDb');
  try {
    const grantType = req.body.grant_type;
    if (grantType === 'password') {
      const { username, password } = req.body;
      const response = await localStrategy(username, password, massive);
      return res.status(200).json(response);
    }
    if (grantType === 'refresh_token') {
      const refreshToken = req.body.refresh_token;
      const response = await oauth2Strategy(refreshToken, massive);
      return res.status(200).json(response);
    }
  } catch (error) {
    return next(error);
  }
  return next('No grant_type specified in oauth request body');
};

module.exports = {
  authenticate,
};
