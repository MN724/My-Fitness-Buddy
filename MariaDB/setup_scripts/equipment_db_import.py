import mysql.connector

db_config = {
    'user': 'myfitnessbuddy_admin',
    'password': 'cs467071824',
    'host': 'ec2-18-221-120-52.us-east-2.compute.amazonaws.com',
    'database': 'myfitnessbuddy'
}

# Start DB Connection
connection = mysql.connector.connect(**db_config)
cursor = connection.cursor()

# Parse & Dump
with open('API_dump_equipment.txt', 'r') as file:
    equipment_list = file.readlines()

insert_query = "INSERT INTO Equipment (equipment_name) VALUES (%s)"

for name in equipment_list:
    name = name.strip()
    cursor.execute(insert_query, (name,))

# Commit the transaction & Close connection
connection.commit()

cursor.close()
connection.close()
