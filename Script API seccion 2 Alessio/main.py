import requests
import json

def print_request_info(method, route, data=None):
    print(f"\nRealizando petición {method} a {route}")
    if data is not None:
        print(f"Datos de entrada: {json.dumps(data, indent=2)}")

def print_result(response, route):
    if response.status_code == 200:
        print(f"\033[92mÉxito en la ruta {route}\033[0m")
    else:
        print(f"\033[91mError en la ruta {route}\033[0m")
    print("Resultado: ", response.text)

# Pide la URL al usuario
url = input("Por favor, ingresa la URL de la API: ")

# Inicializa la sesión
session = requests.Session()

# Ejecuta las pruebas

## Prueba POST /usuario para "seba"
data_seba = {
    "name": "seba",
    "email": "s@s.com",
    "password": "123"
}
print_request_info("POST", "/usuario", data_seba)
response = session.post(url + "/usuario", json=data_seba)
print_result(response, "/usuario")

## Prueba POST /usuario para "juan"
data_juan = {
    "name": "juan",
    "email": "j@j.com",
    "password": "123"
}
print_request_info("POST", "/usuario", data_juan)
response = session.post(url + "/usuario", json=data_juan)
print_result(response, "/usuario")

## Prueba POST /ingresar para "seba"
data = {
    "email": "s@s.com",
    "password": "123"
}
print_request_info("POST", "/ingresar", data)
response = session.post(url + "/ingresar", json=data)
print_result(response, "/ingresar")

## Prueba POST /recargar para "seba"
data = {
    "amount": 1000,
    "credit_card": "1234567890123456"
}
print_request_info("POST", "/recargar", data)
response = session.post(url + "/recargar", json=data)
print_result(response, "/recargar")

## Prueba GET /movimientos para "seba"
print_request_info("GET", "/movimientos")
response = session.get(url + "/movimientos")
print_result(response, "/movimientos")

## Prueba POST /retirar para "seba"
data = {
    "amount": 500,
    "credit_card": "1234567890123456"
}
print_request_info("POST", "/retirar", data)
response = session.post(url + "/retirar", json=data)
print_result(response, "/retirar")

## Prueba POST /transferir desde "seba" a "juan"
data = {
    "email": "j@j.com",
    "amount": 500,
    "comment": "prueba"
}
print_request_info("POST", "/transferir", data)
response = session.post(url + "/transferir", json=data)
print_result(response, "/transferir")
