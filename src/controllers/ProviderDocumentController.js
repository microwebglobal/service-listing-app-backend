const { ServiceProviderDocument, ServiceProvider, User } = require("../models");
const { sequelize } = require("../models");

class ProviderDocumentController {
  static async approveProviderDocument(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const { document_id } = req.params;

      // Find the document
      const document = await ServiceProviderDocument.findByPk(document_id);

      if (!document) {
        return res.status(404).json({ message: "Document not found." });
      }

      if (document.verification_status === "verified") {
        return res
          .status(400)
          .json({ message: "Document is already verified." });
      }

      document.verification_status = "verified";

      await document.save({ transaction });

      await transaction.commit();

      return res.status(200).json({
        message: "Document approved successfully.",
        document,
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }

  static async rejectProviderDocument(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const { document_id } = req.params;
      const { reason } = req.body;

      const document = await ServiceProviderDocument.findByPk(document_id);

      if (!document) {
        return res.status(404).json({ message: "Document not found." });
      }

      if (document.verification_status === "rejected") {
        return res
          .status(400)
          .json({ message: "Document is already rejected." });
      }

      document.verification_status = "rejected";
      document.verification_notes = reason;

      await document.save({ transaction });

      await transaction.commit();

      return res.status(200).json({
        message: "Document rejected successfully.",
        document,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProviderDocumentController;
