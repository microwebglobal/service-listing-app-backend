const { ServiceProviderDocument, ServiceProvider, User } = require("../models");
const { sequelize } = require("../models");
const MailService = require("../utils/mail.js");

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
      console.error("Error approving document:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = ProviderDocumentController;
