const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const config = require('./config');

/**
 * Configure Passport with JWT strategy
 * @param {Object} passport - Passport instance
 */
const passportConfig = (passport) => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.JWT.SECRET,
  };

  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        // Find user by ID with roles and permissions
        const user = await User.findOne({
          where: { id: payload.id },
          include: [
            {
              model: Role,
              as: 'roles',
              through: { attributes: [] },
              include: [
                {
                  model: Permission,
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

        // Check if user is active
        if (user.status !== 'active') {
          return done(null, false, { message: 'Account is not active' });
        }

        // Format user data
        const userData = user.toJSON();
        
        // Extract role names and permissions for easier access
        userData.roles = userData.roles.map(role => role.role_name);
        
        const permissions = new Set();
        userData.roles.forEach(roleName => {
          const role = user.roles.find(r => r.role_name === roleName);
          if (role && role.permissions) {
            role.permissions.forEach(permission => {
              permissions.add(`${permission.module}:${permission.action}`);
            });
          }
        });
        userData.permissions = Array.from(permissions);

        return done(null, userData);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

module.exports = passportConfig;