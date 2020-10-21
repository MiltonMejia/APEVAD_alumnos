/**
 * Funciones Utiizadas para modificar elementos de pantalla y otros
 *@namespace
*/
var UTIL = {

    /**
     * Deshabilita cualquier botón mediante su ID
     * @param {String} idBoton ID del boton
     * @example UTIL.deshabilitarBoton("#btnBoton")
     */
    deshabilitarBoton: function (idBoton) {
        $(idBoton).attr("disabled", true);
    },
    
    /**
     * Evita que el usuario regrese una página anterior en el navegador
     * @example UTIL.evitarRetrocesoPagina()
     */
    evitarRetrocesoPagina: function() {
        window.history.pushState(null, "", window.location.href);        
        window.onpopstate = function() {window.history.pushState(null, "", window.location.href)};
    },
    
    /**
     * Habilita el Popover en la página del cuestionario
     * @example UTIL.habilitarPopOver()
     */
    habilitarPopOver: function() {
        $('[data-toggle="tooltip"]').tooltip()
      $('.example-popover').popover({
        container: 'body'
      })
    },
    
    /**
     * Limpiar los datos de SessionStorage que sean necesarios
     * @param {String} dato Nombre de la variable de SessionStorage
     * @example UTIL.limpiarSesionAnterior("sesion")
     */
    limpiarSesionAnterior: function (dato) {
        sessionStorage.removeItem(dato);
    },
    
    /**
     * Limpiar el texto de cualquier input mediante su ID
     * @param {String} idInput ID del input
     * @example UTIL.limpiarInput("#txtMatricula")
     */
    limpiarInput: function(idInput) {
        $(idInput).val("");
    },
    
    /**
     * Muestra un mensaje de error utilizando [SweetAlert2]{@link https://sweetalert2.github.io/}
     * @param {String} mensaje Mensaje de error
     * @example UTIL.mostrarMensajeError("Error")
     */
    mostrarMensajeError: function (mensaje) {
        Swal.fire({
            type: 'error',
            text: mensaje
        });
    },
    
    /**
     * Redirecciona a otra página despues de mostrar un mensaje de error utilizando [SweetAlert2]{@link https://sweetalert2.github.io/}
     * que redirecciona automáticamente después de 1.5 segundos
     * @param {String} url Url de redireccionamiento
     * @param {String} mensaje Mensaje de error
     * @example UTIL.mostrarMensajeRedireccion("../index.html","Error")
     */
    mostrarMensajeRedireccion: function (url, mensaje) {
        Swal.fire({
            type: 'success',
            html: mensaje,
            timer: 1500,
            showCancelButton: false,
            showConfirmButton: false,
            onBeforeOpen: () => {
                timerInterval = setInterval(() => 100)
            },
            onClose: () => {
                window.location.href = url;
            }
        })
    },
    
    /**
     * Muestra un mensaje de éxito utilizando [SweetAlert2]{@link https://sweetalert2.github.io/} que se cierra
     * automáticamente después de 1.5 segundos
     * @param {String} mensaje Mensaje de éxito
     * @example UTIL.mostrarMensajeExitoTiempo("Éxito")
     */
    mostrarMensajeExitoTiempo: function (mensaje) {
        Swal.fire({
            type: 'success',
            html: mensaje,
            timer: 1500,
            showCancelButton: false,
            showConfirmButton: false,
            onBeforeOpen: () => {
                timerInterval = setInterval(() => 100)
            }
        })
    },
    
    /**
     * Muestra un GIF de carga
     * @example //HTML//
     *<br> <div class="modal" id="loading"></div>
     * @example //CSS//
     *.modal{ 
     *    display: none;
     *    position: fixed;
     *    z-index: 1000;
     *    top: 0;
     *    left: 0;
     *    height: 100%;
     *    width: 100%;
     *    background: rgba(255, 255, 255, .8) url('../../ima/otros/carga.gif') 50% 50% no-repeat;
     *}
     * @example //JS//
     *UTIL.mostrarGifCarga()
     */
    mostrarGifCarga: function() {
        $("#loading").show();
    },
    
    /**
     * Muestra el modal [Material Modal]{@link https://daemonite.github.io/material/docs/4.1/components/modal/}
     * @example UTIL.mostrarModal()
     */
    mostrarModal: function () {
    
        $("#loading").hide();
        $('#modalAlumno').modal({
            backdrop: 'static',
            keyboard: false
        })
    },
    
    /**
     * Oculta el GIF de Carga. Para información de implementacion del GIF ver: [mostrarGifCarga]{@link UTIL.mostrarGifCarga}
     * @example UTIL.ocultarGifCarga()
     */
    ocultarGifCarga: function() {
        $("#loading").hide();
    },
    
    /**
     * Oculta el modal. Para información de implementacion del modal ver: [mostrarModal]{@link UTIL.mostrarModal}
     * @example UTIL.ocultarModal()
     */
    ocultarModal: function () {
        $('#modalAlumno').modal('hide');
    }
}

/**
 * Convierte una palabra en palabra capital
 * @global
 * @example let ejemplo = "hOlA"
 * @example ejemplo.capitalize(true)
 * @example console.log(ejemplo) // Devuelve Hola
 */
String.prototype.capitalize = function (lower) {
    return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function (a) {
        return a.toUpperCase();
    });
}