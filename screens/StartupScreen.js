import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StartupScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>

      {/* Image section */}
      <View style={styles.imageContainer}>
        <Image
          source={require('./images/watch.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.circularButtonContainer}
          onPress={() => console.log("Heart Rate Pressed")}
        >
          <View style={[styles.circularButton, { backgroundColor: '#CF9FFF' }]}>
            <Image source={require('./images/heartrate2.png')} style={styles.icon} />
          </View>
          <Text style={[styles.buttonText, { color: 'white' }]}>Heart Rate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circularButtonContainer}
          onPress={() => console.log("Sound Pressed")}
        >
          <View style={[styles.circularButton, { backgroundColor: '#89CFF0' }]}>
            <Image source={require('./images/sound.png')} style={styles.icon} />
          </View>
          <Text style={[styles.buttonText, { color: 'white' }]}>Sound</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circularButtonContainer}
          onPress={() => console.log("Record Pressed")}
        >
          <View style={[styles.circularButton, { backgroundColor: '#FCDF78' }]}>
            <Image source={require('./images/record.png')} style={styles.icon} />
          </View>
          <Text style={[styles.buttonText, { color: 'white' }]}>Record</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circularButtonContainer}
          onPress={() => console.log("Alert Pressed")}
        >
          <View style={[styles.circularButton, { backgroundColor: '#DF6660' }]}>
            <Image source={require('./images/alert.png')} style={styles.icon} />
          </View>
          <Text style={[styles.buttonText, { color: 'white' }]}>Alert</Text>
        </TouchableOpacity>
      </View>

      {/* Text section */}
      <View style={styles.textSection}>
        <Text style={styles.title}>KERALA Smart Watch</Text>
        <Text style={styles.subtitle}>A thoughtful companion that monitors both sound and heart rate, ensuring you stay connected to what matters most.</Text>
      </View>

      {/* Circular button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.circularButton} 
          onPress={() => navigation.navigate("Login")}
        >
          <Ionicons name="chevron-forward" size={24} color="#2C2F48" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C2F48', // Navy blue background
    justifyContent: 'space-between',
    padding: 30,
  },
  textSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#F4A9BD',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  circularButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F4A9BD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularButtonContainer: {
    alignItems: 'center',
  },
  imageContainer: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 350, // Adjust width
    height: 350, // Adjust height
  },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 50, // Space between image and buttons
  },
  icon: {
    width: 30, // Adjust the width of the icon
    height: 30, // Adjust the height of the icon
  },
  buttonText: {
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 5,
  },
});

export default StartupScreen;