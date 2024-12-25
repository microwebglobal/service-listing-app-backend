module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    service_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    sub_category_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    base_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'Services',
    timestamps: true,
    underscored: true // Use snake_case for attributes
  });

  Service.associate = (models) => {
    Service.belongsTo(models.SubCategory, { 
      foreignKey: 'sub_category_id',
      as: 'subCategory'
    });
    Service.hasMany(models.ServiceItem, { 
      foreignKey: 'service_id',
      as: 'serviceItems'
    });
    Service.hasMany(models.CitySpecificPricing, { 
      foreignKey: 'service_id',
      as: 'cityPricings'
    });
    
  };

  return Service;
};