import requests
import rapidApiKey

url = "https://exercisedb.p.rapidapi.com/exercises/equipmentList"

headers = {
  "x-rapidapi-key": rapidApiKey.key,
  "x-rapidapi-host": "exercisedb.p.rapidapi.com"
}

response = requests.get(url, headers=headers)

# Store JSON data in API_Data
API_Data = response.json()

f = open('API_dump_equipment.txt', 'w')

# Print json data using loop
for item in API_Data:
    f.write(item + '\n')

f.close()
