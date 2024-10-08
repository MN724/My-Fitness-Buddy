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

type fitnessPlanObject = {
  fitness_plan_name: string,
  fitness_plan_desc: string,
  start_date: string,
  end_date: string,
  days: Array<workoutDayObject>
}

function getDailyWorkout(fitnessPlan: fitnessPlanObject) {

  const fullStartDate = fitnessPlan.start_date
  const fitnessPlanDays = fitnessPlan.days

  const currentDate = new Date();
  const startDate = new Date(fullStartDate)

  const timeDifference = currentDate.getTime() - startDate.getTime()
  const dayDifference = Math.floor(timeDifference / (1000 * 3600 * 24))

  let startDayOfWeek = 0
  if (startDate.getDay() === 0) {
    startDayOfWeek = 6
  } else {
    startDayOfWeek = startDate.getDay() - 1
  }

  const dailyWorkout = fitnessPlanDays[dayDifference + startDayOfWeek]

  return dailyWorkout
}

export default getDailyWorkout