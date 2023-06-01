window.onload = function () {
	fetch("/API/authenticated")
		.then((response) => response.json())
		.then((data) => {
			const menuItems = document.querySelectorAll(".nav-item");
			const loginButton = document.querySelector('a[href="/login"]');
			const registerButton = document.querySelector(
				'a[href="/register"]'
			);
			const container = document.querySelector(".container"); // Contenedor donde se agregarán las imágenes
			if (data.authenticated) {
				menuItems.forEach((item) => (item.style.display = "block"));
				loginButton.classList.add("d-none");
				registerButton.classList.add("d-none");

				// Crear elementos de imagen y agregarlos al contenedor
				const florkImage = document.createElement("img");
				florkImage.src = "../img/flork-gif.gif";
				container.appendChild(florkImage);

				const gatoImage = document.createElement("img");
				gatoImage.src = "../img/gato.gif";
				container.appendChild(gatoImage);
			} else {
				menuItems.forEach((item) => (item.style.display = "none"));
				loginButton.classList.remove("d-none");
				registerButton.classList.remove("d-none");
			}
		});
};

document.getElementById("logoutButton").addEventListener("click", function () {
	fetch("/API/logout")
		.then((response) => response.json())
		.then((data) => {
			console.log(data.message); // Logout successful
			window.location.href = "/"; // Redirige al usuario a la página principal
		});
});
