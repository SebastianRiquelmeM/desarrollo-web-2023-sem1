// Importar las dependencias necesarias
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Usuario from "./models/usuario.js";
import { engine } from "express-handlebars";
import { fileURLToPath } from "url";
import { dirname } from "path";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

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

// Servir archivos estáticos desde el directorio de vistas
app.use(express.static(__dirname + "/views"));

// Permitir el procesamiento de solicitudes POST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a la base de datos MongoDB utilizando la variable de entorno MONGODB_URI
mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Configurar el middleware cookie-parser para trabajar con cookies
app.use(cookieParser());

// Middleware para verificar el token JWT
// Función para verificar el token JWT
function verifyToken(req, res, next) {
	// Obtener el token de las cookies
	const token = req.cookies.token;

	// Si no hay token, redirigir al usuario a la página de inicio de sesión
	if (!token) return res.redirect("/login");

	// Verificar el token
	jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
		if (err)
			// Si el token no es válido, redirigir al usuario a la página de inicio de sesión
			return res.redirect("/login");

		// Si el token es válido, establecer req.userId y continuar con la siguiente función
		req.userId = decoded.id;
		next();
	});
}

//hay 2 secciones de rutas, las de plantillas y las de API
//Esto en verdad debería hacerse separado en 2 archivos, pero por simplicidad
//para explicar lo dejaremos así

//--------------------RUTAS Plantillas-----------------------
// Ruta para la página de inicio
app.get("/", verifyToken, (req, res) => {
	// Renderizar la plantilla 'index'
	res.render("index");
});

// Ruta para la página de inicio de sesión
app.get("/login", (req, res) => {
	// Renderizar la plantilla 'login'
	res.render("login");
});

// Ruta para la página de registro
app.get("/register", (req, res) => {
	// Renderizar la plantilla 'login'
	res.render("register");
});

//--------------------RUTAS API-----------------------
// Ruta para manejar el registro de usuarios
app.post("/API/register", async (req, res) => {
	// Recuperar la información del usuario desde el cuerpo de la solicitud
	const { nombre, edad, correo, intereses, usuario, contrasena, direccion } =
		req.body;

	// Validar que los datos proporcionados no estén vacíos
	if (
		!nombre ||
		!edad ||
		!correo ||
		!intereses ||
		!usuario ||
		!contrasena ||
		!direccion
	) {
		return res.status(400).render("register", {
			error: "Por favor, completa todos los campos.",
		});
	}

	// Crear un nuevo documento Usuario
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
		// Guardar el nuevo usuario en la base de datos
		await nuevoUsuario.save();

		// Crear un token JWT
		const token = jwt.sign(
			{ id: nuevoUsuario._id },
			process.env.JWT_SECRET,
			{
				expiresIn: 86400, // expires in 24 hours
			}
		);

		// Enviar el token en una cookie
		res.cookie("token", token, { httpOnly: true });

		// Renderizar la página de inicio con el nombre de usuario
		res.status(200).render("index", { usuario: nombre });
	} catch (err) {
		// Si ocurre un error, enviar una respuesta de "Error interno del servidor"
		res.status(500).render("register", {
			error: "Hubo un problema al registrar el usuario.",
		});
	}
});

// Ruta para manejar el inicio de sesión
app.post("/API/login", async (req, res) => {
	let user = req.body.user;
	let pass = req.body.pass;

	if (user && pass) {
		// Buscar un usuario que coincida con el nombre de usuario y la contraseña proporcionados
		const usuario = await Usuario.findOne({
			usuario: user,
			contrasena: pass,
		});

		if (usuario) {
			// Si se encuentra un usuario, crear un token JWT
			const token = jwt.sign(
				{ id: usuario._id },
				process.env.JWT_SECRET,
				{
					expiresIn: 86400, // expires in 24 hours
				}
			);

			// Enviar el token en una cookie
			res.cookie("token", token, { httpOnly: true });

			// Renderizar la página de inicio con el nombre de usuario
			res.status(200).render("index", { usuario: user });
		} else {
			// Si no se encuentra un usuario, renderizar la página de inicio de sesión con un mensaje de error
			res.render("login", {
				fallido: "Usuario o contraseña incorrectos.",
			});
		}
	} else {
		// Si no se proporcionaron el nombre de usuario y la contraseña, renderizar la página de inicio de sesión
		res.render("login");
	}
});

// Iniciar el servidor en el puerto especificado o en el puerto 3000 si no se proporciona
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	// Registrar en la consola que el servidor está en ejecución
	console.log(`Server is running on port ${PORT}`);
});
