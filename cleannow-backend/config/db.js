const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // nécessaire pour Neon
    },
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connecté !");
  } catch (error) {
    console.error("❌ Erreur DB :", error);
  }
};

module.exports = { sequelize, connectDB };