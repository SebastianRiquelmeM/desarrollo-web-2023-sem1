// Importar mongoose para trabajar con esquemas y modelos de datos
import mongoose from "mongoose";

// Esquema de datos para una Cuenta
const CuentaSchema = new mongoose.Schema({
	usuario_id: mongoose.Schema.Types.ObjectId,
	saldo: Number,
});

// Exportar el modelo de datos 'Cuenta' basado en el esquema 'CuentaSchema'
export const Cuenta = mongoose.model("Cuenta", CuentaSchema);
