/*
   PROBLEMA 3 — Licencias Video Edit 2.0
   ---------------------------------------------------------
   Entrada : tipo de licencia y número de licencias.
   Salida  : detalle de la venta actual y reporte histórico
             (licencias vendidas, ventas e importe por tipo).

   Precios: Cobre 510 | Bronze 1500 | Silver 3100 | Gold 4500

   Flujo MVC:
     Vista (HTML + CSS: formulario, botones e interfaz)
       → Controlador (escucha la petición de la vista y valida)
         → Modelo (JS: calcula el importe y acumula)
           → Controlador devuelve el resultado a la Vista
 */

/* ---------- 1. CONFIGURACIÓN ---------- */
const TIPOS_LICENCIA = ["Cobre", "Bronze", "Silver", "Gold"];
const PRECIOS = {
  Cobre: 510,
  Bronze: 1500,
  Silver: 3100,
  Gold: 4500,
};
const ANCHO_ETIQUETA = 29; // ancho para alinear los ":" del reporte

/* ---------- 2. MODELO (JS): datos y reglas de negocio ---------- */
class Modelo {
  constructor() {
    this.tipos = TIPOS_LICENCIA;
    this.precios = PRECIOS;
    this.reiniciar();
  }

  /** Deja el reporte en cero para cada tipo de licencia. */
  reiniciar() {
    // Por cada tipo: ventas efectuadas, licencias vendidas e importe
    this.resumen = {};
    for (const tipo of this.tipos) {
      this.resumen[tipo] = { ventas: 0, licencias: 0, importe: 0 };
    }
  }

  /** Devuelve el costo unitario de un tipo de licencia. */
  precio(tipo) {
    return this.precios[tipo];
  }

  /** Revisa los datos de la venta. Devuelve error o null si son correctos. */
  validar(tipo, cantidad) {
    if (!this.tipos.includes(tipo))
      return "Seleccione un tipo de licencia válido.";
    if (Number.isNaN(cantidad)) return "Debe ingresar el número de licencias.";
    if (!Number.isInteger(cantidad))
      return "El número de licencias debe ser un entero.";
    if (cantidad <= 0) return "El número de licencias debe ser mayor que cero.";
    return null;
  }

  /** Calcula el importe, acumula la venta y devuelve el detalle + reporte. */
  procesarVenta(tipo, cantidad) {
    const importe = this.precio(tipo) * cantidad;
    const registro = this.resumen[tipo];

    registro.ventas++;
    registro.licencias += cantidad;
    registro.importe += importe;

    return {
      venta: { tipo, cantidad, importe },
      resumen: this.obtenerResumen(),
    };
  }

  /** Copia del reporte acumulado para que el controlador lo dibuje. */
  obtenerResumen() {
    const copia = {};
    for (const tipo of this.tipos) copia[tipo] = { ...this.resumen[tipo] };
    return copia;
  }
}

/* ---------- 3. CONTROLADOR (HTML + JS): puente entre la Vista y el Modelo ---------- */
class Controlador {
  constructor(modelo) {
    this.modelo = modelo;

    // Referencias a la Vista: elementos HTML del formulario y la salida
    this.selectTipo = document.getElementById("tipo");
    this.inputCantidad = document.getElementById("cantidad");
    this.btnProcesar = document.getElementById("btn-procesar");
    this.btnBorrar = document.getElementById("btn-borrar");
    this.btnReiniciar = document.getElementById("btn-reiniciar");
    this.salidaVenta = document.getElementById("salida-venta");
    this.salidaReporte = document.getElementById("salida-reporte");
    this.mensaje = document.getElementById("mensaje");

    // Formato de moneda tipo 9,000.00
    this.formatoMoneda = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Escucha las peticiones que hace la Vista (clics y tecla Enter)
    this.btnProcesar.addEventListener("click", () => this.procesar());
    this.btnBorrar.addEventListener("click", () => this.borrar());
    this.btnReiniciar.addEventListener("click", () => this.reiniciar());
    this.inputCantidad.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter") this.procesar();
    });

    // Estado inicial de los dos recuadros
    this.mostrarVentaActual();
    this.mostrarReporte(this.modelo.obtenerResumen(), this.modelo.tipos);
  }

  /* --- Lectura y escritura de la Vista (formulario y DOM) --- */

  /** Devuelve el tipo de licencia elegido. */
  leerTipo() {
    return this.selectTipo.value;
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

  /** Arma una línea con puntos de relleno, como en el examen. */
  linea(etiqueta, valor) {
    return etiqueta.padEnd(ANCHO_ETIQUETA, ".") + " : " + valor;
  }

  /** Estado inicial del recuadro "Venta Actual". */
  mostrarVentaActual() {
    this.salidaVenta.textContent = "Realice una venta para ver el detalle.";
  }

  /** Dibuja el detalle de la última venta. */
  mostrarVenta(venta) {
    const lineas = [
      this.linea("Tipo de licencia", venta.tipo),
      this.linea("Número de licencias", venta.cantidad),
      this.linea("Importe a pagar", this.formatoMoneda.format(venta.importe)),
    ];
    this.salidaVenta.textContent = lineas.join("\n");
  }

  /** Dibuja el reporte histórico por tipo de licencia. */
  mostrarReporte(resumen, tipos) {
    // Genera un bloque de 4 líneas (una por tipo) para un campo del resumen
    const bloque = (titulo, campo, formato = (v) => v) => {
      const lineas = [titulo];
      for (const tipo of tipos) {
        lineas.push(
          "   " +
            this.linea("Por licencias " + tipo, formato(resumen[tipo][campo])),
        );
      }
      return lineas;
    };

    // Orden igual al de la ventana del examen
    const lineas = [
      ...bloque("Número de licencias vendidas", "licencias"),
      "",
      ...bloque("Número de ventas efectuadas", "ventas"),
      "",
      ...bloque("Importe total recaudado", "importe", (v) =>
        this.formatoMoneda.format(v),
      ),
    ];

    this.salidaReporte.textContent = lineas.join("\n");
  }

  /* --- Acciones: la Vista pide → el Controlador valida → el Modelo calcula --- */

  /** Valida los datos y registra la venta en el modelo. */
  procesar() {
    const tipo = this.leerTipo();
    const cantidad = this.leerCantidad();

    const error = this.modelo.validar(tipo, cantidad);
    if (error) {
      this.mostrarError(error);
      return;
    }

    this.limpiarError();
    const { venta, resumen } = this.modelo.procesarVenta(tipo, cantidad);
    this.mostrarVenta(venta);
    this.mostrarReporte(resumen, this.modelo.tipos);
    this.limpiarEntrada();
  }

  /** "Borrar": limpia el campo y el mensaje de error. */
  borrar() {
    this.limpiarError();
    this.limpiarEntrada();
  }

  /** "Reiniciar reporte": deja todos los acumulados en cero. */
  reiniciar() {
    this.modelo.reiniciar();
    this.limpiarError();
    this.limpiarEntrada();
    this.mostrarVentaActual();
    this.mostrarReporte(this.modelo.obtenerResumen(), this.modelo.tipos);
  }
}

/* ---------- 4. ARRANQUE ---------- */
/* Espera a que el HTML esté listo y crea el Modelo y el Controlador. */
document.addEventListener("DOMContentLoaded", () => {
  new Controlador(new Modelo());
});
