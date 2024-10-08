import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { commonStyles } from '../../constants/commonStyles';
import { Colors } from '../../constants/Colors';

type Exercise = {
  name: string;
  sets: Set[];
};

type Set = {
  set: string;
  lbs: string;
  reps: string;
  done: boolean;
  type: 'Normal Set' | 'Warm-up Set';
};

export default function ReorderPage() {
  const router = useRouter();
  const { exercises: exercisesParam } = useLocalSearchParams();

  // State to manage exercises
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Sync exercises from params when the page loads or when exercisesParam changes
  useEffect(() => {
    if (exercisesParam) {
      setExercises(JSON.parse(exercisesParam as string));
    }
  }, [exercisesParam]);

  // Render each exercise item
  const renderItem = ({
    item,
    drag,
    isActive,
  }: {
    item: Exercise;
    drag: () => void;
    isActive: boolean;
  }) => {
    return (
      <TouchableOpacity
        style={[
          styles.exerciseItem,
          { backgroundColor: isActive ? Colors.lightGray : Colors.lightGray },
        ]}
        onLongPress={drag}
      >
        <Text style={styles.exerciseText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  // Handle the end of a drag action
  const handleDragEnd = ({ data }: { data: Exercise[] }) => {
    setExercises(data);
  };

  // Save the new order and navigate back to logging.tsx
  const handleSave = () => {
    router.push({
      pathname: '/logging',
      params: {
        updatedExercises: JSON.stringify(exercises),
      },
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={commonStyles.container}>
        <View style={commonStyles.header}>
          <Text style={commonStyles.headerText}>Reorder</Text>
        </View>

        {/* Draggable FlatList to reorder exercises */}
        <DraggableFlatList
          data={exercises}
          renderItem={renderItem}
          keyExtractor={(item: Exercise, index: number) => `draggable-item-${item.name}-${index}`}
          onDragEnd={handleDragEnd}
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Order</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  exerciseItem: {
    padding: 20,
    backgroundColor: Colors.lightGray,
    borderRadius: 10, // Making the corners rounded
    marginVertical: 2,
    shadowColor: '#000', // Adding shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3, // Adding elevation for Android
  },
  exerciseText: {
    fontSize: 18,
    color: 'black',
  },
  saveButton: {
    backgroundColor: Colors.mediumGreen,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    margin: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
