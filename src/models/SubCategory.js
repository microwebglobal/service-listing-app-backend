const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SubCategory extends Model {
    static associate(models) {
      SubCategory.belongsTo(models.ServiceCategory, {
        foreignKey: 'category_id'
      });
      SubCategory.hasMany(models.ServiceType, {
        foreignKey: 'sub_category_id'
      });
    }
  }

  SubCategory.init({
    sub_category_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    category_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'service_categories',
        key: 'category_id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    icon_url: DataTypes.STRING(255),
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'SubCategory',
    tableName: 'sub_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return SubCategory;
};