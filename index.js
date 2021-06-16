// Importo express
const express = require("express")
const routes = require("./routes")
const path = require("path")
const bodyParser = require("body-parser")
const flash = require("connect-flash")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const passport = require("./config/passport")

// Extrar variables de entorno
require("dotenv").config({ path : "variables.env"})

// Importo helpers.js
const helpers = require("./helpers.js")

// Crear conexion a BD
const db = require("./config/db.js")

// Importo el modelo

require("./models/Proyectos.js")
require("./models/Tareas.js")
require("./models/Usuarios.js")


// Prueba de autenticacion
db.sync()
    .then(() => console.log("Conectado"))
    .catch(error => console.log(error))

// Crear una App de express
const app = express()

// bodyParser
app.use(bodyParser.urlencoded({extended : true}))

// Archivos static
app.use(express.static("public"))

// Habilitar pug
app.set("view engine", "pug")

// Views
app.set("views", path.join(__dirname, "./views"))

// Agregar flash messages
app.use(flash())

// CookieParser
app.use(cookieParser())

// Sesiones
app.use(session({
    secret : "supersecret",
    resave : false,
    saveUninitialized : false
}))

// Passport
app.use(passport.initialize())
app.use(passport.session())

// Pasar helpers
app.use((req, res, next) => {
    res.locals.vardump = helpers.vardump
    res.locals.mensajes = req.flash()
    res.locals.usuario = {...req.user} || null
    next()
})

// Routes
app.use("/", routes())

// Servidor y puerto
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000

// Escucho en el puerto 9000
app.listen(port, host, () => {
    console.log("El servicio esta funcionando correctamente")
})

require("./handlers/email")