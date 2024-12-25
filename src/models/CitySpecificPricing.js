module.exports = (sequelize, DataTypes) => {
  const CitySpecificPricing = sequelize.define('CitySpecificPricing', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    city_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    service_id: DataTypes.STRING,
    item_id: DataTypes.STRING,
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'CitySpecificPricings',
    timestamps: true,
    underscored: true  
  });

  CitySpecificPricing.associate = (models) => {
    CitySpecificPricing.belongsTo(models.City, { 
      foreignKey: 'city_id',
      as: 'city'
    });
    CitySpecificPricing.belongsTo(models.Service, { 
      foreignKey: 'service_id',
      as: 'service'
    });
    CitySpecificPricing.belongsTo(models.ServiceItem, { 
      foreignKey: 'item_id',
      as: 'serviceItem'
    });
  };

  return CitySpecificPricing;
};