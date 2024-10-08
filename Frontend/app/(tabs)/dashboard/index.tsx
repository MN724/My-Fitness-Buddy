import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Importing icons
import { useSession } from '../../../ctx';
import { commonStyles } from '../../../constants/commonStyles';
import { Colors } from '../../../constants/Colors'; // Importing colors
import { Link, Redirect } from 'expo-router';
import Survey from '../survey';
import getWeeklyWorkout from './getWeeklyWorkout';
import getDailyWorkout from './getDailyWorkout';
import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';

const coachImage = require('../../../assets/images/Coach-Joe-Profile-Picture.jpg');
// const avatarImage = require('../../../assets/avatars/blank_avatar.jpg')

const colors = {
  orange: '#FFA500', // Chest & Triceps day
  blue: '#0096FF', // Back & Biceps day
  red: '#EE4B2B', // Leg day
  purple: '#800080', // Cardio day
  lightGray: '#E3E3E3', // Section rectangle
  darkGray: '#BDBDBD', // Text bubble & Progress bar
  white: '#ffffff',
  black: '#000000',
};

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type ExercisePlan = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap; // Correcting icon type
  type: string;
  color: string;
};

type CheckedDays = {
  [key: string]: boolean;
};

type exerciseObject = {
  name: string,
  sets: number,
  reps: number,
  duration: number
}

type workoutDayObject = {
  day_of_week: string,
  exercises: Array<exerciseObject>
};

type workoutWeekArray = Array<workoutDayObject>

type fitnessPlanObject = {
  fitness_plan_name: string,
  fitness_plan_desc: string,
  start_date: string,
  end_date: string,
  days: Array<workoutDayObject>
}

interface workoutWeekObject {
  [key: string]: Array<exerciseObject>
}

const getCurrentDayIndex = (): number => {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
};

const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (month: number, year: number): number => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'
];

