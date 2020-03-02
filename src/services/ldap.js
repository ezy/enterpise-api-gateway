// Depending on your LDAP client and server this file will need heavy customisation
const { Client } = require('ldapts');
const foreach = require('lodash/each');
const lomap = require('lodash/map');

const userScopes = require('../maps/user-scopes');

const ldapClient = new Client({
  url: 'ldaps://ldap.jumpcloud.com',
  timeout: 0,
  connectTimeout: 0,
  tlsOptions: {
    minVersion: 'TLSv1.2',
  },
  strictDN: true,
});

const ldapRequest = async (user, pass, authDn, userLookup, userDn) => {
  await ldapClient.bind(`uid=${user},${authDn}`, pass);
  const {
    searchEntries,
  } = await ldapClient.search(`uid=${userLookup},${userDn}`, {
    scope: 'sub',
  });
  return searchEntries[0];
};

const ldapSearch = (search) => {
  let scopes = [];
  const member = search.memberOf.toString();
  foreach(userScopes, (v, k) => {
    if (member.includes(k)) scopes.push(v);
  });
  // TODO: remove this and set scopes from ldap
  scopes = lomap(userScopes, v => v);
  return {
    userId: search.cn,
    email: search.mail,
    identityContext: '0',
    scopes: scopes.toString(),
  };
};

/**
 * Used for signing in with user creds and returning identity context
 * @param {object} user { userId: string, password: string }
 */
const ldapAuth = async (user) => {
  if (!user.userId || !user.password) {
    throw new Error('Authentication failed. Wrong email or password.');
  }
  const dn = 'ou=People,dc=example,dc=com';
  try {
    const search = await ldapRequest(user.userId, user.password, dn, user.userId, dn);
    return ldapSearch(search);
  } catch (err) {
    return err;
  } finally {
    await ldapClient.unbind();
  }
};

module.exports = {
  ldapAuth,
};
