const passport = require("passport")
const Usuarios = require("../models/Usuarios")
const crypto = require("crypto")
const Sequelize = require("sequelize")
const Op = Sequelize.Op
const bcrypt = require("bcrypt-nodejs")
const enviarEmail = require("../handlers/email")

exports.autenticarUsuario = passport.authenticate("local", {
    successRedirect : "/",
    failureRedirect: "/iniciar-sesion",
    failureFlash : true,
    badRequestMessage : "Ambos Campos son Obligatorios"
})

exports.usuarioAutenticado = (req, res, next) => {
    // Si esta autenticado
    if (req.isAuthenticated()) {
        return next()
    }

    // Si no esta autenticado
    return res.redirect("/iniciar-sesion")
}

exports.cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/iniciar-sesion")
    })
}

// Genera token si el usuario es valido
exports.enviarToken = async (req, res) => {
    // Verificar que el usuario existe
    const usuario = await Usuarios.findOne({
        where : {
            email : req.body.email
        }
    })

    if(!usuario) {
        console.log("paso")
        req.flash("error", "No existe esa cuenta")
        res.render("restablecer", {
            nombrePagina : "Restablecer tu Contraseña",
            mensajes : req.flash()
        })
    }

    // Usuario existente
    usuario.token = crypto.randomBytes(20).toString("hex")
    usuario.expiracion = Date.now() + 3600000

    // Guardarlos en la base de datos
    await usuario.save()

    // url de reset
    const resetUrl = `http://${req.headers.host}/restablecer/${usuario.token}`
    // Enviar el mail con el token
    await enviarEmail.enviar({
        usuario : usuario,
        resetUrl : resetUrl,
        subject : "Password Reset",
        archivo : "restablecer-password"
    })

    res.flash("correcto", "Se envio un mensaje a tu correo")
    res.redirect("/iniciar-sesion")
}

exports.validarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where : {
            token : req.params.token
        }
    })

    // Si no encuentra usuario
    if(!usuario) {
        req.flash("error", "No valido")
        res.redirect("/restablecer")
    }

    // Formulario para generar password
    res.render("resetPassword", {
        nombrePagina : "Restablecer password"
    })
}

exports.actualizarPassword = async (req, res) => {
    // Verifica el token valido y la expiracion
    const usuario = await Usuarios.findOne({
        where : {
            token : req.params.token,
            expiracion : {
                [Op.gte] : Date.now()
            }
        }
    })

    // Si el usuario no existe
    if(!usuario) {
        req.flash("error", "No valido")
        res.redirect("/restablecer")
    }

    // Hashear el nuevo password
    usuario.token = null
    usuario.expiracion = null
    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))

    // Guardar los cambios
    await usuario.save()

    req.flash("correcto", "Tu password se ha modificado correctamente")
    res.redirect("/iniciar-sesion")

}