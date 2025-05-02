"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'enum_users_notification_preference'
        ) THEN
          CREATE TYPE "enum_users_notification_preference" AS ENUM ('whatsapp', 'sms', 'in_app', 'email');
        ELSE
          -- Add 'email' to existing enum type if not already present
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'email' AND enumtypid = 'enum_users_notification_preference'::regtype
          ) THEN
            ALTER TYPE "enum_users_notification_preference" ADD VALUE 'email';
          END IF;
        END IF;
      END$$;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ADD COLUMN "notification_preference" "enum_users_notification_preference"[] 
      NOT NULL DEFAULT ARRAY['sms']::"enum_users_notification_preference"[];
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "notification_preference");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_notification_preference";'
    );
  },
};
