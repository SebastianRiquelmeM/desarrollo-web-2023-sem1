import express from "express";
import { MongoClient, ObjectID } from "mongodb";
import bodyParser from "body-parser";

//=======DATABASE================
const uri =
	"mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.0";

const client = new MongoClient(uri);
const database = client.db("datos_db");

const app = express();

app.use(express.json());

//Para leer desde form HTML
app.use(bodyParser.urlencoded({ extended: false }));

//Renderiza login.handlebars en la ruta principal
app.get("/API/", (req, res) => {
	res.json({
		message: "Bienvenido a la API del proyecto de desarrollo web!",
	});
});
app.get("/API/user/:id", (req, res) => {
	const id = req.params.id;
	const collection = database.collection("usuarios");
	collection.find({ _id: ObjectID(id) }).toArray(function (err, result) {
		if (err) {
			console.log(err);
		} else {
			res.json({
				usuario: result[0],
			});
			return;
		}
	});
});

app.listen(3000, () => {
	console.log("Server express corriendo en puerto: 3000");
});
