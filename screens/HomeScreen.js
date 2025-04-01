import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, TextInput } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

// Initialize Supabase client
const supabaseUrl = 'https://pafntpcanmavljkxyerv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZm50cGNhbm1hdmxqa3h5ZXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1MDA5MDAsImV4cCI6MjA1MDA3NjkwMH0.GwUG6tDFxnYE5VhTOK1P8Yx8qxq696zrgvZXRgwagPM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const HomeScreen = ({ navigation, route }) => {
  const getCurrentWeekDates = () => {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const currentWeekDates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - currentDay + i);
      currentWeekDates.push(date.getDate().toString());
    }

    return { currentWeekDates, currentDay };
  };

  const { currentWeekDates, currentDay } = getCurrentWeekDates();
  const [reports, setReports] = useState([]);
  const [expandedItem, setExpandedItem] = useState(null);
  const [bpm, setBpm] = useState(0);
  const [db, setDb] = useState(0);
  const [latestReportId, setLatestReportId] = useState(null);
  const [comment, setComment] = useState('');

  const scaleValue = useState(new Animated.Value(1))[0];

  const [bpmThreshold, setBpmThreshold] = useState(null);
  const [dbThreshold, setDbThreshold] = useState(null);

  // Request notification permissions on component mount
  useEffect(() => {
    const requestNotificationPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'You need to enable notifications to receive alerts!');
      }
    };

    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (route.params?.bpmThreshold && route.params?.dbThreshold) {
      AsyncStorage.setItem('bpmThreshold', route.params.bpmThreshold.toString());
      AsyncStorage.setItem('dbThreshold', route.params.dbThreshold.toString());
    }
  }, [route.params?.bpmThreshold, route.params?.dbThreshold]);

  useFocusEffect(
    React.useCallback(() => {
      const loadThresholds = async () => {
        const savedBpmThreshold = await AsyncStorage.getItem('bpmThreshold');
        const savedDbThreshold = await AsyncStorage.getItem('dbThreshold');

        if (savedBpmThreshold) setBpmThreshold(parseInt(savedBpmThreshold));
        if (savedDbThreshold) setDbThreshold(parseInt(savedDbThreshold));
      };

      loadThresholds();
    }, [])
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, { toValue: 1.1, duration: 300, useNativeDriver: true }),
        Animated.timing(scaleValue, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchReports();
    }, 1000);

    return () => clearInterval(interval);
  }, [latestReportId]);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('READINGS2_duplicate')
      .select('*')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching data from Supabase:', error.message);
      return;
    }

    if (data.length > 0) {
      const newReport = data[0];

      setBpm(newReport.HEARTRATE);
      setDb(newReport.DECIBEL);

      if (newReport.HEARTRATE >= bpmThreshold && newReport.DECIBEL >= dbThreshold) {
        if (!reports.some((report) => report.id === newReport.id)) {
          setReports((prevReports) => [{ ...newReport, status: 'Pending' }, ...prevReports]);
          setLatestReportId(newReport.id);

          // Trigger local notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'New Alert!',
              body: `Heart Rate: ${newReport.HEARTRATE} bpm, Decibel: ${newReport.DECIBEL} db`,
            },
            trigger: null, // Trigger immediately
          });
        }
      }
    }
  };

  const handleStatusUpdate = async (report, status, comment) => {
    try {
      // Update the record in Supabase (only update symptom and comment columns)
      const { data, error } = await supabase
        .from('READINGS2_duplicate')
        .update({
          symptom: status === 'Sign of Symptom',
          comment: comment || null
        })
        .eq('id', report.id);

      if (error) {
        console.error('Error updating record:', error.message);
        return;
      }

      // Update the local state to reflect the new status
      const updatedReports = reports.map((rep) =>
        rep.id === report.id ? { 
          ...rep, 
          status,
          symptom: status === 'Sign of Symptom',
          comment: comment || null
        } : rep
      );
      
      setReports(updatedReports);
      setComment(''); // Clear the comment input after submission

      // Navigate to the Records screen with the updated reports
      navigation.navigate('Records', { reports: updatedReports });

    } catch (err) {
      console.error('Error in handleStatusUpdate:', err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.circleContainer}>
          <View style={styles.circle}>
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <FontAwesome name="heart" size={30} color="#DF6660" style={styles.heartIcon} />
            </Animated.View>
            <Text style={styles.numbpmText}>
              {bpm}
              {'\n'}
            </Text>
            <Text style={styles.bpmText}>bpm</Text>
          </View>
        </View>

        <View style={styles.circleContainer}>
          <View style={styles.circle}>
            <Text style={styles.dbText}>
              {db}
              {'\n'}db
            </Text>
          </View>
        </View>
      </View>

      {bpm >= bpmThreshold && db >= dbThreshold && (
        <View style={styles.detectionBox}>
          <Text style={styles.detectionText}>Loud sound and Increased Heart rate Detected</Text>
        </View>
      )}

      <View style={styles.dailyReport}>
        <Text style={styles.reportTitle}>Daily Report</Text>
        <View style={styles.daysRow}>
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => (
            <View key={index} style={[styles.dayBox, currentDay === index && styles.activeDay]}>
              <Text style={[styles.dayText, currentDay === index && styles.activeDayText]}>{day}</Text>
              <Text style={[styles.dateText, currentDay === index && styles.activeDayText]}>{currentWeekDates[index]}</Text>
            </View>
          ))}
        </View>

        <ScrollView style={styles.reportsScroll}>
          {reports.map((report, index) => {
            let statusSymbol;

            if (report.status === 'Pending')
              statusSymbol = <Ionicons name="help-circle" size={20} color="orange" />;
            else if (report.status === 'False Symptom')
              statusSymbol = <Ionicons name="close-circle" size={20} color="red" />;
            else if (report.status === 'Sign of Symptom')
              statusSymbol = <Ionicons name="checkmark-circle" size={20} color="green" />;

            return (
              <TouchableOpacity
                key={index}
                style={styles.reportItem}
                onPress={() => setExpandedItem(expandedItem === index ? null : index)}
              >
                <View>
                  <Text style={styles.pendingTitle}>
                    {statusSymbol} {report.status}
                  </Text>
                  <Text style={styles.reportDetails}>
                    {report.HEARTRATE} bpm, {report.DECIBEL} db
                  </Text>

                  {expandedItem === index && report.status === 'Pending' && (
                    <View style={styles.expandedDetails}>
                      <Text style={styles.reportDetails}>Is this a symptom?</Text>

                      <TextInput
                        style={styles.commentBox}
                        placeholder="Add a comment..."
                        multiline
                        value={comment}
                        onChangeText={(text) => setComment(text)}
                      />

                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          style={styles.symptomButton}
                          onPress={() => handleStatusUpdate(report, 'Sign of Symptom', comment)}
                        >
                          <Text style={styles.buttonText}>Symptoms</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.notSymptomButton}
                          onPress={() => handleStatusUpdate(report, 'False Symptom', comment)}
                        >
                          <Text style={styles.buttonText}>Not Symptoms</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C2F48',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 60,
  },
  circleContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  circle: {
    height: 150,
    width: 150,
    borderRadius: 90,
    borderWidth: 11,
    borderColor: '#DF6660',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numbpmText: {
    fontSize: 35,
    color: '#FFFFFF',
    textAlign: 'center',
    top: 5,
    right: 20,
  },
  bpmText: {
    fontSize: 35,
    color: '#FFFFFF',
    textAlign: 'center',
    bottom: 5,
  },
  dbText: {
    fontSize: 35,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  detectionBox: {
    backgroundColor: '#857E81',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  detectionText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dailyReport: {
    backgroundColor: '#F3EEF8',
    padding: 20,
    borderRadius: 20,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pendingTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayBox: {
    padding: 5,
    borderRadius: 10,
    backgroundColor: '#EDEDED',
    width: '13%',
    alignItems: 'center',
  },
  activeDay: {
    backgroundColor: '#2C2F48',
  },
  activeDayText: {
    color: '#FFFFFF',
  },
  dayText: {
    color: '#857E81',
    fontSize: 12,
  },
  dateText: {
    color: '#857E81',
    fontSize: 10,
  },
  reportsScroll: {
    maxHeight: 200,
    marginBottom: 20,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  reportDetails: {
    color: '#857E81',
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginLeft: 100,
  },
  symptomButton: {
    backgroundColor: '#DF6660',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  notSymptomButton: {
    backgroundColor: '#2C2F48',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  heartIcon: {
    position: 'absolute',
    alignContent: 'center',
    justifyContent: 'center',
    top: 10,
    left: 10,
  },
  commentBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 8,
    marginTop: 5,
    minHeight: 40,
    width: '100%',
  },
  expandedDetails: {
    marginTop: 10,
  }
});

export default HomeScreen;