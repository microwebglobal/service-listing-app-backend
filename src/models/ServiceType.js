const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ServiceType extends Model {
    static associate(models) {
      ServiceType.belongsTo(models.SubCategory, {
        foreignKey: 'sub_category_id'
      });
      ServiceType.hasMany(models.Service, {
        foreignKey: 'type_id'
      });
      ServiceType.hasMany(models.Package, {
        foreignKey: 'type_id'
      });
    }
  }

  ServiceType.init({
    type_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    sub_category_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'sub_categories',
        key: 'sub_category_id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: DataTypes.TEXT,
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ServiceType',
    tableName: 'service_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
  });

  return ServiceType;
};
