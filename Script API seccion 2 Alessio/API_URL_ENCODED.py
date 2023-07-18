import requests
from urllib.parse import urlencode

def print_section_info(section_name):
    print("\n\n" + "-" * 50)
    print(f"Evaluando: {section_name}")
    print("-" * 50 + "\n")

def print_request_info(method, route, data=None):
    print(f"\nRealizando petición {method} a {route}")
    if data is not None:
        print(f"Datos de entrada: {urlencode(data)}")

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
headers = {'Content-Type': 'application/x-www-form-urlencoded'}

# Prueba POST /usuario para "seba"
print_section_info("POST /usuario para 'seba'")
data_seba = {
    "name": "sebas",
    "email": "s5@s.com",
    "password": "123"
}
print_request_info("POST", "/usuario", data_seba)
response = session.post(url + "/usuario", data=urlencode(data_seba), headers=headers)
print_result(response, "/usuario")

# Prueba POST /usuario para "juan"
print_section_info("POST /usuario para 'juan'")
data_juan = {
    "name": "juans",
    "email": "j5@j.com",
    "password": "123"
}
print_request_info("POST", "/usuario", data_juan)
response = session.post(url + "/usuario", data=urlencode(data_juan), headers=headers)
print_result(response, "/usuario")

# Prueba POST /usuario para "seba" (registro duplicado)
print_section_info("POST /usuario para 'seba' (registro duplicado)")
print_request_info("POST", "/usuario", data_seba)
response = session.post(url + "/usuario", data=urlencode(data_seba), headers=headers)
print_result(response, "/usuario")

# Prueba POST /ingresar para "seba"
print_section_info("POST /ingresar para 'seba'")
data = {
    "email": "s5@s.com",
    "password": "123"
}
print_request_info("POST", "/ingresar", data)
response = session.post(url + "/ingresar", data=urlencode(data), headers=headers)
print_result(response, "/ingresar")

# Prueba GET /usuario
print_section_info("GET /usuario")
print_request_info("GET", "/usuario")
response = session.get(url + "/usuario")
print_result(response, "/usuario")

# Prueba POST /recargar para "seba"
print_section_info("POST /recargar para 'seba'")
data = {
    "amount": 1000,
    "credit_card": "1234567890123456"
}
print_request_info("POST", "/recargar", data)
response = session.post(url + "/recargar", data=urlencode(data), headers=headers)
print_result(response, "/recargar")

# Prueba GET /movimientos para "seba"
print_section_info("GET /movimientos para 'seba'")
print_request_info("GET", "/movimientos")
response = session.get(url + "/movimientos")
print_result(response, "/movimientos")

# Prueba POST /retirar para "seba"
print_section_info("POST /retirar para 'seba'")
data = {
    "amount": 500,
    "credit_card": "1234567890123456"
}
print_request_info("POST", "/retirar", data)
response = session.post(url + "/retirar", data=urlencode(data), headers=headers)
print_result(response, "/retirar")

# Prueba POST /transferir desde "seba" a "juan"
print_section_info("POST /transferir desde 'seba' a 'juan'")
data = {
    "email": "j5@j.com",
    "amount": 500,
    "comment": "prueba"
}
print_request_info("POST", "/transferir", data)
response = session.post(url + "/transferir", data=urlencode(data), headers=headers)
print_result(response, "/transferir")

# Prueba POST /transferir sin fondos suficientes
print_section_info("POST /transferir sin fondos suficientes")
data = {
    "email": "j5@j.com",
    "amount": 10000,  # Cantidad superior a los fondos existentes
    "comment": "prueba"
}
print_request_info("POST", "/transferir", data)
response = session.post(url + "/transferir", data=urlencode(data), headers=headers)
print_result(response, "/transferir")

# Prueba POST /retirar sin fondos suficientes
print_section_info("POST /retirar sin fondos suficientes")
data = {
    "amount": 10000,  # Cantidad superior a los fondos existentes
    "credit_card": "1234567890123456"
}
print_request_info("POST", "/retirar", data)
response = session.post(url + "/retirar", data=urlencode(data), headers=headers)
print_result(response, "/retirar")
