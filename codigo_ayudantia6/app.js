// Importar las dependencias necesarias
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Usuario from "./models/usuario.js";
import { engine } from "express-handlebars";
import { fileURLToPath } from "url";
import { dirname } from "path";
import jwt from "jsonwebtoken";

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

function verifyToken(req, res, next) {
	const token = req.headers["x-access-token"];
	if (!token)
		return res
			.status(403)
			.send({ auth: false, message: "No token provided." });

	jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
		if (err)
			return res.status(500).send({
				auth: false,
				message: "Failed to authenticate token.",
			});

		// if everything good, save to request for use in other routes
		req.userId = decoded.id;
		next();
	});
}

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

		// Si se encuentra al usuario, renderizar la plantilla 'ticketera'
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

app.post("/register", express.json(), async (req, res) => {
	const { nombre, edad, correo, intereses, usuario, contrasena, direccion } =
		req.body;

	const nuevoUsuario = new Usuario({
		nombre,
		edad,
		correo,
		intereses,
		usuario,
		contrasena,
		direccion,
	});

	try {
		await nuevoUsuario.save();

		const token = jwt.sign(
			{ id: nuevoUsuario._id },
			process.env.JWT_SECRET,
			{
				expiresIn: 86400, // expires in 24 hours
			}
		);

		res.status(200).send({ auth: true, token });
	} catch (err) {
		res.status(500).send("Hubo un problema al registrarse al usuario.");
	}
});

// Iniciar el servidor en el puerto especificado o en el puerto 3000 si no se proporciona
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
