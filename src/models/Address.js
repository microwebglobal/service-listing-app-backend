const { Model } = require("sequelize");


module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define('Address', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'u_id'
        }
      },
      type: {
        type: DataTypes.ENUM('home', 'work', 'other'),
        defaultValue: 'home'
      },
      line1: {
        type: DataTypes.STRING,
        allowNull: false
      },
      line2: DataTypes.STRING,
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false
      },
      postal_code: {
        type: DataTypes.STRING,
        allowNull: false
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }, {
      tableName: 'addresses',
      timestamps: true
    });
  
    return Address;
  };