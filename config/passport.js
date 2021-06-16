const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy

// Referencia al modelo
const Usuarios = require("../models/Usuarios")

// Local Strategy
passport.use(
    new LocalStrategy(
        {
            usernameField : "email",
            passwordField : "password"
        },
        async (email, password, done) => {
            try {
                const usuario = await Usuarios.findOne({
                    where : {
                        email : email,
                        activo : 1
                    }
                })
                // El usuario existe, pero password incorrecto
                if(!usuario.verificarPassword(password)) {
                    return done(null, false, {
                        message : "Password incorrecto"
                    }) 
                }
                // Usuario existe y password correcto
                return done(null, usuario)
            } catch (error) {
                // Usuario no exista
                return done(null, false, {
                    message : "Esa cuenta no existe"
                })
            }
        }
    )
)

// Serializar el usuario
passport.serializeUser((usuario, callback) => {
    callback(null, usuario)
})

// Deserializar el usuario
passport.deserializeUser((usuario, callback) => {
    callback(null, usuario)
})

// Export
module.exports = passport