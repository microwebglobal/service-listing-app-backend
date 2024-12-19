// models/User.js
'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    // Define any class methods here
    static associate(models) {
      // define associations here if needed
    }

    // Instance method to compare password
    async validatePassword(password) {
      return bcrypt.compare(password, this.pw);
    }
  }

  User.init({
    u_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name cannot be empty'
        },
        len: {
          args: [2, 100],
          msg: 'Name must be between 2 and 100 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'Email address already in use!'
      },
      validate: {
        notEmpty: {
          msg: 'Email cannot be empty'
        },
        isEmail: {
          msg: 'Must be a valid email address'
        }
      }
    },
    mobile: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: {
        msg: 'Mobile number already in use!'
      },
      validate: {
        notEmpty: {
          msg: 'Mobile number cannot be empty'
        }
      }
    },
    photo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    pw: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password cannot be empty'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'customer'),
      defaultValue: 'customer',
      allowNull: false
    },
    last_updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
    
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'last_updated',
    hooks: {
      beforeCreate: async (user) => {
        if (user.pw) {
          user.pw = await bcrypt.hash(user.pw, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('pw')) {
          user.pw = await bcrypt.hash(user.pw, 10);
        }
      }
    }
  });

  return User;
};