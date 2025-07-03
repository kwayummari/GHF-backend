const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { User } = require('../models');

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
        // Find user by ID from token payload
        const user = await User.findByPk(payload.id, {
          attributes: { exclude: ['password'] },
        });
        
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }
        
        // Check if user is active
        if (!user.isActive) {
          return done(null, false, { message: 'Account is deactivated' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

module.exports = passportConfig;