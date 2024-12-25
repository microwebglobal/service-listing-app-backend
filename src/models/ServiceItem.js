module.exports = (sequelize, DataTypes) => {
  const ServiceItem = sequelize.define('ServiceItem', {
    item_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    service_id: {
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
    }
  }, {
    tableName: 'ServiceItems',
    timestamps: true,
    underscored: true  
  });

  ServiceItem.associate = (models) => {
    ServiceItem.belongsTo(models.Service, { 
      foreignKey: 'service_id',
      as: 'service'  
    });
    ServiceItem.hasMany(models.CitySpecificPricing, { 
      foreignKey: 'item_id',
      as: 'cityPricings'  
    });
  };

  return ServiceItem;
};