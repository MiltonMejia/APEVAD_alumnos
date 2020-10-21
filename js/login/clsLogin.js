
/**
 * Clase encargada de procesar los datos relacionados al login para el acceso de las evaluaciones
 * @class
 * @constructor
 * @param {String} matricula Matrícula del alumno
 * @example let login = new Login("f160012")
 */

var Login = (function (matricula) {

    /**
     * Matricula del alumno
     * @type {String}
     * @example _matricula = "f160012"
     */
    var _matricula = matricula;

    /**
     * Grupo al cual pertenece el alumno
     * @type {String}
     * @example _grupo = "f6am"
     */
    var _grupo;

    /**
     * Carrera al cual pertenece el alumno
     * @type {String}
     * @example _carrera = "sistemas computacionales"
     */
    var _carrera;

    /**
     * Token JWT que genera la API para cada alumno
     * @type {String}
     * @example _token = "jdajrgsda54sd65a4sd545.546s54d65sd54d5asd.454d5s4f5a4f4"
     */
    var _token;


    /**
     * Envia los datos necesarios para ingresar a la evaluación de acuerdo al tipo de ingreso proporcionado por la API
     * @async
     * @method
     * @param {String} url
     */
    async function enviarDatosLogin(url) {
        let ingreso = await $.ajax({
            type: "GET",
            url: url,
            global: false,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            dataType: "json"
        });
        if (ingreso.ingreso == 0) {
            UTIL.limpiarSesionAnterior("sesion");
            guardarAlumnoDataSession("docentes");
            UTIL.mostrarMensajeRedireccion("html/cuestionario/cuestionario.html", "Bienvenido/a " + _nombre.capitalize(true));
        } else if (ingreso.ingreso_admin == 0) {
            UTIL.limpiarSesionAnterior("sesion");
            guardarAlumnoDataSession("administrativos");
            UTIL.mostrarMensajeRedireccion("html/cuestionario/cuestionario.html", "Bienvenido/a " + _nombre.capitalize(true));
        } else if (ingreso.ingreso_sat == 0) {
            UTIL.limpiarSesionAnterior("sesion");
            guardarAlumnoDataSession("satisfaccion");
            UTIL.mostrarMensajeRedireccion("html/cuestionario/cuestionario.html", "Bienvenido/a " + _nombre.capitalize(true));
        } else {
            UTIL.mostrarMensajeExitoTiempo("Ya ha ingresado la evaluación anteriormente");
        }
    }

    /**
     * Guarda los datos del alumno en una variable de SessionStorage para acceder a los datos necesarios de la encuesta
     * @method
     * @param {String} encuesta Encuesta a la que se debe redigir después del login
     * @example guardarAlumnosDataSession("docentes")
     */
    function guardarAlumnoDataSession(encuesta) {
        sesion = {
            "matricula": _matricula,
            "grupo": _grupo,
            "carrera": _carrera,
            "token": _token,
            "encuesta": encuesta
        };
        sesion = JSON.stringify(sesion)
        sessionStorage.setItem("sesion", sesion);
    }

    /**
     * Envia la información requerida en el modal en caso de no estar registrado en la API la edad y genero del alumno
     * @async
     * @method
     * @param {String} edad Edad del alumno
     * @param {String} genero Genero del alumno
     * @example login.enviarModalAlumno(20,"hombre")
     */
    this.enviarModalAlumno = async function (edad, genero) {
        let respuesta = [{
                "op": "reemplazar",
                "dato": "edad",
                "valor": edad
            },
            {
                "op": "reemplazar",
                "dato": "genero",
                "valor": genero
            }
        ];
        respuesta = encodeURIComponent(JSON.stringify(respuesta));
        let env_token = "token=" + _token;
        let env_datos = "&datos=" + respuesta;

        console.log(env_token+env_datos)
        await $.ajax({
            url: "https://api.unialvaedison.edu.mx/v1/carreras/" + _carrera + "/grupos/" + _grupo + "/alumnos/" + _matricula,
            type: "PATCH",
            dataType: "json",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            data: env_token + env_datos
        });
        try {
            await enviarDatosLogin("https://api.unialvaedison.edu.mx/v1/alumnos/" + _matricula + "/ingresos", _nombre);
        } catch (error) {
            UTIL.mostrarMensajeError("Ha ocurrido un error al procesar la solicitud, intente más tarde");
        }
    }

    /**
     * Extrar los datos del alumno desde la API y lo guarda en variables de clase para su tratamiento
     * @async
     * @method
     * @example login.extraerDatosAumno()
     */
    this.extraerDatosAlumno = async function () {

        let alumno = await $.ajax({
            type: "POST",
            url: "https://api.unialvaedison.edu.mx/v1/login",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            dataType: "json",
            data: "matricula=" + _matricula,
        });
        if (alumno.msg) {
            UTIL.mostrarMensajeError(alumno.msg);
        } else if (alumno.nombre) {
            _nombre = alumno.nombre
            _matricula = alumno.matricula;
            _grupo = alumno.grupo;
            _carrera = alumno.carrera;
            _token = alumno.token;
            await verificarEdadGenero();
        }
    }

    /**
     * Extrae la edad del alumno de la API si está disonible
     * @async
     * @method
     * @param {String} url URI de la API de donde se extrae los datos. Solo se aceptan GET
     * @example obtenerEdad("api.unialvaedison.edu.mx/v1/alumnos/edad")
     */
    async function obtenerEdad(url) {
        let alumno = await $.ajax({
            type: "GET",
            url: url,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            dataType: "json"
        });
        return alumno.edad;
    }

    /**
     * Extrae el genero del alumno de la API si está disonible
     * @async
     * @method
     * @param {String} url URI de la API de donde se extrae los datos. Solo se aceptan GET
     * @example obtenerEdad("api.unialvaedison.edu.mx/v1/alumnos/genero")
     */
    async function obtenerGenero(url) {
        let alumno = await $.ajax({
            type: "GET",
            url: url,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            dataType: "json"
        });
        return alumno.genero;
    }

    /**
     * Verifica si la edad y el genero del alumno se encuentran en la API. De no existir estos datos, se procede a mostrar un
     * modal donde se le pide al alumno ingresar esa información
     * @async
     * @method
     */
    async function verificarEdadGenero() {
        let edad = await obtenerEdad("https://api.unialvaedison.edu.mx/v1/carreras/" + _carrera + "/grupos/" + _grupo + "/alumnos/" + _matricula + "/edades");
        let genero = await obtenerGenero("https://api.unialvaedison.edu.mx/v1/carreras/" + _carrera + "/grupos/" + _grupo + "/alumnos/" + _matricula + "/generos");
        if (edad === 0 || genero === null) {
            UTIL.mostrarModal();
        } else {
            await enviarDatosLogin("https://api.unialvaedison.edu.mx/v1/alumnos/" + _matricula + "/ingresos", _nombre);
        }
    }

});