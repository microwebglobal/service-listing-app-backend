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
        },
        field: 'userId' 
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
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'createdAt'
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updatedAt'
      }
    }, {
      tableName: 'addresses',
      timestamps: true
    });
  
    Address.associate = function(models) {
      Address.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'u_id'
      });
    };
  
    return Address;
};