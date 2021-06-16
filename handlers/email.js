const nodemailer = require("nodemailer")
const pug = require("pug")
const juice = require("juice")
const htmltotext = require("html-to-text")
const util = require("util")
const emailconfig = require("../config/email")
const email = require("../config/email")

let transport = nodemailer.createTransport({
    host : emailconfig.host,
    port : emailconfig.port,
    auth : {
        user : emailconfig.user,
        pass : emailconfig.password
    }
})

// Generar HTML
const generarHTML = (archivo, opciones = {}) => {
    const html = pug.renderFile(`${__dirname}/../views/emails/${archivo}.pug`, opciones)
    return juice(html)
}

exports.enviar = async (opciones) => {
    const html = generarHTML(opciones.archivo, opciones)
    const text = htmltotext.fromString(html)
    let mailOptions = {
        from : "UpTask <no-reply@uptask.com>",
        to : opciones.usuario.email,
        subject : opciones.subject,
        text,
        html
    }
    const enviarEmail = util.promisify(transport.sendMail, transport)
    return enviarEmail.call(transport, mailOptions)
}
