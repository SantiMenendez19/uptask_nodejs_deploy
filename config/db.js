const Sequelize = require('sequelize')

// Extrar variables de entorno
require("dotenv").config({ path : "variables.env"})

const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASS, {
  host: process.env.BD_HOST,
  port: process.env.BD_PORT ,
  dialect: "mysql"
})

module.exports = db