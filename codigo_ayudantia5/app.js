// Importar las dependencias necesarias
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Usuario from "./models/usuario.js";
import { engine } from "express-handlebars";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Configurar el entorno y las rutas de archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde .env
dotenv.config();

// Crear una instancia de la aplicación Express
const app = express();

// Configurar el motor de plantillas Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

//archivos estaticos
app.use(express.static(__dirname + "/views"));

// Conectar a la base de datos MongoDB utilizando la variable de entorno MONGODB_URI
mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Ruta para manejar el inicio de sesión
app.get("/login", async (req, res) => {
	let user = req.query.user;
	let pass = req.query.pass;

	// Verificar si el usuario y la contraseña se proporcionaron en la solicitud
	if (user && pass) {
		// Buscar el usuario en la base de datos con el nombre de usuario y contraseña proporcionados
		const usuario = await Usuario.findOne({
			usuario: user,
			contrasena: pass,
		});

		// Si se encuentra al usuario, renderizar la plantilla 'index'
		if (usuario) {
			res.render("index", { usuario: user });
		} else {
			// Si no se encuentra al usuario, renderizar la plantilla 'login' con un mensaje de error
			res.render("login", {
				fallido: "Usuario o contraseña incorrectos.",
			});
		}
	} else {
		// Si el usuario y la contraseña no se proporcionaron en la solicitud, renderizar la plantilla 'login' sin mensaje de error
		res.render("login");
	}
});

// Iniciar el servidor en el puerto especificado o en el puerto 3000 si no se proporciona
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
