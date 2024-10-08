import { StyleSheet } from 'react-native';
import { Colors } from './Colors'; // Importing Colors

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 100,
    backgroundColor: Colors.lightGreen,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerText: {
    flex: 1,
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
