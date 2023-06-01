document.querySelector("form").addEventListener("submit", function (event) {
	event.preventDefault();

	let user = document.getElementById("email").value;
	let pass = document.getElementById("password").value;

	fetch("/API/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ user: user, pass: pass }),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.error) {
				// Manejar el error de inicio de sesión aquí
				console.error(data.error);
			} else {
				// Redirigir al usuario a la página principal después de un inicio de sesión exitoso
				window.location.href = "/";
			}
		})
		.catch((error) => console.error("Error:", error));
});
