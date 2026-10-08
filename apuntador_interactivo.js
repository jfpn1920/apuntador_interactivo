// ===== CONFIGURACIÓN =====
const CLAVE = "apuntadorInteractivo"; // clave con la que se guarda en localStorage
// Valores originales: sirven al abrir por primera vez y al pulsar "Restaurar todo"
const ORIGINAL = { mensaje: "¡Me tocaste!", color: "#fca311", forma: "redondeado", tamano: 200, veces: 0, segundos: 0 };
const RADIOS = { cuadrado: "8px", redondeado: "36px", circulo: "50%" }; // redondez según la forma
let estado = { ...ORIGINAL }; // copia de los valores originales
let encima = false;           // indica si el cursor está sobre la figura ahora mismo
let inicio = 0;               // momento en que el cursor entró (para medir el tiempo)
const $ = (id) => document.getElementById(id); // atajo para buscar elementos por id
// ===== LOCALSTORAGE =====
// Guarda el estado completo como texto JSON
function guardar() { localStorage.setItem(CLAVE, JSON.stringify(estado)); }
// Recupera lo guardado (si existe); mezclar con ORIGINAL evita que falte algún dato
function cargar() { const g = localStorage.getItem(CLAVE); if (g) estado = { ...ORIGINAL, ...JSON.parse(g) }; }
// ===== APARIENCIA =====
// Elige texto oscuro o claro según qué tan claro sea el color, para que siempre se lea
function textoLegible(hex) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#14213d" : "#ffffff";
}
// Aplica la personalización a la figura usando variables CSS
function aplicar() {
    const o = $("objetivo").style;
    o.setProperty("--hover", estado.color);
    o.setProperty("--tamano", estado.tamano + "px");
    o.setProperty("--radio", RADIOS[estado.forma]);
    o.setProperty("--texto-hover", textoLegible(estado.color));
    $("campo-mensaje").value = estado.mensaje; $("campo-color").value = estado.color;
    $("campo-forma").value = estado.forma; $("campo-tamano").value = estado.tamano;
    $("tamano-valor").textContent = estado.tamano;
    pintarTexto();
}
// Escribe el texto de la figura y el estado según el cursor esté encima o no
function pintarTexto() {
    $("objetivo-texto").textContent = encima ? (estado.mensaje.trim() || "¡Hola!") : "Pasa el cursor por aquí";
    $("s-estado").textContent = encima ? "Encima" : "Fuera";
}
// Muestra las veces y el tiempo acumulado
function pintarEstadisticas() {
    $("s-veces").textContent = estado.veces;
    $("s-tiempo").textContent = estado.segundos.toFixed(1) + " s";
}
// ===== EVENTOS DEL CURSOR =====
// El cursor (o el foco del teclado) entra: se cuenta una vez y se empieza a medir el tiempo
function entrar() {
    if (encima) return; // evita contar dos veces si entran ratón y teclado a la vez
    encima = true; inicio = Date.now();
    estado.veces++;
    $("objetivo").classList.add("activo");
    pintarTexto(); pintarEstadisticas(); guardar();
}
// El cursor sale: se suma el tiempo que estuvo encima
function salir() {
    if (!encima) return;
    encima = false;
    estado.segundos += (Date.now() - inicio) / 1000;
    $("objetivo").classList.remove("activo");
    pintarTexto(); pintarEstadisticas(); guardar();
}
// ===== PERSONALIZACIÓN =====
// Lee los controles, guarda y actualiza la figura
function alCambiar() {
    estado.mensaje = $("campo-mensaje").value; estado.color = $("campo-color").value;
    estado.forma = $("campo-forma").value; estado.tamano = Number($("campo-tamano").value);
    aplicar(); guardar();
}
// Pone en cero solo los contadores
function reiniciarContadores() { estado.veces = 0; estado.segundos = 0; pintarEstadisticas(); guardar(); }
// Vuelve a todos los valores originales
function restaurar() { estado = { ...ORIGINAL }; aplicar(); pintarEstadisticas(); guardar(); }
// ===== EVENTOS =====
// pointer sirve para ratón, lápiz y dedo; focus/blur sirven para el teclado
$("objetivo").addEventListener("pointerenter", entrar);
$("objetivo").addEventListener("pointerleave", salir);
$("objetivo").addEventListener("focus", entrar);
$("objetivo").addEventListener("blur", salir);
// Cualquier cambio en los controles actualiza la figura al instante
["campo-mensaje", "campo-color", "campo-forma", "campo-tamano"].forEach((id) => $(id).addEventListener("input", alCambiar));
$("btn-contadores").addEventListener("click", reiniciarContadores);
$("btn-restaurar").addEventListener("click", restaurar);
// ===== ARRANQUE =====
// Al cargar la página se recupera lo guardado y se muestra de nuevo
cargar();
aplicar();
pintarEstadisticas();