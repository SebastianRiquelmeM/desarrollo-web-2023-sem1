console.log(
	"Hola mundo! desde archivo script.js que se ejecuta en el navegador"
);

// Función para sumar 1 al hacer clic en el botón "Sumar"
function sumar() {
	const conteoElement = document.getElementById("conteo");
	let conteo = parseInt(conteoElement.textContent);
	conteo += 1;
	conteoElement.textContent = conteo;
}

fetch("/users") // Realiza una solicitud GET a la ruta "/users"
	.then((response) => response.json()) // Parsea la respuesta a formato JSON
	.then((data) => {
		// Aquí puedes trabajar con los datos de la API
		console.log(data); // Por ejemplo, muestra los datos en la consola
	})
	.catch((error) => {
		console.error("Error:", error);
	});

fetch("/users") // Realiza una solicitud GET a la ruta "/users"
	.then((response) => response.json()) // Parsea la respuesta a formato JSON
	.then((data) => {
		// Crea la tabla
		const table = document.createElement("table");

		// Crea el encabezado de la tabla
		const thead = document.createElement("thead");
		const headerRow = document.createElement("tr");
		const idHeader = document.createElement("th");
		idHeader.textContent = "ID";
		const nameHeader = document.createElement("th");
		nameHeader.textContent = "Nombre";
		headerRow.appendChild(idHeader);
		headerRow.appendChild(nameHeader);
		thead.appendChild(headerRow);
		table.appendChild(thead);

		// Crea el cuerpo de la tabla con los datos de los usuarios
		const tbody = document.createElement("tbody");
		data.forEach((user) => {
			const userRow = document.createElement("tr");
			const idCell = document.createElement("td");
			idCell.textContent = user.id;
			const nameCell = document.createElement("td");
			nameCell.textContent = user.name;
			userRow.appendChild(idCell);
			userRow.appendChild(nameCell);
			tbody.appendChild(userRow);
		});
		table.appendChild(tbody);

		// Agrega la tabla al elemento con el id "tabla_usuarios"
		const tablaUsuarios = document.getElementById("tabla_usuarios");
		tablaUsuarios.appendChild(table);
	})
	.catch((error) => {
		console.error("Error:", error);
	});

// Función para eliminar un usuario
function eliminar() {
	const parrafoElement = document.getElementById("Parrafo");
	parrafoElement.remove();
}
