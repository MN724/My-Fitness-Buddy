import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../../ctx';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router'; // Import useRouter

const ExercisesPage: React.FC = () => {
  const { token } = useSession();
  const router = useRouter(); // Initialize useRouter
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState(66);
  const [pageInput, setPageInput] = useState(`${page}`);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, [page]);

  const fetchExercises = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://10.0.2.2:8000/users/exercises/?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises);
        setMaxPages(data.total_pages);
        setPageInput(`${page}`); // Update inputPage to reflect the current page
      } else {
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredExercises([]);
      setDropdownVisible(false);
    } else {
      const filtered = exercises.filter((exercise) =>
        exercise.exercise_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredExercises(filtered);
      setDropdownVisible(true);
    }
  };

  const handleExerciseSelect = (exercise) => {
    router.push({
      pathname: '/logging',
      params: {
        exercise_name: exercise.exercise_name,
        exercise_desc: exercise.exercise_desc,
        body_part: exercise.body_part,
        target: exercise.target,
        equipment: exercise.equipment,
      },
    });
  };
  

  const handleExercisePress = (exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const handlePageInputChange = (text) => {
    setPageInput(text);
  };

  const handleInputSubmit = () => {
    const pageNumber = parseInt(pageInput, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= maxPages) {
      setPage(pageNumber);
    } else {
      setPageInput(`${page}`); // Reset input if invalid
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      setPageInput(`${newPage}`);
    }
  };

  const handleNextPage = () => {
    if (page < maxPages) {
      const newPage = page + 1;
      setPage(newPage);
      setPageInput(`${newPage}`);
    }
  };

  const renderExerciseDetailsModal = () => (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedExercise && (
            <>
              <Text style={styles.modalTitle}>{selectedExercise.exercise_name}</Text>
              <View style={styles.separator} />
              <Text style={styles.modalDesc}>
                {'      '}{selectedExercise.exercise_desc}
              </Text>
              <View style={styles.leftAlignedTextContainer}>
                <Text style={styles.modalLabel}>Body Part:</Text>
                <Text style={styles.modalText}>{selectedExercise.body_part}</Text>

                <Text style={styles.modalLabel}>Target:</Text>
                <Text style={styles.modalText}>{selectedExercise.target}</Text>

                <Text style={styles.modalLabel}>Equipment:</Text>
                <Text style={styles.modalText}>{selectedExercise.equipment}</Text>
              </View>
            </>
          )}
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Exercises</Text>
        <TouchableOpacity style={styles.iconRight}>
          <Ionicons name="person-circle-outline" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconRight} onPress={() => console.log('Sign out')}>
          <Ionicons name="log-out-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="black" style={styles.searchIcon} />
        <TextInput
          placeholder="Search exercise"
          placeholderTextColor="black"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Add the Return to Workout button */}
      <TouchableOpacity
        style={styles.returnButton}
        onPress={() => router.push('/logging')}
      >
        <Text style={styles.returnButtonText}>Return to Workout</Text>
      </TouchableOpacity>

      {isDropdownVisible && filteredExercises.length > 0 && (
        <View style={styles.dropdownContainer}>
          <ScrollView>
            {filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.exercise_id.toString()}
                style={styles.dropdownItem}
                onPress={() => handleExerciseSelect(exercise)}
              >
                <Text style={styles.dropdownText}>{exercise.exercise_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.exerciseList}>
        {exercises.map((exercise) => (
          <View key={exercise.exercise_id.toString()} style={styles.exerciseContainer}>
            <TouchableOpacity onPress={() => handleExerciseSelect(exercise)}>
              <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleExercisePress(exercise)}>
              <Text style={styles.moreOptions}>•••</Text>
            </TouchableOpacity>
          </View>
        ))}
        {isLoading && <ActivityIndicator size="large" color={Colors.mediumGreen} />}
      </ScrollView>

      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={handlePrevPage}
          disabled={page <= 1}
        >
          {page > 1 && <Ionicons name="arrow-back" size={24} color="black" />}
        </TouchableOpacity>

        <View style={styles.pageNumberContainer}>
          <Text style={styles.pageText}>Page </Text>
          <TextInput
            style={styles.pageInput}
            value={pageInput}
            onChangeText={handlePageInputChange}
            onSubmitEditing={handleInputSubmit}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <Text style={styles.pageText}> of {maxPages}</Text>
        </View>

        <TouchableOpacity
          style={styles.arrowButton}
          onPress={handleNextPage}
          disabled={page >= maxPages}
        >
          {page < maxPages && <Ionicons name="arrow-forward" size={24} color="black" />}
        </TouchableOpacity>
      </View>


      {renderExerciseDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: Colors.mediumGreen,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  iconRight: {
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mediumGreen,
    paddingHorizontal: 10,
    borderRadius: 10,
    margin: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: 'black',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    zIndex: 1,
    maxHeight: 200,
    borderColor: Colors.darkGray,
    borderWidth: 1,
  },
  dropdownItem: {
    padding: 10,
    borderBottomColor: Colors.darkGray,
    borderBottomWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: 'black',
  },
  exerciseList: {
    padding: 20,
  },
  exerciseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkGray,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  moreOptions: {
    fontSize: 24,
    color: '#888',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  arrowButton: {
    padding: 10,
  },
  pageNumberContainer: {
    backgroundColor: Colors.lightGreen,
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageInput: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    minWidth: 30,
  },
  pageText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  modalDesc: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'left',
  },
  leftAlignedTextContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'left',
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: Colors.mediumGreen,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  returnButton: {
    backgroundColor: Colors.mediumGreen,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  returnButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
});

export default ExercisesPage;
