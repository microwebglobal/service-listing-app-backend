const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define(
      "Address",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "users",
            key: "u_id",
          },
          field: "userId",
        },
        type: {
          type: DataTypes.ENUM("home", "work", "other"),
          defaultValue: "home",
        },
        line1: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        line2: DataTypes.STRING,
        city: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        state: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        postal_code: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        location: {
          type: DataTypes.GEOGRAPHY('POINT', 4326),
          allowNull: true,
        },
        is_primary: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          field: "createdAt",
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: "updatedAt",
        },
      },
      {
        tableName: "addresses",
        timestamps: true,
      }
    );
  
    Address.associate = function(models) {
      Address.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'u_id'
      });
    };
    
    
    Address.prototype.setLocation = function(latitude, longitude) {
      this.location = sequelize.fn('ST_SetSRID', 
                     sequelize.fn('ST_MakePoint', longitude, latitude), 
                     4326);
    };
    
    Address.prototype.getCoordinates = function() {
      if (!this.location || !this.location.coordinates) return null;
      const point = this.location.coordinates;
      return {
        latitude: point[1],
        longitude: point[0]
      };
    };
  
    return Address;
  const Address = sequelize.define(
    "Address",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "u_id",
        },
        field: "userId",
      },
      type: {
        type: DataTypes.ENUM("home", "work", "other"),
        defaultValue: "home",
      },
      line1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      line2: DataTypes.STRING,
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      postal_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.GEOGRAPHY("POINT", 4326),
        allowNull: true,
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "createdAt",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updatedAt",
      },
    },
    {
      tableName: "addresses",
      timestamps: true,
    }
  );

  Address.associate = function (models) {
    Address.belongsTo(models.User, {
      foreignKey: "userId",
      targetKey: "u_id",
    });
  };

  Address.prototype.setLocation = function (latitude, longitude) {
    this.location = sequelize.fn(
      "ST_SetSRID",
      sequelize.fn("ST_MakePoint", longitude, latitude),
      4326
    );
  };

  Address.prototype.getCoordinates = function () {
    if (!this.location || !this.location.coordinates) return null;
    const point = this.location.coordinates;
    return {
      latitude: point[1],
      longitude: point[0],
    };
  };

  return Address;
};
