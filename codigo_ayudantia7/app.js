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
// Importa los modelos Cuenta y Transferencia
import { Cuenta } from "./models/cuenta.js";
import { Transferencia } from "./models/transferencia.js";

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
	// Renderizar la plantilla 'register'
	res.render("register");
});

// Ruta para la página de estado de cuenta
app.get("/cuenta", verifyToken, async (req, res) => {
	const cuenta = await Cuenta.findOne({ usuario_id: req.userId });

	if (cuenta) {
		// Encontrar todas las transferencias donde este usuario fue el emisor
		let transferenciasEmitidas = await Transferencia.find({
			emisor_id: req.userId,
		});

		// Encontrar todas las transferencias donde este usuario fue el receptor
		let transferenciasRecibidas = await Transferencia.find({
			receptor_id: req.userId,
		});

		// Convertir las transferencias a objetos normales
		transferenciasEmitidas = transferenciasEmitidas.map((transferencia) =>
			transferencia.toObject()
		);
		transferenciasRecibidas = transferenciasRecibidas.map((transferencia) =>
			transferencia.toObject()
		);

		// Fusionar las dos listas de transferencias
		const transferencias = transferenciasEmitidas.concat(
			transferenciasRecibidas
		);

		// Renderizar la página de estado de cuenta con los datos del saldo y las transferencias
		res.render("cuenta", { saldo: cuenta.saldo, transferencias });
	} else {
		res.status(404).render("cuenta", { error: "Cuenta no encontrada" });
	}
});

// Ruta para la página de transferencia
app.get("/transferencia", verifyToken, (req, res) => {
	// Renderizar la plantilla 'transferencia'
	res.render("transferencia");
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

// Ruta para obtener el saldo de la cuenta de un usuario
app.get("/API/cuenta/:id", verifyToken, async (req, res) => {
	const cuenta = await Cuenta.findOne({ usuario_id: req.params.id });
	if (cuenta) {
		res.render("cuenta", { saldo: cuenta.saldo });
	} else {
		res.status(404).render("cuenta", { error: "Cuenta no encontrada" });
	}
});

// Ruta para realizar una transferencia
app.post("/API/transferencia", verifyToken, async (req, res) => {
	const { emisor_id, receptor_id, monto, descripcion } = req.body; // incluir descripcion

	// Encontrar las cuentas del emisor y del receptor
	const cuentaEmisor = await Cuenta.findOne({ usuario_id: emisor_id });
	const cuentaReceptor = await Cuenta.findOne({ usuario_id: receptor_id });

	// Verificar si las cuentas existen y si el emisor tiene suficiente saldo
	if (!cuentaEmisor) {
		return res.status(404).render("transferencia", {
			error: "Cuenta del emisor no encontrada",
		});
	}
	if (!cuentaReceptor) {
		return res.status(404).render("transferencia", {
			error: "Cuenta del receptor no encontrada",
		});
	}
	if (cuentaEmisor.saldo < monto) {
		return res.status(400).render("transferencia", {
			error: "Saldo insuficiente en la cuenta del emisor",
		});
	}

	// Realizar la transferencia
	cuentaEmisor.saldo -= monto;
	cuentaReceptor.saldo += monto;
	await cuentaEmisor.save();
	await cuentaReceptor.save();

	// Crear un registro de la transferencia
	const transferencia = new Transferencia({
		emisor_id,
		receptor_id,
		monto,
		fecha: new Date(),
		descripcion, // Añadir descripcion
	});
	await transferencia.save();

	// Responder con éxito
	res.status(200).render("transferencia", {
		message: "Transferencia realizada con éxito",
	});
});

// Iniciar el servidor en el puerto especificado o en el puerto 3000 si no se proporciona
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	// Registrar en la consola que el servidor está en ejecución
	console.log(`Server is running on port ${PORT}`);
});
