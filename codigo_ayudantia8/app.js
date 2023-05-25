import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

let users = [
	{ id: 1, name: "Pedro" },
	{ id: 2, name: "María" },
	{ id: 3, name: "Juan" },
	{ id: 4, name: "Camila" },
	{ id: 5, name: "Diego" },
	{ id: 6, name: "Valentina" },
];

// Ruta de bienvenida
app.get("/", (req, res) => {
	res.json({ message: "Bienvenido a la API de usuarios" });
});

// Ruta para obtener una lista de usuarios
app.get("/users", (req, res) => {
	res.json(users);
});

// Ruta para obtener los detalles de un usuario por ID
app.get("/users/:id", (req, res) => {
	const { id } = req.params;
	const user = users.find((user) => user.id === parseInt(id));

	if (!user) {
		res.status(404).json({ message: "Usuario no encontrado" });
	} else {
		res.json(user);
	}
});

// Ruta para crear un nuevo usuario
app.post("/users", (req, res) => {
	const user = req.body;

	users.push(user);

	res.status(201).json({ message: "Usuario creado exitosamente" });
});

// Ruta para actualizar los detalles de un usuario existente
app.put("/users/:id", (req, res) => {
	const { id } = req.params;
	const updatedUser = req.body;
	const index = users.findIndex((user) => user.id === parseInt(id));

	if (index === -1) {
		res.status(404).json({ message: "Usuario no encontrado" });
	} else {
		// Mantén el ID del usuario existente y actualiza el resto de los campos
		const newUserData = { id: users[index].id, name: updatedUser.name };
		users[index] = newUserData;
		res.json({ message: `Usuario con ID ${id} actualizado exitosamente` });
	}
});

// Ruta para eliminar un usuario por ID
app.delete("/users/:id", (req, res) => {
	const { id } = req.params;
	const index = users.findIndex((user) => user.id === parseInt(id));

	if (index === -1) {
		res.status(404).json({ message: "Usuario no encontrado" });
	} else {
		users.splice(index, 1);
		res.json({ message: `Usuario con ID ${id} eliminado exitosamente` });
	}
});

// Iniciar el servidor
app.listen(PORT, () => {
	console.log(`Servidor Express en ejecución en el puerto ${PORT}`);
});
