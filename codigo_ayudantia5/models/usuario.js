// Importar mongoose para trabajar con esquemas y modelos de datos
import mongoose from "mongoose";

// Definir el esquema de datos para un Usuario
const UsuarioSchema = new mongoose.Schema({
	nombre: String,
	edad: Number,
	correo: String,
	intereses: [String],
	usuario: String,
	contrasena: String,
	direccion: {
		calle: String,
		ciudad: String,
		pais: String,
	},
});

// Exportar el modelo de datos 'Usuario' basado en el esquema 'UsuarioSchema'
export default mongoose.model("Usuario", UsuarioSchema);
