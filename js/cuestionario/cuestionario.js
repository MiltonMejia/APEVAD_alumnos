// http://unialvaedison.edu.mx
// +    creado por: Milton Jeonathan Mejia Fabian
// +   colaborador: Brandon Yair Cuatecatl Cuapa

var datosAlumno = $.parseJSON(sessionStorage.getItem("sesion"));
if(!datosAlumno){window.location.href = '../index.html';}
var encuesta;
encuesta = new Encuesta(datosAlumno);

$(async function () {
  UTIL.mostrarGifCarga();
  UTIL.habilitarPopOver();
  UTIL.evitarRetrocesoPagina();
  await encuesta.cargarDatos();
  UTIL.ocultarGifCarga();
})

/**
 * Evento: click al botón btnIngresar en cuestionario.html
 * @event click[btnEnviar]
 */
$("#btnEnviar").click(async function() {
  if (document.querySelector('input[name="group"]:checked'))
  {
    let respuestaPregunta = document.querySelector('input[name="group"]:checked').value;
    await encuesta.cargarNuevosDatos(respuestaPregunta);
  }
  else
  {
    UTIL.mostrarMensajeError("Seleccione una opción para continuar");
  }
})

