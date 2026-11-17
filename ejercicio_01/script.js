/* =========================================================
   PROBLEMA 1 — Intervalos numéricos
   ---------------------------------------------------------
   Entrada : números enteros entre 100 y 900, de uno en uno.
   Salida  : cantidad de números en cada intervalo
             (100-300, 301-500, 501-700, 701-900),
             el número menor y el número mayor ingresados.

   Flujo MVC:
     Vista (clic en "Ingresar")
       → Controlador (valida el dato)
         → Modelo (registra y calcula)
           → Vista (actualiza el reporte)
   ========================================================= */

/* ---------- 1. CONFIGURACIÓN ---------- */
const LIMITE_MINIMO = 100;          // primer número permitido
const LIMITE_MAXIMO = 900;          // último número permitido
const ANCHO_ETIQUETA = 32;          // ancho para alinear los ":" del reporte
const ETIQUETAS_INTERVALO = [
  "Cantidad de números de 100 a 300",
  "Cantidad de números de 301 a 500",
  "Cantidad de números de 501 a 700",
  "Cantidad de números de 701 a 900"
];

/* ---------- 2. MODELO: datos y reglas de negocio ---------- */
class Modelo {
  constructor() {
    this.reiniciar();
  }

  /** Deja los contadores en cero (estado inicial). */
  reiniciar() {
    this.conteos = [0, 0, 0, 0]; // un contador por intervalo
    this.menor = null;           // aún no hay números
    this.mayor = null;
  }

  /** Devuelve true si el número es entero y está dentro del rango. */
  esValido(numero) {
    return Number.isInteger(numero) &&
           numero >= LIMITE_MINIMO &&
           numero <= LIMITE_MAXIMO;
  }

  /** Devuelve el índice del intervalo al que pertenece el número (0 a 3). */
  indiceIntervalo(numero) {
    if (numero <= 300) return 0;
    if (numero <= 500) return 1;
    if (numero <= 700) return 2;
    return 3;
  }

  /** Suma el número a su intervalo y actualiza menor y mayor. */
  registrar(numero) {
    this.conteos[this.indiceIntervalo(numero)]++;

    if (this.menor === null || numero < this.menor) this.menor = numero;
    if (this.mayor === null || numero > this.mayor) this.mayor = numero;

    return this.obtenerEstado();
  }

  /** Devuelve una copia del estado para que la vista lo dibuje. */
  obtenerEstado() {
    return {
      conteos: [...this.conteos],
      menor: this.menor,
      mayor: this.mayor
    };
  }
}

/* ---------- 3. VISTA: DOM, lectura y dibujo ---------- */
class Vista {
  constructor() {
    // Elementos del HTML que la vista necesita
    this.inputNumero = document.getElementById("numero");
    this.btnIngresar = document.getElementById("btn-ingresar");
    this.btnBorrar = document.getElementById("btn-borrar");
    this.btnReiniciar = document.getElementById("btn-reiniciar");
    this.salida = document.getElementById("salida");
    this.mensaje = document.getElementById("mensaje");
  }

  /** Lee el campo y devuelve un número (NaN si está vacío). */
  leerNumero() {
    const texto = this.inputNumero.value.trim();
    return texto === "" ? NaN : Number(texto);
  }

  /** Vacía el campo y devuelve el foco al inicio. */
  limpiarEntrada() {
    this.inputNumero.value = "";
    this.inputNumero.focus();
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
  lineaPunteada(etiqueta, valor) {
    return etiqueta.padEnd(ANCHO_ETIQUETA, ".") + " : " + valor;
  }

  /** Dibuja el reporte con el formato de la ventana del examen. */
  mostrarResultados(estado) {
    const c = estado.conteos;
    const valor = (v) => (v === null ? "---" : v);

    // 4 líneas de conteo + separación + menor y mayor
    const lineas = [
      ...ETIQUETAS_INTERVALO.map((etiqueta, i) =>
        etiqueta.padEnd(ANCHO_ETIQUETA) + " : " + c[i]
      ),
      "",
      this.lineaPunteada("Número menor", valor(estado.menor)),
      this.lineaPunteada("Número mayor", valor(estado.mayor))
    ];

    this.salida.textContent = lineas.join("\n");
  }

  /* Registro de eventos: la vista solo avisa al controlador */

  alIngresar(manejador)  { this.btnIngresar.addEventListener("click", manejador); }
  alBorrar(manejador)    { this.btnBorrar.addEventListener("click", manejador); }
  alReiniciar(manejador) { this.btnReiniciar.addEventListener("click", manejador); }

  /** Permite enviar el número con la tecla Enter. */
  alPresionarEnter(manejador) {
    this.inputNumero.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter") manejador();
    });
  }
}

/* ---------- 4. CONTROLADOR: une modelo y vista ---------- */
class Controlador {
  constructor(modelo, vista) {
    this.modelo = modelo;
    this.vista = vista;

    // Conecta cada acción de la vista con un método del controlador
    this.vista.alIngresar(() => this.ingresar());
    this.vista.alBorrar(() => this.borrar());
    this.vista.alReiniciar(() => this.reiniciar());
    this.vista.alPresionarEnter(() => this.ingresar());

    // Estado inicial del reporte
    this.vista.mostrarResultados(this.modelo.obtenerEstado());
  }

  /** Valida el número y, si es correcto, lo registra en el modelo. */
  ingresar() {
    const numero = this.vista.leerNumero();

    if (Number.isNaN(numero)) {
      this.vista.mostrarError("Debe ingresar un número.");
      return;
    }
    if (!Number.isInteger(numero)) {
      this.vista.mostrarError("El número debe ser un entero (sin decimales).");
      return;
    }
    if (!this.modelo.esValido(numero)) {
      this.vista.mostrarError(
        `El número debe ser mayor o igual que ${LIMITE_MINIMO} y menor o igual que ${LIMITE_MAXIMO}.`
      );
      return;
    }

    this.vista.limpiarError();
    const estado = this.modelo.registrar(numero);
    this.vista.mostrarResultados(estado);
    this.vista.limpiarEntrada();
  }

  /** "Borrar": limpia el campo y el mensaje de error. */
  borrar() {
    this.vista.limpiarError();
    this.vista.limpiarEntrada();
  }

  /** "Reiniciar contadores": vuelve al estado inicial. */
  reiniciar() {
    this.modelo.reiniciar();
    this.vista.limpiarError();
    this.vista.limpiarEntrada();
    this.vista.mostrarResultados(this.modelo.obtenerEstado());
  }
}

/* ---------- 5. ARRANQUE ---------- */
/* Espera a que el HTML esté listo y crea las 3 piezas del MVC. */
document.addEventListener("DOMContentLoaded", () => {
  new Controlador(new Modelo(), new Vista());
});
