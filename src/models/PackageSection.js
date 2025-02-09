const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PackageSection extends Model {
    static associate(models) {
      PackageSection.belongsTo(models.Package, {
        foreignKey: "package_id",
      });
      PackageSection.hasMany(models.PackageItem, {
        foreignKey: "section_id",
      });
    }
  }

  PackageSection.init(
    {
      section_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      package_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "packages",
          key: "package_id",
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: DataTypes.TEXT,
      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      icon_url: DataTypes.STRING(255),
    },
    {
      sequelize,
      modelName: "PackageSection",
      tableName: "package_sections",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return PackageSection;
};
