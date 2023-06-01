// Importar mongoose para trabajar con esquemas y modelos de datos
import mongoose from "mongoose";

// Esquema de datos para una Transferencia
const TransferenciaSchema = new mongoose.Schema({
	emisor_id: mongoose.Schema.Types.ObjectId,
	receptor_id: mongoose.Schema.Types.ObjectId,
	monto: Number,
	fecha: Date,
	descripcion: String, // Campo nuevo
});

// Exportar el modelo de datos 'Transferencia' basado en el esquema 'TransferenciaSchema'
export const Transferencia = mongoose.model(
	"Transferencia",
	TransferenciaSchema
);
