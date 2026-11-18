/* 
   PROBLEMA 2 — Almacén de bolsas de cemento
   ---------------------------------------------------------
   Entrada : operación (depósito o retiro) y cantidad.
   Salida  : stock actual, capacidad libre, número de
             depósitos y retiros, totales y máximos/mínimos.

   Flujo MVC:
     Vista (HTML + CSS: formulario, botones e interfaz)
       → Controlador (escucha la petición de la vista y valida)
         → Modelo (JS: actualiza el almacén)
           → Controlador devuelve el resultado a la Vista
 */

/* ---------- 1. CONFIGURACIÓN ---------- */
const STOCK_INICIAL = 2000; // bolsas al comenzar
const CAPACIDAD_ALMACEN = 3500; // máximo que admite el almacén
const ANCHO_ETIQUETA = 30; // ancho para alinear los ":" del reporte

/* ---------- 2. MODELO (JS): datos y reglas de negocio ---------- */
class Modelo {
  constructor() {
    this.reiniciar();
  }

  /** Vuelve a los valores iniciales del almacén. */
  reiniciar() {
    this.stock = STOCK_INICIAL;
    this.capacidad = CAPACIDAD_ALMACEN;

    // Contadores de operaciones
    this.numDepositos = 0;
    this.numRetiros = 0;

    // Totales acumulados
    this.totalDepositado = 0;
    this.totalRetirado = 0;

    // Récords de cada operación (null = todavía no hubo ninguna)
    this.maxDeposito = 0;
    this.minDeposito = null;
    this.maxRetiro = 0;
    this.minRetiro = null;
  }

  /** Espacio disponible en el almacén. */
  capacidadLibre() {
    return this.capacidad - this.stock;
  }

  /** Revisa la operación. Devuelve un mensaje de error o null si todo está bien. */
  validar(operacion, cantidad) {
    if (Number.isNaN(cantidad)) return "Debe ingresar una cantidad.";
    if (!Number.isInteger(cantidad))
      return "La cantidad debe ser un número entero.";
    if (cantidad <= 0) return "La cantidad debe ser mayor que cero.";

    if (operacion === "deposito" && cantidad > this.capacidadLibre()) {
      return `No hay espacio suficiente. Capacidad libre: ${this.capacidadLibre()} bolsas.`;
    }
    if (operacion === "retiro" && cantidad > this.stock) {
      return `Stock insuficiente. Stock actual: ${this.stock} bolsas.`;
    }
    return null;
  }

  /** Ingresa bolsas al almacén y actualiza contadores y récords. */
  depositar(cantidad) {
    this.stock += cantidad;
    this.numDepositos++;
    this.totalDepositado += cantidad;

    if (cantidad > this.maxDeposito) this.maxDeposito = cantidad;
    if (this.minDeposito === null || cantidad < this.minDeposito)
      this.minDeposito = cantidad;

    return this.obtenerEstado();
  }

  /** Saca bolsas del almacén y actualiza contadores y récords. */
  retirar(cantidad) {
    this.stock -= cantidad;
    this.numRetiros++;
    this.totalRetirado += cantidad;

    if (cantidad > this.maxRetiro) this.maxRetiro = cantidad;
    if (this.minRetiro === null || cantidad < this.minRetiro)
      this.minRetiro = cantidad;

    return this.obtenerEstado();
  }

  /** Copia del estado actual para que el controlador lo dibuje. */
  obtenerEstado() {
    return {
      stock: this.stock,
      capacidad: this.capacidad,
      capacidadLibre: this.capacidadLibre(),
      numDepositos: this.numDepositos,
      numRetiros: this.numRetiros,
      totalDepositado: this.totalDepositado,
      totalRetirado: this.totalRetirado,
      maxDeposito: this.maxDeposito,
      minDeposito: this.minDeposito,
      maxRetiro: this.maxRetiro,
      minRetiro: this.minRetiro,
    };
  }
}

