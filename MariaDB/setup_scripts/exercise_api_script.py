import requests
import rapidApiKey

url = "https://exercisedb.p.rapidapi.com/exercises"

querystring = {"limit": "0", "offset": "0"}

headers = {
  "x-rapidapi-key": rapidApiKey.key,
  "x-rapidapi-host": "exercisedb.p.rapidapi.com"
}

response = requests.get(url, headers=headers, params=querystring)

# Store JSON data in API_Data
API_Data = response.json()


with open('API_dump_exercises(bodyPart).txt', 'w') as bp, \
  open('API_dump_exercises(target).txt', 'w') as t:

    # Print json data using loop
    for obj in API_Data:
        bp.write(obj['name'] + '\t')
        t.write(obj['name'] + '\t')

        for instruction in obj['instructions']:
            if instruction != obj['instructions'][0]:
                bp.write(' ')
                t.write(' ')
            bp.write(instruction)
            t.write(instruction)

        bp.write('\t')
        t.write('\t')

        # bp file only writes bodyPart and t file only writes target
        bp.write(obj['bodyPart'] + '\t')
        t.write(obj['target'] + '\t')

        bp.write(obj['equipment'] + '\n')
        t.write(obj['equipment'] + '\n')

bp.close()
t.close()
