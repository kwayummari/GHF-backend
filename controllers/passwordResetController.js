const { PasswordReset, User } = require('../models');
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize');
const crypto = require('crypto');

class PasswordResetController {
  // Generate password reset token
  static async generateResetToken(req, res) {
    try {
      const { email } = req.body;
      
      // Find user
      const user = await User.findOne({
        where: {
          email
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create password reset record
      const passwordReset = await PasswordReset.create({
        user_id: user.id,
        token,
        expires_at: expiresAt
      });

      // Send reset email (you would typically integrate with an email service here)
      // This is just a placeholder
      console.log(`Password reset token sent to ${email}`);

      return res.json({
        message: 'Password reset token sent successfully',
        token // In production, you would not return the token directly
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Validate reset token
  static async validateResetToken(req, res) {
    try {
      const { token } = req.params;

      const passwordReset = await PasswordReset.findOne({
        where: {
          token,
          used: false,
          expires_at: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!passwordReset) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      return res.json({
        valid: true,
        userId: passwordReset.user_id
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      const passwordReset = await PasswordReset.findOne({
        where: {
          token,
          used: false,
          expires_at: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!passwordReset) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      // Update user password
      const user = await User.findByPk(passwordReset.user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.password = password;
      await user.save();

      // Mark token as used
      passwordReset.used = true;
      await passwordReset.save();

      return res.json({
        message: 'Password reset successfully'
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PasswordResetController;
