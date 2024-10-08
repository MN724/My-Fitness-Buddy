import { Pressable, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useSession } from '../../../ctx';

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

function getWeeklyWorkout(fitnessPlan: fitnessPlanObject) {

  const fullStartDate = fitnessPlan.start_date
  const fitnessPlanDays = fitnessPlan.days

  const workouts = []
  const numberOfWeeks = Math.ceil(fitnessPlanDays.length / 7)
  let chunk = 7
  for (let i = 0; i < numberOfWeeks; i++) {
    workouts[i] = fitnessPlanDays.slice(i * chunk, (i + 1) * chunk);
  }

  const currentDate = new Date();
  const startDate = new Date(fullStartDate)

  const timeDifference = currentDate.getTime() - startDate.getTime()
  const dayDifference = Math.floor(timeDifference / (1000 * 3600 * 24))

  let currentDayOfWeek = 0
  if (currentDate.getDay() === 0) {
    currentDayOfWeek = 6
  } else {
    currentDayOfWeek = currentDate.getDay() - 1
  }

  let startDayOfWeek = 0
  if (startDate.getDay() === 0) {
    startDayOfWeek = 6
  } else {
    startDayOfWeek = startDate.getDay() - 1
  }

  let weeklyWorkout: workoutWeekArray
  if (dayDifference < 7 && currentDayOfWeek > startDayOfWeek) {
    weeklyWorkout = workouts[0]
  } else if (currentDayOfWeek > startDayOfWeek) {
    weeklyWorkout = workouts[Math.floor(dayDifference / 7)]
  } else {
    weeklyWorkout = workouts[Math.floor(dayDifference / 7) + 1]
  }

  return weeklyWorkout
}

export default getWeeklyWorkout