const Dashboard: React.FC = () => {
  // Set the month and year you want to test here
  // const [currentMonth, setCurrentMonth] = useState<number>(6); // January is 0, February is 1, etc.
  // const [currentYear, setCurrentYear] = useState<number>(2024);

  const [loading, setLoading] = useState(false)
  const [displayName, setDisplayName] = useState<string>("")
  const [avatar, setAvatar] = useState<string>("../../../assets/avatars/blank_avatar.jpg")
  const [fitnessPlan, setFitnessPlan] = useState<fitnessPlanObject>()
  const [weeklyWorkout, setWeeklyWorkout] = useState<workoutWeekArray>()
  const [dailyWorkout, setDailyWorkout] = useState<workoutDayObject>()
  const { signOut, token } = useSession();
  const USER_DETAILS_URL = 'http://127.0.0.1:8000/users/details/';

  useEffect(() => {
    // Gets the Fitness Plan from Django Endpoint before Dashboard Page is rendered
    const getFitnessPlan = async() => {
      // Sets Loading to true to render loading screen
      setLoading(true)
      try {
        // Fetch User Details from Django Endpoint
        const response = await fetch(USER_DETAILS_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        const responseData = await response.json();
        setDisplayName(await responseData.display_name)
        const avatarName = await responseData.avatar
        let avatarPath: string
        if (await avatarName) {
          setAvatar(avatarName.avatar_image_link)
        }
        const fitnessPlan: fitnessPlanObject = await responseData.fitness_plan
        // Set state variable fitnessPlan to contain the fitness plan
        setFitnessPlan(fitnessPlan)
        // Set state variable weeklyWorkout to contain the workouts for the week
        setWeeklyWorkout(getWeeklyWorkout(fitnessPlan))
        // Set state variable dailyWorkout to contain the workouts for the day
        setDailyWorkout(getDailyWorkout(fitnessPlan))
        // Sets Loading to false to render Dashboard Page
        setLoading(false)
        return avatarName
      } catch(error) {
        // Sets Loading to false to render Dashboard Page
        setLoading(false)
      }
    }
    // Call the async function to retrieve fitness plan details
    getFitnessPlan()

  }, [])

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [checkedDays, setCheckedDays] = useState<CheckedDays>({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  const handleExpandText = (): void => {
    setIsExpanded(!isExpanded);
  };

  const toggleCheckbox = (day: string): void => {
    setCheckedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const exercisePlan: { [key: string]: ExercisePlan } = {
    Monday: { icon: 'arm-flex-outline', type: 'Chest & Triceps | 1h', color: colors.orange },
    Tuesday: { icon: 'weight-lifter', type: 'Back & Biceps | 55m', color: colors.blue },
    Wednesday: { icon: 'run', type: 'Legs | 1h 10m', color: colors.red },
    Thursday: { icon: 'bike', type: 'Cardio | 30m', color: colors.purple },
    Friday: { icon: 'arm-flex-outline', type: 'Chest & Triceps | 1h', color: colors.orange },
    Saturday: { icon: 'weight-lifter', type: 'Back & Biceps | 55m', color: colors.blue },
    Sunday: { icon: 'run', type: 'Legs | 1h 10m', color: colors.red },
  };

  const createExerciseDict = (weeklyWorkout: workoutWeekArray) => {
    let dict: workoutWeekObject = {}
    weeklyWorkout.forEach(myFunction)

    function myFunction(value: workoutDayObject) {
      dict[value.day_of_week] = value.exercises
    }
    
  }




  const checkedCount: number = Object.values(checkedDays).filter(Boolean).length;
  const currentDayIndex = getCurrentDayIndex();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);

  const renderHeatMap = () => {
    let rows = [];

    for (let i = 0; i < daysOfWeek.length; i++) {
      let cols = [];
      cols.push(
        <View key={`day-${i}`} style={styles.dayLabel}>
          <Text>{daysOfWeek[i]}</Text>
        </View>
      );

      for (let j = 0; j < 6; j++) {
        const day = j * 7 + i - (firstDayOfMonth - 1);
        if (day > 0 && day <= daysInMonth) {
          cols.push(
            <View
              key={`day-${i}-${j}`}
              style={[
                styles.heatMapBox,
                day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() ? styles.currentDayOutline : null,
              ]}
            />
          );
        } else {
          cols.push(<View key={`day-${i}-${j}`} style={styles.emptyBox} />);
        }
      }

      rows.push(
        <View key={`row-${i}`} style={styles.heatMapRow}>
          {cols}
        </View>
      );
    }

    return rows;
  };

  const goToPreviousMonth = (): void => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = (): void => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToCurrentMonth = (): void => {
    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
  };

  const navigation = useNavigation();

  const handleQuickStart = () => {
    navigation.navigate('logging' as never); // Casting to resolve type error
  };

  return (
    <ScrollView style={commonStyles.container}>
      {loading ?
        <Text>Loading Dashboard...</Text> :
        <View>
          <View style={commonStyles.header}>
            <Text style={commonStyles.headerText}>Dashboard</Text>
            <TouchableOpacity style={commonStyles.iconRight}>
              <Ionicons name="person-circle-outline" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={commonStyles.iconRight} onPress={signOut}>
              <Ionicons name="log-out-outline" size={30} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <View style={styles.welcomeContainer}>
              <Image 
                style={styles.avatar}
                source={{uri: avatar}} />
              <Text style={styles.welcomeText}>Welcome, {displayName}!</Text>
            </View>
            <TouchableOpacity
              style={styles.fitnessSurveyButton}
              onPress={() => navigation.navigate('survey')}>
              <Text style={styles.fitnessSurveyText}>Create Fitness Plan</Text>
            </TouchableOpacity>

            {/* TO BE REMOVED - FOR DEVELOPMENT ONLY LOGS FITNESS PLAN, WEEKLY WORKOUTS, AND DAILY WORKOUTS TO BROWSER CONSOLE */}
            <TouchableOpacity style={styles.fitnessSurveyButton}
              onPress={() => {
                console.log(fitnessPlan)
                console.log(weeklyWorkout)
                console.log(dailyWorkout)
              }}
              >    
              <Text style={styles.fitnessSurveyText}>CONSOLE LOG FITNESS PLAN</Text>
            </TouchableOpacity>



            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.box}>
              <View style={styles.weekContainer}>
                {Object.values(checkedDays).map((checked, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dayBox,
                      checked ? styles.activeDay : styles.inactiveDay,
                      index === currentDayIndex ? styles.currentDay : null,
                    ]}
                  />
                ))}
              </View>
              <View style={styles.workoutInfo}>
                <View style={styles.workoutDetails}>
                  <MaterialCommunityIcons name="weight-lifter" size={24} color="black" />
                  <Text style={styles.workoutText}>Workout: {checkedCount}/7</Text>
                </View>
                <Text style={styles.hoursText}>
                  <Text style={styles.boldText}>0 hours</Text> this week
                </Text>
              </View>
              <Text style={styles.monthText}>{monthNames[currentMonth]} {currentYear}</Text>
              <View style={styles.heatMapContainer}>
                {renderHeatMap()}
              </View>
              <View style={styles.iconContainer}>
                <TouchableOpacity onPress={goToPreviousMonth} style={styles.navIcon}>
                  <MaterialCommunityIcons name="chevron-left" size={20} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={goToCurrentMonth} style={styles.navIcon}>
                  <MaterialCommunityIcons name="home" size={20} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={goToNextMonth} style={styles.navIcon}>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="black" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.quickStartButton} onPress={handleQuickStart}>
                <Text style={styles.quickStartText}>Quick Start Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plan</Text>
            <View style={styles.speechBubble}>
              <View style={styles.planContainer}>
                <View style={styles.imageContainer}>
                  <Image source={coachImage} style={styles.coachImage} />
                </View>
                <View style={styles.speechBox}>
                  <Text style={styles.speechBoxTitle}>Coach Joe</Text>
                  <TouchableOpacity onPress={handleExpandText}>
                    <Text style={styles.speechBoxContent} numberOfLines={isExpanded ? undefined : 1} ellipsizeMode="tail">
                      The overall goal you have chosen is general fitness, so this week's exercise is going to be a mixture of exercises. Remember, it is important to listen to your body and give it a break to avoid injuries! Enjoying the exercises and working at a doable pace allows you to build a routine you are more likely to stick to! If these workouts are too difficult you can adjust the overall plan or individual workout!
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.weekDaysContainer}>
              {weeklyWorkout?.map((workout) => (
                <View key={workout.day_of_week} style={styles.weekDayBox}>
                  <View style={[styles.leftColorBar]} />
                  <View style={styles.weekDayContent}>
                    <View style={styles.weekDayHeader}>
                      <Text style={styles.weekDayText}>{workout.day_of_week}</Text>
                      <TouchableOpacity onPress={() => toggleCheckbox(workout.day_of_week)} style={styles.checkbox}>
                        {checkedDays[workout.day_of_week] ? (
                          <MaterialCommunityIcons name="checkbox-marked" size={24} color={Colors.lightGreen} />
                        ) : (
                          <MaterialCommunityIcons name="checkbox-blank-outline" size={24} color="black" />
                        )}
                      </TouchableOpacity>
                    </View>
                    <FlatList 
                      data={workout.exercises}
                      renderItem={({item}) =>
                        <View style={styles.exerciseGroup}>
                          <Text style={styles.exerciseName}>{item.name}</Text>
                          <Text style={styles.exerciseInfo}>Sets: {item.sets}</Text>
                          <Text style={styles.exerciseInfo}>Reps: {item.reps}</Text>
                          <Text style={styles.exerciseInfo}>Duration: {item.duration}</Text>
                        </View>
                      }
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
          

          
        </View>
      }
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  box: {
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    padding: 15,
  },
  speechBubble: {
    backgroundColor: colors.darkGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dayBox: {
    flex: 1,
    height: 10,
    marginHorizontal: 2,
  },
  activeDay: {
    backgroundColor: Colors.lightGreen,
  },
  inactiveDay: {
    backgroundColor: colors.darkGray,
  },
  currentDay: {
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
  },
  currentDayOutline: {
    borderWidth: 2,
    borderColor: colors.black,
  },
  workoutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutText: {
    marginLeft: 10,
    fontSize: 16,
  },
  hoursText: {
    fontSize: 16,
  },
  boldText: {
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.darkGreen,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  content: {
    fontSize: 16,
  },
  planContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items at the start to keep the icon at the top left corner
  },
  imageContainer: {
    width: 50,
    height: 50,
    overflow: 'hidden',
    borderRadius: 25,
    backgroundColor: '#ccc', // Fallback background color
  },
  coachImage: {
    width: 70,
    height: 70,
    marginLeft: -23, // Align to get face in the profile
    marginTop: 5, // Align to get face in the profile
    resizeMode: 'cover',
  },
  avatar: {
    width: 50,
    height: 50,
    margin: 20, // Align to get face in the profile
    resizeMode: 'cover',
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold"
  },
  speechBox: {
    flex: 1,
    marginLeft: 10,
  },
  speechBoxTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  speechBoxContent: {
    fontSize: 16,
  },
  weekDaysContainer: {
    marginTop: 20,
  },
  weekDayBox: {
    flexDirection: 'row',
    marginBottom: 10,
    width: '100%',
    marginVertical: 5, // Separate boxes
    borderRadius: 10,
    overflow: 'hidden', // Left color bar aligns with the box
    backgroundColor: colors.lightGray,
  },
  leftColorBar: {
    width: 15,
  },
  weekDayContent: {
    flex: 1,
    padding: 15,
  },
  weekDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  weekDayText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkbox: {
    marginRight: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    textTransform: 'capitalize'
  },
  exerciseIcon: {
    marginRight: 10,
  },
  exerciseType: {
    fontSize: 16,
  },
  heatMapContainer: {
    marginTop: 10,
    alignItems: 'center', // Center align the heatmap
  },
  heatMapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  heatMapBox: {
    width: 20,
    height: 20,
    backgroundColor: colors.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  emptyBox: {
    width: 20,
    height: 20,
    margin: 1,
  },
  dayLabel: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  navIcon: {
    backgroundColor: Colors.mediumGreen,
    marginHorizontal: 5,
    padding: 5,
    borderRadius: 5,
  },
  quickStartButton: {
    backgroundColor: Colors.darkGreen,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  quickStartText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  fitnessSurveyLink: {
    backgroundColor: colors.red,
    borderRadius: 10,
    margin: 20,
    textAlign: 'center'
  },
  fitnessSurveyButton: {
    backgroundColor: colors.red,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  fitnessSurveyText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  exerciseGroup: {
    margin: 5,
    marginStart: 10,
    textTransform: 'capitalize'
  },
  exerciseName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  exerciseInfo: {
    fontSize: 14
  }
});

export default Dashboard;