/* ---------- 3. CONTROLADOR (HTML + JS): puente entre la Vista y el Modelo ---------- */
class Controlador {
  constructor(modelo) {
    this.modelo = modelo;

    // Referencias a la Vista: elementos HTML del formulario y la salida
    this.selectOperacion = document.getElementById("operacion");
    this.inputCantidad = document.getElementById("cantidad");
    this.btnOperar = document.getElementById("btn-operar");
    this.btnBorrar = document.getElementById("btn-borrar");
    this.btnReiniciar = document.getElementById("btn-reiniciar");
    this.salida = document.getElementById("salida");
    this.mensaje = document.getElementById("mensaje");

    // Escucha las peticiones que hace la Vista (clics y tecla Enter)
    this.btnOperar.addEventListener("click", () => this.operar());
    this.btnBorrar.addEventListener("click", () => this.borrar());
    this.btnReiniciar.addEventListener("click", () => this.reiniciar());
    this.inputCantidad.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter") this.operar();
    });

    // Estado inicial del reporte
    this.mostrarResultados(this.modelo.obtenerEstado());
  }

  /* --- Lectura y escritura de la Vista (formulario y DOM) --- */

  /** Devuelve la operación elegida: "deposito" o "retiro". */
  leerOperacion() {
    return this.selectOperacion.value;
  }

  /** Lee el campo y devuelve un número (NaN si está vacío). */
  leerCantidad() {
    const texto = this.inputCantidad.value.trim();
    return texto === "" ? NaN : Number(texto);
  }

  /** Vacía el campo y devuelve el foco al inicio. */
  limpiarEntrada() {
    this.inputCantidad.value = "";
    this.inputCantidad.focus();
  }

  /** Muestra un mensaje de error debajo del formulario. */
  mostrarError(texto) {
    this.mensaje.textContent = texto;
  }

  /** Borra el mensaje de error. */
  limpiarError() {
    this.mensaje.textContent = "";
  }

  /** Arma una línea del reporte alineando la etiqueta. */
  linea(etiqueta, valor) {
    return etiqueta.padEnd(ANCHO_ETIQUETA) + " : " + valor;
  }

  /** Dibuja el reporte con el formato de la ventana del examen. */
  mostrarResultados(e) {
    const valor = (v) => (v === null ? "---" : v);

    const lineas = [
      this.linea("Stock actual del almacén", e.stock),
      this.linea("Capacidad libre", e.capacidadLibre),
      this.linea("Número de depósitos efectuados", e.numDepositos),
      this.linea("Número de retiros efectuados", e.numRetiros),
      this.linea("Cantidad de bolsas depositadas", e.totalDepositado),
      this.linea("Cantidad de bolsas retiradas", e.totalRetirado),
      this.linea("Cantidad máxima depositada", valor(e.maxDeposito)),
      this.linea("Cantidad mínima depositada", valor(e.minDeposito)),
      this.linea("Cantidad máxima retirada", valor(e.maxRetiro)),
      this.linea("Cantidad mínima retirada", valor(e.minRetiro)),
    ];

    this.salida.textContent = lineas.join("\n");
  }

  /* --- Acciones: la Vista pide → el Controlador valida → el Modelo calcula --- */

  /** Valida la cantidad y ejecuta el depósito o el retiro. */
  operar() {
    const operacion = this.leerOperacion();
    const cantidad = this.leerCantidad();

    const error = this.modelo.validar(operacion, cantidad);
    if (error) {
      this.mostrarError(error);
      return;
    }

    this.limpiarError();
    const estado =
      operacion === "deposito"
        ? this.modelo.depositar(cantidad)
        : this.modelo.retirar(cantidad);

    this.mostrarResultados(estado);
    this.limpiarEntrada();
  }

  /** "Borrar": limpia el campo y el mensaje de error. */
  borrar() {
    this.limpiarError();
    this.limpiarEntrada();
  }

  /** "Reiniciar almacén": vuelve a stock 2000 y capacidad 3500. */
  reiniciar() {
    this.modelo.reiniciar();
    this.limpiarError();
    this.limpiarEntrada();
    this.mostrarResultados(this.modelo.obtenerEstado());
  }
}

/* ---------- 4. ARRANQUE ---------- */
/* Espera a que el HTML esté listo y crea el Modelo y el Controlador. */
document.addEventListener("DOMContentLoaded", () => {
  new Controlador(new Modelo());
});
