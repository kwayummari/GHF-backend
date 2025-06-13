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

  console.log('Passport Config: JWT Secret configured:', config.JWT.SECRET ? 'Yes' : 'No');
  console.log('Passport Config: JWT Secret length:', config.JWT.SECRET?.length || 0);

  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        console.log('=== JWT STRATEGY START ===');
        console.log('JWT Strategy: Raw payload received:', JSON.stringify(payload, null, 2));
        console.log('JWT Strategy: Payload ID:', payload.id);
        console.log('JWT Strategy: Payload exp:', payload.exp);
        console.log('JWT Strategy: Current time:', Math.floor(Date.now() / 1000));
        console.log('JWT Strategy: Token expired?', payload.exp < Math.floor(Date.now() / 1000));

        // Find user by ID with roles and permissions
        console.log('JWT Strategy: Looking up user with ID:', payload.id);

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

        console.log('JWT Strategy: Database query completed');
        console.log('JWT Strategy: User found:', user ? `ID: ${user.id}, Email: ${user.email}` : 'None');

        if (!user) {
          console.log('JWT Strategy: User not found, returning false');
          return done(null, false, { message: 'User not found' });
        }

        // Check if user is active
        console.log('JWT Strategy: User status:', user.status);
        if (user.status !== 'active') {
          console.log('JWT Strategy: User account not active, returning false');
          return done(null, false, { message: 'Account is not active' });
        }

        // Format user data
        const userData = user.toJSON();
        console.log('JWT Strategy: User roles count:', userData.roles?.length || 0);

        // Extract role names and permissions for easier access
        userData.roles = userData.roles.map(role => role.role_name);
        console.log('JWT Strategy: Role names:', userData.roles);

        const permissions = new Set();
        user.roles.forEach(role => {
          if (role.permissions) {
            role.permissions.forEach(permission => {
              permissions.add(`${permission.module}:${permission.action}`);
            });
          }
        });
        userData.permissions = Array.from(permissions);
        console.log('JWT Strategy: Permissions count:', userData.permissions.length);

        console.log('JWT Strategy: Authentication successful for user ID:', userData.id);
        console.log('=== JWT STRATEGY SUCCESS ===');
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
    console.log('=== TOKEN EXTRACTION DEBUG ===');
    console.log('Custom Extractor: Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Custom Extractor: Authorization header:', req.headers.authorization);

    let token = null;

    // Try the standard Bearer token extraction
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
      console.log('Custom Extractor: Token extracted from Bearer header');
      console.log('Custom Extractor: Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
    } else {
      console.log('Custom Extractor: No Bearer token found');
    }

    console.log('=== TOKEN EXTRACTION END ===');
    return token;
  };

  // Temporarily replace the extractor for debugging
  // Uncomment this line if you want to use the custom extractor for debugging
  // options.jwtFromRequest = customExtractor;
};

module.exports = passportConfig;