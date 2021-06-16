const Proyectos = require("../models/Proyectos")
const Tareas = require("../models/Tareas")

exports.proyectosHome = async(request, response) => {
    const usuarioId = response.locals.usuario.id
    const proyectos = await Proyectos.findAll({
        where : {
            usuarioId : usuarioId
        }
    })

    response.render("index", {
        nombrePagina : "Proyectos",
        proyectos
    })
}

exports.formularioProyecto = async (request, response) => {
    const usuarioId = response.locals.usuario.id
    const proyectos = await Proyectos.findAll({
        where : {
            usuarioId : usuarioId
        }
    })
    response.render("nuevoProyecto", {
        nombrePagina : "Nuevo Proyecto",
        proyectos
    })
}

exports.formularioEditar = async (request, response) => {
    const usuarioId = response.locals.usuario.id
    const proyectosPromise = await Proyectos.findAll({
        where : {
            usuarioId : usuarioId
        }
    })
    const proyectoPromise = Proyectos.findOne({
        where: {
            id : request.params.id
        }
    })

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise])

    response.render("nuevoProyecto", {
        nombrePagina : "Editar Proyecto",
        proyectos,
        proyecto
    })
}

exports.nuevoProyecto = async (request, response) => {
    const usuarioId = response.locals.usuario.id
    const proyectos = await Proyectos.findAll({
        where : {
            usuarioId : usuarioId
        }
    })
    // Validacion de formulario
    const nombre = request.body.nombre
    let errores = []

    if(!nombre) {
        errores.push({"texto" : "Agrega un nombre al proyecto"})
    }

    if(errores.length > 0) {
        response.render("nuevoProyecto", {
            nombrePagina : "Nuevo Proyecto",
            errores,
            proyectos
        })
    }
    else {
        // Insertar en la bd
        const usuarioId = response.locals.usuario.id
        console.log(usuarioId)
        await Proyectos.create({ nombre, usuarioId })
        response.redirect("/")
    }
}

exports.actualizarProyecto = async (request, response) => {
    const usuarioId = response.locals.usuario.id
    const proyectos = await Proyectos.findAll({
        where : {
            usuarioId : usuarioId
        }
    })
    // Validacion de formulario
    const nombre = request.body.nombre
    let errores = []

    if(!nombre) {
        errores.push({"texto" : "Agrega un nombre al proyecto"})
    }

    if(errores.length > 0) {
        response.render("nuevoProyecto", {
            nombrePagina : "Nuevo Proyecto",
            errores,
            proyectos
        })
    }
    else {

        await Proyectos.update(
            { nombre : nombre },
            { where : {id : request.params.id}}
        )
        response.redirect("/")
    }
}


exports.proyectoPorUrl = async (req, res, next) => {
    const usuarioId = res.locals.usuario.id
    const proyectosPromise = await Proyectos.findAll({
        where : {
            usuarioId : usuarioId
        }
    })
    const proyectoPromise = Proyectos.findOne({
        where : {
            url : req.params.url,
            usuarioId : usuarioId
        }
    })

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise])

    // Consultar tareas del proyecto actual

    const tareas = await Tareas.findAll({
        where : {
            proyectoId : proyecto.id
        }
        //include : [
        //    {
        //        model : Proyectos
        //    }
        //]
    })

    if(!proyecto || !tareas) return next()

    res.render("tareas", {
        nombrePagina : "Tareas del Proyecto",
        proyecto,
        proyectos,
        tareas
    })
}

exports.eliminarProyecto = async (req, res, next) => {
    const { urlProyecto } = req.query
    const resultado = await Proyectos.destroy({where : {url : urlProyecto}})

    if (!resultado) {
        return next()
    }

    res.status(200).send("Proyecto eliminado correctamente")
}