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


# Match Equipment listed in txt file to Equipment in Equipment table
def get_equipment_id(equipment_name):
    query = "SELECT equipment_id FROM Equipment WHERE equipment_name = %s"
    cursor.execute(query, (equipment_name,))
    result = cursor.fetchone()
    return result[0] if result else None


# Grab exercise name, description, body part, and equipment name from API_dump_exercises(bodyPart).txt
exercises = {}
with open('API_dump_exercises(bodyPart).txt', 'r') as file:
    for line in file:
        elements = line.strip().split('\t')
        if len(elements) == 4:  # error checking
            exercise_name, exercise_desc, body_part, equipment_name = elements
            exercises[exercise_name] = {
                'exercise_desc': exercise_desc,
                'body_part': body_part,
                'equipment_name': equipment_name
            }

# Grab corresponding target from second file
with open('API_dump_exercises(target).txt', 'r') as file:
    for line in file:
        elements = line.strip().split('\t')
        if len(elements) == 4:
            exercise_name, exercise_desc, target, equipment_name = elements
            exercises[exercise_name]['target'] = target

# Insert data into Exercises table
insert_query = ("INSERT INTO Exercises (exercise_name, exercise_desc, body_part, target, primary_equipment_id, "
                "equipment, difficulty_level) VALUES (%s, %s, %s, %s, %s, %s, %s)")


for exercise_name, data in exercises.items():
    primary_equipment_id = get_equipment_id(data['equipment_name'])

    cursor.execute(insert_query, (
        exercise_name,
        data['exercise_desc'],
        data['body_part'],
        data['target'],
        primary_equipment_id,
        data['equipment_name'],
        None  # Don't have diff level from files so setting to null
    ))

# Commit & Close connection
connection.commit()

cursor.close()
connection.close()
