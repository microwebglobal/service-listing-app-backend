const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ServiceProviderDocument extends Model {
    static associate(models) {
      this.belongsTo(models.ServiceProvider, {
        foreignKey: "provider_id",
        onDelete: "CASCADE",
      });
    }
  }

  ServiceProviderDocument.init(
    {
      document_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      provider_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "service_providers",
          key: "provider_id",
        },
      },
      document_type: {
        type: DataTypes.ENUM(
          "logo",
          "id_proof",
          "address_proof",
          "qualification_proof",
          "aadhar",
          "pan",
          "business_registration",
          "insurance",
          "service_certificate",
          "agreement",
          "terms_acceptance"
        ),
        allowNull: false,
      },
      document_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      verification_status: {
        type: DataTypes.ENUM("pending", "verified", "rejected"),
        defaultValue: "pending",
      },
      verification_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ServiceProviderDocument",
      tableName: "service_provider_documents",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
    }
  );

  return ServiceProviderDocument;
};
