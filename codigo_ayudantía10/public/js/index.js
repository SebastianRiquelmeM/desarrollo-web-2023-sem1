window.onload = function () {
	fetch("/API/authenticated")
		.then((response) => response.json())
		.then((data) => {
			const menuItems = document.querySelectorAll(".nav-item");
			if (data.authenticated) {
				menuItems.forEach((item) => (item.style.display = "block"));
			} else {
				menuItems.forEach((item) => (item.style.display = "none"));
			}
		});
};
