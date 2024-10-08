import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { commonStyles } from '../../constants/commonStyles';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { useSession } from '../../ctx';
import Modal from 'react-native-modal';

// Define the types for Exercise and Set
type Exercise = {
  name: string;
  sets: Set[];
  description: string;
  bodyPart: string;
  target: string;
  equipment: string;
};


type Set = {
  set: string;
  lbs: string;
  reps: string;
  done: boolean;
  type: 'Normal Set' | 'Warm-up Set';
};

export default function LoggingPage() {
  const router = useRouter();
  const { selectedExercise, updatedExercises, exercise_name, exercise_desc, body_part, target, equipment } = useLocalSearchParams();
  const { uid, token } = useSession();

  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [planDayId, setPlanDayId] = useState<string | null>(null);

  // Updated useState hooks with proper types
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseDetails, setSelectedExerciseDetails] = useState<Exercise | null>(null);

  // State variables to manage visibility of different modals
  const [isFinishModalVisible, setFinishModalVisible] = useState<boolean>(false);
  const [isDiscardModalVisible, setDiscardModalVisible] = useState<boolean>(false);
  const [isSurveyVisible, setSurveyVisible] = useState<boolean>(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [isOptionsModalVisible, setOptionsModalVisible] = useState<boolean>(false);
  const [isInfoModalVisible, setInfoModalVisible] = useState<boolean>(false);

  // State to manage the exercise to delete and type of set being edited.
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);
  const [exerciseToEdit, setExerciseToEdit] = useState<number | null>(null);  // Manage the selected exercise for options
  const [isSetTypeModalVisible, setSetTypeModalVisible] = useState<boolean>(false);
  const [setTypeToEdit, setSetTypeToEdit] = useState<{ exerciseIndex: number; setIndex: number } | null>(null);

  // State to manage the workout difficulty and timer
  const [difficulty, setDifficulty] = useState<string>('skip');
  const [timer, setTimer] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Check if there are updated exercises passed back from reorder page
  useEffect(() => {
    if (updatedExercises) {
        const exercisesString = Array.isArray(updatedExercises) ? updatedExercises.join('') : updatedExercises;
        setExercises(JSON.parse(exercisesString));
    }
  }, [updatedExercises]);

  useEffect(() => {
    if (exercise_name && exercise_desc && body_part && target && equipment) {
      const newExercise = {
        name: exercise_name,
        sets: [{ set: '1', lbs: '', reps: '', done: false, type: 'Normal Set' }],
        description: exercise_desc, // Add description
        bodyPart: body_part,        // Add body part
        target: target,             // Add target
        equipment: equipment,       // Add equipment
      };
  
      setExercises((prevExercises) => [...prevExercises, newExercise]);
    }
  }, [exercise_name, exercise_desc, body_part, target, equipment]);
  


  // Managing the timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Use useFocusEffect to resume the timer when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setIsRunning(true); // Start the timer when the screen is focused
      return () => {
        setIsRunning(false); // Stop the timer when the screen is unfocused
      };
    }, [])
  );

  // Format time as MM:SS
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Fetch planDayId from the backend
  const fetchPlanDayId = async () => {
    try {
      // TODO: get correct link
        const response = await fetch(`http://127.0.0.1:8000/planday/get_id/${uid}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            setPlanDayId(data.plan_day_id);  // Save it to a state
        } else {
            const errorData = await response.json();
            console.error(errorData);
        }
    } catch (error) {
        console.error(error);
    }
  };

  // Function to request a new workout_id from the backend
  const createWorkoutId = async () => {
    if (!planDayId) {
        console.error("Plan Day ID is not set");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/workouts/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                user_id: uid,
                plan_day_id: planDayId,  // Use the fetched plan_day_id here
                completed_date: new Date().toISOString(),
            }),
        });

        if (response.ok) {
            const data = await response.json();
            setWorkoutId(data.workout_history_id);
        } else {
            const errorData = await response.json();
            console.error(errorData);
        }
    } catch (error) {
        console.error(error);
    }
  };

  // Fetch planDayId first then createWorkoutId
  useEffect(() => {
    fetchPlanDayId();
  }, []);

  useEffect(() => {
    if (planDayId) {
        createWorkoutId();
    }
  }, [planDayId]);

  // Function to retrieve exercise_id based on exercise name from the database
  const getExerciseIdFromDB = async (exerciseName: string): Promise<number | null> => {
    try {
        const response = await fetch(`http://127.0.0.1:8000/exercises/get_id/${exerciseName}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.exercise_id || null;
        } else {
            const errorData = await response.json();
            console.error(errorData);
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
  };

  // Function to add a new set to an exercise
  const addSet = (exerciseIndex: number): void => {
    setExercises((prevExercises) => {
      const newExercises = [...prevExercises];
      
      const normalSetCount = newExercises[exerciseIndex].sets.filter(set => set.type === 'Normal Set').length;
      
      const newSet: Set = {
        set: (normalSetCount + 1).toString(),
        lbs: '',
        reps: '',
        done: false,
        type: 'Normal Set',
      };

      newExercises[exerciseIndex].sets.push(newSet);
      return newExercises;
    });
  };

  // Handling exercises
  useEffect(() => {
    if (selectedExercise) {
        const exerciseName = Array.isArray(selectedExercise) ? selectedExercise.join(' ') : selectedExercise;

        setExercises((prevExercises) => [
            ...prevExercises,
            { name: exerciseName, sets: [{ set: '1', lbs: '', reps: '', done: false, type: 'Normal Set' }] },
        ]);

        router.replace('/logging');  // Navigate back to logging page without params
    }
  }, [selectedExercise]);
  
  // Function to calculate the total volume of all completed sets
  const calculateTotalVolume = (): number => {
    return exercises.reduce((total, exercise) => {
      const exerciseVolume = exercise.sets.reduce((exerciseTotal, set) => {
        if (set.done) {
          const lbs = parseFloat(set.lbs) || 0;
          const reps = parseFloat(set.reps) || 0;
          return exerciseTotal + lbs * reps;
        }
        return exerciseTotal;
      }, 0);
      return total + exerciseVolume;
    }, 0);
  };

  // Function to finish the workout and open the finish modal.
  const finishWorkout = (): void => {
    setFinishModalVisible(true);
  };

  // Function to confirm finishing the workout & open the survey modal.
  const confirmFinishWorkout = (): void => {
    setFinishModalVisible(false);  // Close the finish confirmation modal
    setSurveyVisible(true);         // Open the survey modal
  };
  
  // Handling the survey submission
  const handleSurveySubmit = async (): Promise<void> => {
    try {
        setIsRunning(false);

        if (!workoutId) {
            console.error("Workout ID is not set");
            return;
        }

        const workoutData = {
            workout_id: workoutId,
            exercises: await Promise.all(exercises.map(async (exercise) => {
                const exerciseId = await getExerciseIdFromDB(exercise.name);
                return {
                    exercise_id: exerciseId,
                    sets: exercise.sets.map(set => ({
                        exercise_set: parseInt(set.set),
                        exercise_weight: parseFloat(set.lbs) || 0,
                        exercise_rep: parseInt(set.reps) || 0,
                    })),
                };
            })),
        };

        // TODO: Find the correct link
        const response = await fetch('http://127.0.0.1:8000/workouts/log/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(workoutData),
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log(responseData);
            setExercises([]);
            setTimer(0);
            router.replace('/dashboard');
        } else {
            const errorData = await response.json();
            console.error(errorData);
        }
    } catch (error) {
        console.error(error);
    }
  };


  // Function to open the discard modal
  const discardWorkout = (): void => {
    setDiscardModalVisible(true);
  };

  // Function to confirm discarding the workout and reset the state.
  const confirmDiscardWorkout = (): void => {
    // Reset the timer and other states
    setIsRunning(false);
    setTimer(0);
    setExercises([]);
    setDifficulty('skip');
    setDiscardModalVisible(false);
  
    // Go back to the dashboard
    router.push('/dashboard');
  };

  // Function to open the options modal for an exercise
  const openOptionsModal = (exerciseIndex: number): void => {
    setExerciseToEdit(exerciseIndex);
    setOptionsModalVisible(true);
  };

  // Function to navigate to the reorder page
  const navigateToReorderPage = (): void => {
    setOptionsModalVisible(false);
    router.push({
      pathname: '/reorder',
      params: {
        exercises: JSON.stringify(exercises),
      },
    });
  };

  // Function to open the delete exercise confirmation modal
  const openDeleteConfirmation = (): void => {
    setExerciseToDelete(exerciseToEdit);
    setDeleteModalVisible(true);
    setOptionsModalVisible(false);
  };

  const openInfoModal = (): void => {
    if (exerciseToEdit !== null) {
      const selectedExercise = exercises[exerciseToEdit];
      setSelectedExerciseDetails(selectedExercise);
      setInfoModalVisible(true);
      setOptionsModalVisible(false);
    }
  };

  const closeInfoModal = (): void => {
    setInfoModalVisible(false);
  };

  // Function to render the set button
  const renderSetButton = (exerciseIndex: number, setIndex: number) => {
    const set = exercises[exerciseIndex].sets[setIndex];
  
    return (
      <View style={styles.setRow} key={`${exerciseIndex}-${setIndex}`}>
        <TouchableOpacity
          onPress={() => deleteSet(exerciseIndex, setIndex)}
        >
          <Ionicons name="trash" size={24} color="red" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.setButton}
          onPress={() => handleSetTypeChange(exerciseIndex, setIndex)}
        >
          <Text style={styles.setButtonText}>{set.set}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.setInput}
          value={set.lbs}
          onChangeText={(value) => {
            if (/^\d*\.?\d*$/.test(value)) {
              updateSet(exerciseIndex, setIndex, 'lbs', value);
            }
          }}
          keyboardType="numeric"
          placeholder="0.0"
        />
        <TextInput
          style={styles.setInput}
          value={set.reps}
          onChangeText={(value) => {
            if (/^\d+$/.test(value) || value === '') {
              updateSet(exerciseIndex, setIndex, 'reps', value);
            }
          }}
          keyboardType="numeric"
          placeholder="0"
        />
      </View>
    );
  };

  // Function to update the weight or reps in a set
  const updateSet = (exerciseIndex: number, setIndex: number, field: 'lbs' | 'reps', value: string): void => {
    setExercises((prevExercises) => {
      const newExercises = [...prevExercises];
      newExercises[exerciseIndex].sets[setIndex][field] = value;
      return newExercises;
    });
  };

  // Function to handle the deletion of an exercise
  const handleDeleteExercisePress = (index: number): void => {
    setExerciseToDelete(index);
    setDeleteModalVisible(true);
  };

  // Function to confirm the deletion of an exercise
  const confirmDeleteExercise = (): void => {
    setExercises((prevExercises) => prevExercises.filter((_, i) => i !== exerciseToDelete));
    setDeleteModalVisible(false);
    setExerciseToDelete(null);
  };

  // Function to delete an individual set in an exercise
  const deleteSet = (exerciseIndex: number, setIndex: number): void => {
    setExercises((prevExercises) => {
      const newExercises = [...prevExercises];
      newExercises[exerciseIndex].sets.splice(setIndex, 1);
  
      // Recalculate set numbers after deletion
      let normalSetCounter = 1;
      newExercises[exerciseIndex].sets.forEach((set) => {
        if (set.type === 'Normal Set') {
          set.set = normalSetCounter.toString();
          normalSetCounter++;
        }
      });
  
      return newExercises;
    });
  };
  

  // Function to toggle "done" for a set
  const toggleDone = (exerciseIndex: number, setIndex: number): void => {
    setExercises((prevExercises) => {
      const newExercises = [...prevExercises];
      newExercises[exerciseIndex].sets[setIndex].done = !newExercises[exerciseIndex].sets[setIndex].done;
      return newExercises;
    });
  };

  // Function to toggle the set type and recalculate the set numbers.
  const handleSetTypeChange = (exerciseIndex: number, setIndex: number): void => {
    setExercises((prevExercises) => {
      const newExercises = [...prevExercises];
      const sets = newExercises[exerciseIndex].sets;

      // Toggle the type of the selected set
      if (sets[setIndex].type === 'Normal Set') {
        sets[setIndex].type = 'Warm-up Set';
        sets[setIndex].set = 'Warm-up';
      } else {
        sets[setIndex].type = 'Normal Set';
      }

      // Recalculate the set numbers for all Normal Sets after this change
      let normalSetCounter = 1;
      sets.forEach((set) => {
        if (set.type === 'Normal Set') {
          set.set = normalSetCounter.toString();
          normalSetCounter++;
        } else if (set.type === 'Warm-up Set') {
          set.set = 'Warm-up';
        }
      });

      return newExercises;
    });
  };

  // Function to open the modal to change the set type
  const openSetTypeModal = (exerciseIndex: number, setIndex: number): void => {
    setSetTypeToEdit({ exerciseIndex, setIndex });
    setSetTypeModalVisible(true);
  };

  // Function to set the type of a set (Normal Set or Warm-up)
  const setSetType = (type: 'Warm-up Set' | 'Normal Set'): void => {
    if (setTypeToEdit) {
      const { exerciseIndex, setIndex } = setTypeToEdit;

      setExercises((prevExercises) => {
        const newExercises = [...prevExercises];
        const set = newExercises[exerciseIndex].sets[setIndex];

        if (type === 'Warm-up Set') {
          set.type = 'Warm-up Set';
          set.set = 'Warm-up';  
        } else if (type === 'Normal Set') {
          const normalSetCount = newExercises[exerciseIndex].sets.filter(s => s.type === 'Normal Set').length;
          set.type = 'Normal Set';
          set.set = (normalSetCount + 1).toString();  
        }

        return newExercises;
      });

      setSetTypeModalVisible(false);
      setSetTypeToEdit(null);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}> 
        <View style={commonStyles.header}>
          <Text style={commonStyles.headerText}>Logging Workout</Text>
          <TouchableOpacity style={commonStyles.iconRight}>
            <Ionicons name="person-circle-outline" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={commonStyles.iconRight}>
            <Ionicons name="log-out-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* Duration and Total Volume Section */}
        <View style={styles.durationVolumeContainer}>
          <View style={styles.durationVolumeSection}>
            <Text style={styles.durationVolumeText}>Duration</Text>
            <Text style={styles.durationVolumeText}>Total Volume</Text>
          </View>
          <View style={styles.durationVolumeSection}>
            <Text style={styles.durationVolumeText}>{formatTime(timer)}</Text>
            <Text style={styles.durationVolumeText}>{calculateTotalVolume()} lbs</Text>
          </View>
          <View style={styles.separatorLine} />
        </View>

        <View style={styles.exerciseList}>
          {exercises.map((exercise, exerciseIndex) => (
            <View key={`${exercise.name}-${exerciseIndex}`} style={styles.exerciseItem}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseText}>{exercise.name}</Text>
                <TouchableOpacity onPress={() => openOptionsModal(exerciseIndex)}>
                  <Ionicons name="menu" size={24} color="black" />
                </TouchableOpacity>
              </View>
              <View style={styles.tableContainer}>
                <View style={styles.tableLeft}>
                  <View style={styles.setHeader}>
                    <Text style={[styles.setText, styles.setTextSET]}>SET</Text>
                    <Text style={[styles.setText, styles.setTextLBS]}>LBS</Text>
                    <Text style={[styles.setText, styles.setTextREPS]}>REPS</Text>
                  </View>
                  {exercise.sets.map((set, setIndex) => renderSetButton(exerciseIndex, setIndex))}
                </View>
                <View style={styles.tableRight}>
                  <Text style={styles.doneText}>DONE</Text>
                  {exercise.sets.map((set, setIndex) => (
                    <TouchableOpacity
                      key={`${exercise.name}-${setIndex}`}
                      onPress={() => toggleDone(exerciseIndex, setIndex)}
                      style={styles.checkmarkContainer}
                    >
                      <Ionicons
                        name={set.done ? "checkmark-circle" : "ellipse-outline"}
                        size={24}
                        color="black"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={styles.addSetButton}
                onPress={() => addSet(exerciseIndex)}
              >
                <Text style={styles.addSetButtonText}>+ Add Set</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>


        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/exercises')}>
          <Text style={styles.addButtonText}>+ Add Exercise</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.finishButton} onPress={finishWorkout}>
            <Text style={styles.buttonText}>Finish Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.discardButton} onPress={discardWorkout}>
            <Text style={styles.buttonText}>Discard Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Finish Workout Modal */}
        <Modal
          visible={isFinishModalVisible}
          onRequestClose={() => setFinishModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you are finished with this workout?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={confirmFinishWorkout}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setFinishModalVisible(false)}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Survey Modal */}
        <Modal
          visible={isSurveyVisible}
          onRequestClose={() => setSurveyVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>How would you rate the difficulty of this workout?</Text>
            <TouchableOpacity
              style={[styles.surveyOption, difficulty === 'skip' && styles.selectedOption]}
              onPress={() => setDifficulty('skip')}
            >
              <Text style={styles.surveyOptionText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.surveyOption, difficulty === 'easy' && styles.selectedOption]}
              onPress={() => setDifficulty('easy')}
            >
              <Text style={styles.surveyOptionText}>Easy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.surveyOption, difficulty === 'medium' && styles.selectedOption]}
              onPress={() => setDifficulty('medium')}
            >
              <Text style={styles.surveyOptionText}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.surveyOption, difficulty === 'hard' && styles.selectedOption]}
              onPress={() => setDifficulty('hard')}
            >
              <Text style={styles.surveyOptionText}>Hard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleSurveySubmit}>
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Discard Workout Modal */}
        <Modal
          visible={isDiscardModalVisible}
          onRequestClose={() => setDiscardModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to discard this workout? No data from this workout will be saved.</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={confirmDiscardWorkout}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setDiscardModalVisible(false)}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Delete Exercise Modal */}
        <Modal
          visible={isDeleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to remove this exercise?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={confirmDeleteExercise}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Set Type Modal */}
        <Modal
          visible={isSetTypeModalVisible}
          onRequestClose={() => setSetTypeModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Select Set Type</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setSetType('Warm-up Set')}>
              <Text style={styles.modalButtonText}>Warm-up Set</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setSetType('Normal Set')}>
              <Text style={styles.modalButtonText}>Normal Set</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Exercise Options Modal */}
        <Modal
          visible={isOptionsModalVisible}
          onRequestClose={() => setOptionsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={{ position: 'absolute', top: 10, right: 10 }}
              onPress={() => setOptionsModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalText}>Exercise Options</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={openInfoModal}>
                <Text style={styles.modalButtonText}>Information</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={navigateToReorderPage}>
                <Text style={styles.modalButtonText}>Reorder Exercises</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={openDeleteConfirmation}>
                <Text style={styles.modalButtonText}>Delete Exercise</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Info Modal */}
        <Modal
          visible={isInfoModalVisible}
          onRequestClose={closeInfoModal}
        >
          <View style={styles.modalContent}>
            {selectedExerciseDetails && (
              <>
                <Text style={styles.modalTitle}>{selectedExerciseDetails.name}</Text>
                <Text style={styles.modalDesc}>{exercise_desc}</Text>
                <Text style={styles.modalLabel}>Body Part:</Text>
                <Text style={styles.modalText}>{body_part}</Text> 
                <Text style={styles.modalLabel}>Target:</Text>
                <Text style={styles.modalText}>{target}</Text>
                <Text style={styles.modalLabel}>Equipment:</Text>
                <Text style={styles.modalText}>{equipment}</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeInfoModal}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  timerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  durationVolumeContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  durationVolumeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationVolumeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  separatorLine: {
    borderBottomColor: Colors.darkGray,
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseItem: {
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tableContainer: {
    flexDirection: 'row',
  },
  tableLeft: {
    flex: 4,
  },
  tableRight: {
    width: 80, // Fixed width for "DONE" column
    alignItems: 'center',
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
    alignItems: 'center',
  },
  setText: {
    fontWeight: 'bold',
    textAlign: 'center', 
    flex: 1,
    marginLeft: 50,
  },
  setTextSET: {
    marginLeft: 44, // Larger margin for "SET" to align with its larger input
  },
  setTextLBS: {
    marginLeft: 23, // Smaller margin for "LBS"
  },
  setTextREPS: {
    marginLeft: 3, // Smaller margin for "REPS"
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
    height: 30,
    alignItems: 'center',
  },
  setButton: {
    flex: 1.5,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingHorizontal: 5,
  },
  setButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'black',
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    height: 30,
    paddingHorizontal: 5,
    marginHorizontal: 5,
    textAlign: 'center', 
  },
  doneText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  checkmarkContainer: {
    flex: 1,
    height: 30, // Fixed height for checkmark container
    marginBottom: 5,
    justifyContent: 'center',
  },
  addSetButton: {
    backgroundColor: Colors.mediumGreen,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addSetButtonText: {
    color: 'white',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: Colors.mediumGreen,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    margin: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  finishButton: {
    backgroundColor: Colors.lightGreen,
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  discardButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2, 
    borderColor: 'black',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: Colors.lightGreen,
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '80%',
    alignItems: 'center',
  },
  
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
  surveyOption: {
    backgroundColor: Colors.lightGray,
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '80%',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: Colors.lightGreen,
  },
  surveyOptionText: {
    color: 'black',
    fontSize: 16,
  },
});
