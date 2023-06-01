import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import Usuario from "./models/usuario.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Conectar a la base de datos MongoDB utilizando la variable de entorno MONGODB_URI
mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Ruta de bienvenida
app.get("API/hola", (req, res) => {
	res.json({ message: "Bienvenido a la API de usuarios" });
});

// Función para verificar el token JWT
function verifyToken(req, res, next) {
	// Obtener el token de las cookies
	const token = req.cookies.token;

	// Si no hay token, enviar un error
	if (!token) return res.status(401).json({ error: "Access Denied" });

	// Verificar el token
	jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
		if (err)
			// Si el token no es válido, enviar un error
			return res.status(400).json({ error: "Invalid Token" });

		// Si el token es válido, establecer req.userId y continuar con la siguiente función
		req.userId = decoded.id;
		next();
	});
}

// Ruta para verificar si el usuario está autenticado
app.get("/API/authenticated", (req, res) => {
	console.log("req.cookies: ", req.cookies);
	const token = req.cookies.token;
	if (token) {
		jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
			if (err) {
				res.json({ authenticated: false });
			} else {
				res.json({ authenticated: true });
			}
		});
	} else {
		res.json({ authenticated: false });
	}
});

// Ruta para manejar el registro de usuarios
app.post("/API/register", async (req, res) => {
	// Recuperar la información del usuario desde el cuerpo de la solicitud
	const { usuario, contrasena } = req.body;

	// Validar que los datos proporcionados no estén vacíos
	if (!usuario || !contrasena) {
		return res.status(400).json({
			error: "Por favor, completa todos los campos.",
		});
	}

	// Crear un nuevo documento Usuario
	const nuevoUsuario = new Usuario({
		usuario,
		contrasena,
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

		// Enviar respuesta con el usuario registrado
		res.status(200).json({ usuario: usuario });
	} catch (err) {
		// Si ocurre un error, enviar una respuesta de "Error interno del servidor"
		res.status(500).json({
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
		const usuario = await Usuario.findOne({ usuario: user });
		if (usuario && usuario.contrasena === pass) {
			// Si se encuentra un usuario y la contraseña es correcta, crear un token JWT
			const token = jwt.sign(
				{ id: usuario._id },
				process.env.JWT_SECRET,
				{
					expiresIn: 86400, // expires in 24 hours
				}
			);

			// Enviar el token en una cookie
			res.cookie("token", token, { httpOnly: true });

			// Enviar respuesta con el usuario logueado
			res.status(200).json({ usuario: usuario.usuario });
		} else {
			// Si no se encuentra un usuario o la contraseña es incorrecta, enviar un mensaje de error
			res.status(400).json({
				error: "Usuario o contraseña incorrectos.",
			});
		}
	} else {
		// Si no se proporcionaron el nombre de usuario y la contraseña, enviar un mensaje de error
		res.status(400).json({
			error: "Por favor, proporciona un nombre de usuario y una contraseña.",
		});
	}
});

//------------------- Ruta que renderiza HTML -------------------------------

// Ruta para renderizar index.html
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public/html/index.html"));
});

app.get("/login", (req, res) => {
	res.sendFile(path.join(__dirname, "public/html/login.html"));
});

app.get("/register", (req, res) => {
	res.sendFile(path.join(__dirname, "public/html/register.html"));
});

// Iniciar el servidor
app.listen(PORT, () => {
	console.log(`Servidor Express en ejecución en el puerto ${PORT}`);
});
