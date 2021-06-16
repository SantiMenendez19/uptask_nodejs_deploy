const Usuarios = require("../models/Usuarios")
const enviarEmail = require("../handlers/email")

exports.formCrearCuenta = (req, res) => {
    res.render("crearCuenta", {
        nombrePagina: "Crear cuenta en UpTask"
    })
}

exports.formIniciarSesion = (req, res) => {
    const {error} = res.locals.mensajes
    res.render("iniciarSesion", {
        nombrePagina: "Iniciar Sesion en UpTask",
        error
    
    })
}

exports.crearCuenta = async (req, res) => {
    // Leer datos
    const { email, password } = req.body
    try {
        await Usuarios.create({
            email,
            password
        })

        // Crear URL de confirmar
        const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`
        // Crear objecto de usuario
        const usuario = {
            email
        }
        // Enviar mail
        await enviarEmail.enviar({
            usuario : usuario,
            confirmarUrl,
            subject : "Confirma tu cuenta UpTask",
            archivo : "confirmar-cuenta"
        })
        // Redirigir al usuario
        req.flash("correcto", "Enviamos un correo, envia tu cuenta")
        res.redirect("/iniciar-sesion")
    } catch(error) {
        req.flash("error", error.errors.map(error => error.message))
        res.render("crearCuenta", {
            nombrePagina : "Crear Cuenta en UpTask",
            mensajes : req.flash(),
            email : email,
            password : password
        })
    }
}

exports.formRestablecerPassword = (req, res) => {
    res.render("restablecer", {
        nombrePagina : "Restablecer contraseña"
    })
}

// Cambia el estado de una cuenta
exports.confirmarCuenta = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where : {
            email : req.params.correo
        }
    })

    // Si no existe
    if(!usuario) {
        req.flash("error", "No valido")
        res.redirect("/crear-cuenta")
    }
    usuario.activo = 1
    await usuario.save()

    req.flash("correo", "Cuenta activada correctamente")
    res.redirect("/iniciar-sesion")
}