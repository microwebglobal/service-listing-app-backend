module.exports = (sequelize, DataTypes) => {
  const ServiceCategory = sequelize.define('ServiceCategory', {
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'ServiceCategories',
    timestamps: true
  });

  ServiceCategory.associate = (models) => {
    ServiceCategory.hasMany(models.SubCategory, {
      foreignKey: 'category_id',
      as: 'subcategories'
    });
    ServiceCategory.belongsToMany(models.City, {
      through: 'category_cities',
      foreignKey: 'category_id',
      as: 'cities'
    });
  };

  return ServiceCategory;
};