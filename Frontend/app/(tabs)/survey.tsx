import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Importing icons
import { commonStyles } from '../../constants/commonStyles'; // Importing commonStyles
import { useSession } from '../../ctx';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import Checkbox from 'expo-checkbox';
import { router } from 'expo-router';

const colors = {
  // Theme
  lightGreen: '#50C878',
  mediumGreen: '#3f9d5e',
  darkGreen: '#1d482b',

  // Other colors
  orange: '#FFA500', // Chest & Triceps day
  blue: '#0096FF', // Back & Biceps day
  red: '#EE4B2B', // Leg day
  purple: '#800080', // Cardio day
  lightGray: '#E3E3E3', // Section rectangle
  darkGray: '#BDBDBD', // Text bubble & Progress bar
  white: '#ffffff',
  black: '#000000'
}

const Survey: React.FC = () => {
  const { signOut, uid, token } = useSession();

  // Equipment objects for checkboxes
  const equipment = [
    {id: 1, name: 'assisted', isChecked: false},
    {id: 2, name: 'band', isChecked: false},
    {id: 3, name: 'barbell', isChecked: false},
    {id: 4, name: 'body weight', isChecked: false},
    {id: 5, name: 'bosu ball', isChecked: false},
    {id: 6, name: 'cable', isChecked: false},
    {id: 7, name: 'dumbbell', isChecked: false},
    {id: 8, name: 'elliptical machine', isChecked: false},
    {id: 9, name: 'ez barbell', isChecked: false},
    {id: 10, name: 'hammer', isChecked: false},
    {id: 11, name: 'kettlebell', isChecked: false},
    {id: 12, name: 'leverage machine', isChecked: false},
    {id: 13, name: 'medicine ball', isChecked: false},
    {id: 14, name: 'olympic barbell', isChecked: false},
    {id: 15, name: 'resistance band', isChecked: false},
    {id: 16, name: 'roller', isChecked: false},
    {id: 17, name: 'rope', isChecked: false},
    {id: 18, name: 'skierg machine', isChecked: false},
    {id: 19, name: 'sled machine', isChecked: false},
    {id: 20, name: 'smith machine', isChecked: false},
    {id: 21, name: 'stability ball', isChecked: false},
    {id: 22, name: 'stationary bike', isChecked: false},
    {id: 23, name: 'stepmill machine', isChecked: false},
    {id: 24, name: 'tire', isChecked: false},
    {id: 25, name: 'trap bar', isChecked: false},
    {id: 26, name: 'upper body ergometer', isChecked: false},
    {id: 27, name: 'weighted', isChecked: false},
    {id: 28, name: 'wheel roller', isChecked: false},
  ]

  // State variables for form fields
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectEquipment, setSelectEquipment] = useState(equipment);

  // Toggles isChecked value for equipment when checked/unchecked
  const handleChange = (id: number) => {
    let temp = selectEquipment.map((equipment) => {
      if (id === equipment.id) {
        return { ...equipment, isChecked: !equipment.isChecked}
      }
      return equipment
    })
    setSelectEquipment(temp)
  }

  // Filtered list containing equipment names only selected by the user
  let userEquipment = selectEquipment.filter((equipment) => equipment.isChecked).map((equipment) => equipment.name)
  console.log(userEquipment)

  // Django Endpoint for user survey POST request
  const SURVEY_URL = 'http://127.0.0.1:8000/users/survey/';

  // Sends results to Django Endpoint in json format
  async function sendResults() {
    // Prints json to console for debugging purposes
    console.log(
      JSON.stringify({
        uid: uid,
        goal: selectedGoal,
        type: selectedType,
        level: selectedLevel,
        equipment: userEquipment
    }))
    try {
      console.log(token)
      const response = await fetch(SURVEY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: uid,
          goal: selectedGoal,
          type: selectedType,
          level: selectedLevel,
          equipment: userEquipment
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
        router.replace('/dashboard')
      } else {
        const errorData = await response.json();
        console.log(errorData)
      }
    } catch(error) {
      console.log(error)
    }
  }

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={commonStyles.headerText}>Survey</Text>
        <TouchableOpacity style={commonStyles.iconRight}>
          <Ionicons name="person-circle-outline" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={commonStyles.iconRight} onPress={signOut}>
          <Ionicons name="log-out-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <Text>What are your fitness goals?</Text>
      <Picker
        selectedValue={selectedGoal}
        onValueChange={(itemValue, itemIndex) =>
          setSelectedGoal(itemValue)
        }>
        <Picker.Item label="" value="" />
        <Picker.Item label="Lose Weight" value="lose-weight" />
        <Picker.Item label="Get Stronger" value="get-stronger" />
        <Picker.Item label="Better Endurance" value="better-endurance" />
        <Picker.Item label="Build Muscle" value="build-muscle" />
        <Picker.Item label="Better Flexibility" value="better-flexibility" />
        <Picker.Item label="Not Sure" value="not-sure" />
      </Picker>

      <Text>What is your body type?</Text>
      <Picker
        selectedValue={selectedType}
        onValueChange={(itemValue, itemIndex) =>
          setSelectedType(itemValue)
        }>
        <Picker.Item label="" value="" />
        <Picker.Item label="Endomorph" value="endomorph" />
        <Picker.Item label="Mesomorph" value="mesomorph" />
        <Picker.Item label="Ectomorph" value="ectomorph" />
        <Picker.Item label="Not Sure" value="not-sure" />
      </Picker>

      <Text>What is your fitness level?</Text>
      <Picker
        selectedValue={selectedLevel}
        onValueChange={(itemValue, itemIndex) =>
          setSelectedLevel(itemValue)
        }>
        <Picker.Item label="" value="" />
        <Picker.Item label="Beginner" value="beginner" />
        <Picker.Item label="Intermediate" value="intermediate" />
        <Picker.Item label="Advanced" value="advanced" />
      </Picker>

      <Text>What equipment do you have available?</Text>
      {Object.entries(selectEquipment).map(([index, equipment]) => 
        <View key={equipment.id} style={styles.checkboxSection}>
          <Checkbox
            value={equipment.isChecked}
            onValueChange={() => handleChange(equipment.id)} />
          <Text>{equipment.name}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={sendResults}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    backgroundColor: colors.darkGreen,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 45,
    margin: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.lightGray,
    fontSize: 24,
    margin: 15,
    padding: 10,
    borderRadius: 10
  },
  bodyText: {
    fontSize: 16,
    margin: 15
  },
  title: {
    fontSize: 36,
    padding: 10,
    margin: 30,
    fontWeight: 'bold'
  },
  success: {
    color: 'green',
    fontSize: 16,
    margin: 15,
  },
  error: {
    color: 'red',
    fontSize: 16,
    margin: 15,
  },
  checkboxSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})

export default Survey;