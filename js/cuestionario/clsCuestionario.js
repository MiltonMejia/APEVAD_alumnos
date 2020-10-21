
/**
 * Clase encargada de procesar los datos relacionados a la encuesta docente, administrativa y de satisfacción
 * @class
 * @constructor
 * @param {Object} alumno Datos del alumno que realiza la encuesta
 * @param {String} alumno.matricula Matrícula del alumno
 * @param {String} alumno.grupo Grupo del alumno
 * @param {String} alumno.carrera Carrera del alumno
 * @param {String} alumno.token Token del alumno
 * @param {String} alumno.encuesta Encuesta actual del alumno
 * @example encuesta = new Encuesta(alumno)
 * @example alumno = {matricula: "A000000", grupo: "f6am", carrera: "sistemas computacionales", token : "dadasds.654sd5asd.asdasd", encuesta: "docentes"}
 */

var Encuesta = (function (alumno){

    /**
     * Matricula del alumno
     * @type {String}
     * @example _matricula = "A00000" 
     */
    var _matricula = alumno.matricula;

    /**
     * Grupo al cual pertenece el alumno
     * @type {String}
     * @example _grupo = "f6am"
     */
    var _grupo = alumno.grupo;

    /**
     * Carrera al cual pertenece el alumno
     * @type {String}
     * @example _carrera = "sistemas computacionales"
     */
    var _carrera = alumno.carrera;

    /**
     * Token JWT que genera la API para cada alumno
     * @type {String}
     * @example _token = "jdajrgsda54sd65a4sd545.546s54d65sd54d5asd.454d5s4f5a4f4"
     */
    var _token = alumno.token;

    /**
     * Tipo de encuesta que esté respondiendo actualmente el alumno
     * @type {String}
     * @example _tipoEncuesta = "docentes"
     */
    var _tipoEncuesta = alumno.encuesta;

    /**
     * Información de las preguntas de los encuestados actuales
     * @typedef {Object[]} Encuesta~_preguntasEncuestado
     * @property {number} id ID de la pregunta
     * @property {String} pregunta Pregunta
     * @example _preguntasEncuestado = [{id: 0, pregunta: "abc"}, {id: 1, pregunta: "bcd"}]
     */

    var _preguntasEncuestado;

    /**
     * Información del último encuestado registrado en la API
     * @typedef {Object} Encuesta~_ultimoEncuestado
     * @property {number} id ID del último encuestado registrado en la API
     * @property {String} pregunta ID de la última pregunta del último encuestado registrado en la API
     * @example _ultimoEncuestado = [{id: 0, pregunta: "abc"}, {id: 1, pregunta: "bcd"}]
     */
    var _ultimoEncuestado;

    /**
     * Información del los encuestados actuales
     * @typedef {Object[]} Encuesta~_datosEncuestados
     * @property {number} id ID del encuestado
     * @property {String} nombre Nombre del encuestado
     * @property {String} foto Nombre del archivo que contiene la fotografía del encuestado
     * @example _datosEncuestados = [{id: 0, nombre: "abc", foto: "0.webp"}, {id: 1, nombre: "bcd", "foto: 1.webp"}]
     */
    var _datosEncuestados;

    /**
     * Dirección de la carpeta donde se guardan las fotos o imágenes del encuestado actual
     * @type {String}
     * @example _carpetaFotos = "../ima/docentes/"
     */
    var _carpetaFotos;

    /**
     * Encuesta que sigue al terminal la encuesta actual
     * @type {String}
     * @example _siguienteEncuesta = "administrativos"
     */
    var _siguienteEncuesta;

    /**
     * Número que permite identificar la fila actual dentro de [_datosEncuestados]{@link Encuesta~_datosEncuestados}
     * @type {number}
     * @example _filaIDEncuestado = 0
     */
    var _filaIdEncuestado;

    /**
     * Número que permite identificar la fila actual dentro de [_preguntasEncuestado]{@link Encuesta~_preguntasEncuestado}
     * @type {number}
     * @example _filaIdPregunta = 0
     */
    var _filaIdPregunta;

    /**
     * Tamaño de la barra de preguntas
     * @type {number}
     * @example _tamanoBarra = 7.2434
     */
    var _tamanoBarra;

    /**
     * Asigna los datos extraídos de la API a las variables privadas de la clase para su almacenamiento
     * @async
     * @method
     */
    async function asignarVariablesEncuestado()
    {
        _ultimoEncuestado = await extraerDatosAPI("ultimoEncuestado");
        _datosEncuestados = await extraerDatosAPI("encuestado");
        _preguntasEncuestado = await extraerDatosAPI("preguntas");
        let totalEncuestados = _datosEncuestados.length;
        let totalPreguntas = _preguntasEncuestado.length;
        _filaIdEncuestado = encontrarFilaIdEncuestado(totalEncuestados);
        _filaIdPregunta = encontrarFilaIdPregunta(totalPreguntas);
    }

    /**
     * Asigna valores a las variables de la clase de acuerdo al tipo de encuesta actual
     * @async
     * @method
     */
    async function asignarDatosTipoEncuestado()
    {
        await asignarVariablesEncuestado();

        switch(_tipoEncuesta)
        {
            case "docentes":
            {
                _carpetaFotos = "../../ima/docentes/";
                _siguienteEncuesta = "administrativos";
                break;
            }
            case "administrativos":
            {
                _carpetaFotos = "../../ima/administrativos/";
                _siguienteEncuesta = "satisfaccion";
                $("#colorEncuestado").removeClass("docentes");
                $("#colorEncuestado").addClass("administrativos");
                $("#btnEnviar").removeClass("color-uae");
                $("#btnEnviar").addClass("administrativos");
                break;
            }
            case "satisfaccion":
            {
                _carpetaFotos = "../../ima/satisfaccion/";
                _siguienteEncuesta = null;
                $("#colorEncuestado").removeClass("docentes");
                $("#colorEncuestado").addClass("satisfaccion");
                $("#btnEnviar").removeClass("color-uae");
                $("#btnEnviar").addClass("satisfaccion");
                break;
            }
        }
    }

    /**
     * Verifica si la el tipo de encuesta actual ya había sido completado por el alumno previamente.
     * Para verificarlo se siguen los siguientes pasos: <br>
     * 1.- Se compara el número de evaluados con el número total de encuestados <br>
     * 2.- Se compara el número de preguntas contestadas con el número total de preguntas <br>
     * 3.- Se verifica que la siguiente encuesta que sigue después de la actual. <br>
     * 3a.- Si se cumplen los dos primeros pasos, pero la siguiente encuesta en nula, entonces se han terminado
     * las encuestas y se procede a redireccionar al login <br>
     * 3b.- Si se cumplen los dos primeros pasos, pero existen una siguiente encuesta, se procede a extraer los datos
     * de la siguiente encuesta y se vuelve a verificar los primeros 3 pasos mediante la recursividad de la función
     * @async
     * @method
     */
    async function verificarEncuestaCompletada()
    {
        let totalEncuestados = _datosEncuestados.length - 1;
        let totalPreguntas = _preguntasEncuestado.length;

        let encuestadosCompletados = _filaIdEncuestado == totalEncuestados;
        let preguntasCompletadas = _filaIdPregunta == totalPreguntas;

        if(encuestadosCompletados && preguntasCompletadas && _siguienteEncuesta == null)
        {
            UTIL.mostrarMensajeRedireccion("../../index.html", "Gracias por haber respondido la encuesta");
        }
        else if(encuestadosCompletados && preguntasCompletadas && _siguienteEncuesta != null)
        {
            _tipoEncuesta = _siguienteEncuesta;
            await asignarDatosTipoEncuestado();
            await verificarEncuestaCompletada();
        }
    }

    /**
     * Carga información de la encuesta al momento de cargar la página de encuestas
     * @async
     * @method
     * @example encuestado.cargarDatos()
     */
    this.cargarDatos = async function() {
        
        await asignarDatosTipoEncuestado();
        await verificarEncuestaCompletada();
        verificarPreguntasCompletadas();
        dibujarDatosEncuesta();
    }

    /**
     * Carga nueva información de la encuesta después de enviar los elementos anteriores. <br>
     * Para cargar la nueva información en pantalla se realiza el siguiente procedimiento: <br>
     * 1.- Se envía a la API la información necesaria descrita en el método enviarDatosAPI. <br>
     * Se verifica el número de preguntas ya contestadas y el número de encuestados ya evaluados
     * 2a.- Si el número de preguntas contestadas es menor al número total de preguntas, se aumenta el número de la pregunta actual
     * y se dibujan los nuevos datos en pantalla. <br>
     * 2b.- Si el número de preguntas contestadas es igual al número total de preguntas pero el número de encuestados ya evaluados es
     * menor al total de encuestados, se aumenta el número de encuestados ya evaluados y el número de respuestas ya contestadas se 
     * reinicia a 0. <br>
     * Si no se cumple alguna de las dos condiciones anteriores se verifica si hay alguna encuesta adicional por responder. <br>
     * 3a.- Si existen una encuesta por responder entonces se llama al metodo [cargarDatos]{@link Encuesta#cargarDatos} <br>
     * 3b.- Si no existe una encuesta por responder entonces se redirige a la página del login
     * @async
     * @method
     * @param {number} respuestaPregunta Respuesta de la pregunta hecha por el alumno
     * @example encuestado.cargarNuevosDatos(5)
     */
    this.cargarNuevosDatos = async function(respuestaPregunta) 
    {
        let totalFilasEncuestados = _datosEncuestados.length - 1;
        let totalFilasPreguntas = _preguntasEncuestado.length - 1;
        await enviarDatosAPI(_tipoEncuesta, respuestaPregunta);
        if (_filaIdPregunta < totalFilasPreguntas)
        {
            _filaIdPregunta++;
            _tamanoBarra = ((100 / totalPreguntas) * (_filaIdPregunta + 1));
            await dibujarDatosEncuesta();
        }
        else if (_filaIdPregunta == totalFilasPreguntas && _filaIdEncuestado < totalFilasEncuestados)
        {
            _filaIdEncuestado++;
            _filaIdPregunta = 0;
            _tamanoBarra = ((100 / totalPreguntas) * (_filaIdPregunta + 1));
            await dibujarDatosEncuesta();
        }
        else
        {
            await this.enviarDatosAPI("completado", null);
            if(_siguienteEncuesta != null)
            {
                _tipoEncuesta = _siguienteEncuesta;
                cargarDatos();
            }
            else
            {
                UTIL.mostrarMensajeRedireccion("../../index.html", "Gracias por haber respondido la encuesta");
            }
        }
    }

    /**
     * Envia la respuesta de una pregunta a la API
     * @async
     * @param {String} tipoRespuesta Tipo de respuesta que se envía a la API
     * @param {String} respuestaPregunta Respuesta de la pregunta hecha por el alumno
     * @throws {SweetAlert} Error cuando no se puede procesar la petición AJAX por alguna razón
     */
    async function enviarDatosAPI(tipoRespuesta, respuestaPregunta)
    {
        let uri;
        let data;
        let type;
        let idEncuestado = _datosEncuestados[_filaIdEncuestado].id;
        let idPregunta = _preguntasEncuestado[_filaIdPregunta].id;
        switch(tipoRespuesta)
        {
            case "completado":
            {
                uri = "https://api.unialvaedison.edu.mx/v1/carreras/" + _carrera + "/grupos/" + _grupo + "/alumnos/" + _matricula + "/ingresos/" + _tipoEncuesta;
                data = "token=" + _token;
                type = "PATCH";
                break;
            }
            case "satisfaccion":
            {
                uri = "" + _carrera + "/grupos/" + _grupo + "/alumnos/" + _matricula + "/satisfaccion/preguntas/" + idPregunta + "/respuestas";
                data = "token=" + _token + "&respuesta=" + encodeURIComponent(respuestaPregunta);
                type = "POST";
                break;
            }
            default:
            {
                uri = "" + _carrera + "/grupos/" + _grupo + "/alumnos/" + _matricula + "/" + _tipoEncuesta + "/" + idEncuestado + "/preguntas/" + idPregunta + "/respuestas";
                type = "POST";
                data = "token=" + _token + "&respuesta=" + encodeURIComponent(respuestaPregunta);
            }
        }

        try
        {
            await $.ajax({
                url: uri,
                type: type,
                dataType: "json",
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                data: data
              });
        }
        catch
        {
            UTIL.mostrarMensajeError("Ha ocurrido un error al enviar la información. Recargue la página e intentelo nuevamente.");
            UTIL.deshabilitarBoton("#btnEnviar");
        }
        
    }

    /**
     * Dibuja en pantalla los elementos procesados previamente de la API
     * @async
     * @method
     */
    function dibujarDatosEncuesta()
    {
        let nombre = _datosEncuestados[_filaIdEncuestado].nombre;
        let ios = !!navigator.platform.match(/iPhone|iPod|iPad/);
        if (ios || _tipoEncuesta != "docentes")
        {
            $("#imgencuesta").attr("src", _carpetaFotos +  _tipoEncuesta + ".svg");
        }else
        {
            let foto = _datosEncuestados[_filaIdEncuestado].foto;
            $("#imgencuesta").attr("src", _carpetaFotos + foto);
        }
        let pregunta = _preguntasEncuestado[_filaIdPregunta].pregunta;
        let idPregunta = _preguntasEncuestado[_filaIdPregunta].id;
        let totalPreguntas = _preguntasEncuestado.length;
        $("#txtnombre").text(nombre);
        $("#txtlicenciatura").text(_carrera);
        $('.bar').css('width', _tamanoBarra + '%');
        $("#txtPregunta").html(pregunta);
        $("#txtNumeroPregunta").text(idPregunta + " - " + totalPreguntas);
    }

    /**
     * Busca en [_datosEncuestados]{@link Encuesta~_datosEncuestados} la fila a la que le corresponde el ID de [_ultimoEncuestado]{@link Encuesta~_ultimoEncuestado}
     * @method
     * @return {number} Número de fila correspondiene al ID del encuestado
     */
    function encontrarFilaIdEncuestado()
    {
        let idUltimoEncuestado = _ultimoEncuestado.id;
        let totalEncuestados = _datosEncuestados.length;
        if (idUltimoEncuestado === 0)
        {
            idUltimoEncuestado = 0
        }
        else
        {
            for (var fila = 0; fila < totalEncuestados; fila++)
            {
                if (_datosEncuestados[fila].id === idUltimoEncuestado)
                {
                    idUltimoEncuestado = fila;
                }
            }
        }
        return idUltimoEncuestado
    }

    /**
     * Busca en [_preguntasEncuestado]{@link Encuesta~_preguntasEncuestado} la fila a la que le corresponde el ID de la pregunta de [ultimoEncuestado]{@link Encuesta~_ultimoEncuestado}
     * @method
     * @return {number} Número de fila correspondiene al ID de la pregunta actual
     */
    function encontrarFilaIdPregunta()
    {
        let idUltimaPregunta = _ultimoEncuestado.pregunta;
        let totalPreguntas = _preguntasEncuestado.length
        if(_filaIdPregunta === 0)
        {
            idUltimaPregunta = 0;
        }
        else
        {
            for (var fila = 0; fila < totalPreguntas ; fila++)
            {
                if (_preguntasEncuestado[fila].id === idUltimaPregunta)
                {
                    idUltimaPregunta = fila + 1;
                    break;
                }
            }
        }
        return idUltimaPregunta;
    }

    /**
     * Extrae de la API los datos requeridos de acuerdo al tipo de encuestado actual
     * @async
     * @method
     * @param {String} tipoDatos Tipo de encuesta actual
     * @return {Object[]} Objeto que contiene los datos necesarios de acuerdo al tipo de encuestado, si la petición AJAX es correcta <br>
     * @throws {SweetAlert} Error cuando no se puede procesar la petición AJAX por alguna razón
     */
    async function extraerDatosAPI(tipoDatos)
    {
        let uri;
        switch(tipoDatos)
        {
            case "encuestado":
            {
                uri = "" + _carrera + "/grupos/" + _grupo + "/alumnos/" + _matricula + "/" + _tipoEncuesta;
                break;
            }
            case "preguntas":
            {
                uri = "" + _carrera + "/grupos/" + _grupo + "/alumnos/" + _matricula + "/" + _tipoEncuesta + "/preguntas";
                break;
            }
            case "ultimoEncuestado":
            {
                uri = "" + _carrera + "/grupos/" + _grupo + "/alumnos/" + _matricula + "/" + _tipoEncuesta + "/preguntas?sortby=-created";
            }
        }
        
        try
        {
            let datosAPI = await $.ajax({
                type: "GET",
                url: uri,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                data: "token=" + _token,
                dataType: "json"
              });
              return datosAPI;
        }
        catch(error)
        {
            UTIL.mostrarMensajeError("Ha ocurrido un error al momento de extraer la información. Recargue la página e intentelo nuevamente.")
            UTIL.deshabilitarBoton("#btnEnviar");
        }
    }

    /**
     * Verifica si las preguntas del encuestado actual ya habían sido completados por el alumno previamente.
     * @method
     */
    function verificarPreguntasCompletadas()
    {
        let totalPreguntas = _preguntasEncuestado.length;
        if (_filaIdPregunta == totalPreguntas)
        {
            _filaIdEncuestado++;
            _filaIdPregunta = 0;
        }
        _tamanoBarra = ((100 / totalPreguntas) * (_filaIdPregunta + 1));
    }
})