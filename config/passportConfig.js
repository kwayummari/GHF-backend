const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const models = require('../models');
const config = require('./config');

/**
 * Configure Passport with JWT strategy
 * @param {Object} passport - Passport instance
 */
const passportConfig = (passport) => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.JWT.SECRET,
    // Add these for debugging
    passReqToCallback: false,
    ignoreExpiration: false, // Set to true temporarily if you suspect token expiration
  };

  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {

        const user = await models.User.findOne({
          where: { id: payload.id },
          include: [
            {
              model: models.Role,
              as: 'roles',
              through: { attributes: [] },
              include: [
                {
                  model: models.Permission,
                  as: 'permissions',
                  through: { attributes: [] },
                }
              ]
            }
          ],
          attributes: { exclude: ['password'] },
        });

        if (!user) {
          return done(null, false, { message: 'User not found' });
        }
        if (user.status !== 'active') {
          return done(null, false, { message: 'Account is not active' });
        }

        // Format user data
        const userData = user.toJSON();

        // Extract role names and permissions for easier access
        userData.roles = userData.roles.map(role => role.role_name);

        const permissions = new Set();
        user.roles.forEach(role => {
          if (role.permissions) {
            role.permissions.forEach(permission => {
              permissions.add(`${permission.module}:${permission.action}`);
            });
          }
        });
        userData.permissions = Array.from(permissions);

        return done(null, userData);
      } catch (error) {
        console.error('=== JWT STRATEGY ERROR ===');
        console.error('JWT Strategy: Error details:', error);
        console.error('JWT Strategy: Error message:', error.message);
        console.error('JWT Strategy: Error stack:', error.stack);
        console.error('=== JWT STRATEGY ERROR END ===');
        return done(error, false);
      }
    })
  );

  // Add a custom extractor for debugging
  const customExtractor = (req) => {

    let token = null;

    // Try the standard Bearer token extraction
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    } else {
    }

    return token;
  };

  // Temporarily replace the extractor for debugging
  // Uncomment this line if you want to use the custom extractor for debugging
  // options.jwtFromRequest = customExtractor;
};

module.exports = passportConfig;