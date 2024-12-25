module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define('City', {
    city_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    latitude: DataTypes.DECIMAL(10, 7),
    longitude: DataTypes.DECIMAL(10, 7)
  }, {
    tableName: 'cities',
    timestamps: true
  });

  City.associate = (models) => {
   
    City.hasMany(models.CitySpecificPricing, { 
      foreignKey: 'city_id',
      as: 'cityPricings'
    });
  };

  return City;
};