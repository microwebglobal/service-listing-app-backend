module.exports = (sequelize, DataTypes) => {
  const SubCategory = sequelize.define('SubCategory', {
    sub_category_id: {  
      type: DataTypes.STRING,  
      primaryKey: true,
      allowNull: false
    },
    category_id: {
      type: DataTypes.STRING, 
      allowNull: false
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
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: { 
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'SubCategories',
    timestamps: true,
    underscored: true  
  });

  SubCategory.associate = (models) => {
    SubCategory.belongsTo(models.ServiceCategory, {
      foreignKey: 'category_id'
    });
    SubCategory.hasMany(models.Service, {
      foreignKey: 'sub_category_id',
      as: 'services'
    });
  };

  return SubCategory;
};