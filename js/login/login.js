let _matricula;
let _login;


$(function () {
    UTIL.limpiarSesionAnterior("sesion");
    UTIL.limpiarInput("#txtMatricula");
})

/**
 * Evento: click al botón btnIngresar en index.html
 * @event click[btnIngresar]
 */
$("#btnIngresar").click(async function (e) {
    _matricula = $("#txtMatricula").val();
    _login = new Login(_matricula);
    e.preventDefault();
    $("#loading").show();
    await _login.extraerDatosAlumno();
    $("#loading").hide();
});

/**
 * Evento: click al botón btnDatosAlumno en index.html
 * @event click[btnDatosAlumno]
 */
$("#btnDatosAlumno").click(async function (e) {
    let edad = $('#cboEdad option:selected').val();
    let genero = $('#cboGenero option:selected').val()
    e.preventDefault();
    $("#loading").show();
    await _login.enviarModalAlumno(edad,genero);
    $("#loading").hide();
});