import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Button, Animated } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


// Initialize Supabase client
const supabaseUrl = 'https://pafntpcanmavljkxyerv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZm50cGNhbm1hdmxqa3h5ZXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1MDA5MDAsImV4cCI6MjA1MDA3NjkwMH0.GwUG6tDFxnYE5VhTOK1P8Yx8qxq696zrgvZXRgwagPM';
const supabase = createClient(supabaseUrl, supabaseKey);

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
  const [reports, setReports] = useState([]); // Array to hold all reports
  const [expandedItem, setExpandedItem] = useState(null);
  const [bpm, setBpm] = useState(0);
  const [db, setDb] = useState(0);
  const [latestReportId, setLatestReportId] = useState(null); // Track the latest report ID

  const scaleValue = useState(new Animated.Value(1))[0];

  const [bpmThreshold, setBpmThreshold] = useState(null);
  const [dbThreshold, setDbThreshold] = useState(null);
  // const [isLoaded, setIsLoaded] = useState(false); // Track loading state

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
            Animated.timing(scaleValue, {
                toValue: 1.1, // Increase size
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
                toValue: 1, // Return to normal size
                duration: 300,
                useNativeDriver: true,
            }),
            ])
        ).start();
    }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchReports();  // Refresh data every second
    }, 1000);  // 1000 milliseconds = 1 second

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, [latestReportId]);

  const fetchReports = async () => {
    const { data, error } = await supabase.from('READINGS')
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
      newReport.TIMESTAMP = new Date(newReport.TIMESTAMP);
  
      if (newReport.HEARTRATE >= bpmThreshold && newReport.DECIBEL >= dbThreshold) {
        if (!reports.some(report => report.id === newReport.id)) {
          setReports(prevReports => [{ ...newReport, status: "Pending" }, ...prevReports]);
          setLatestReportId(newReport.id);
          
        }
      }
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* <Text style={{ color: 'white' }}>
        {bpmThreshold}{"\n" + dbThreshold}
      </Text> */}
      {/*Header bpm and db*/}
      <View style={styles.header}>
        <View style={styles.circleContainer}>
            <View style={styles.circle}>
                <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                    <FontAwesome name="heart" size={30} color="#DF6660" style={styles.heartIcon} />
                </Animated.View>
                <Text style={styles.numbpmText}>{bpm}{'\n'}</Text>
                <Text style={styles.bpmText}>bpm</Text>
            </View>
        </View>
        
        <View style={styles.circleContainer}>
          <View style={styles.circle}>
            <Text style={styles.dbText}>{db}{'\n'}db</Text>
          </View>
        </View>
      </View>
      
      {bpm >= bpmThreshold && db >= dbThreshold && (
        <View style={styles.detectionBox}>
          <Text style={styles.detectionText}>Loud sound and Increased Heart rate Detected</Text>
        </View>
      )}

      {/* Daily Report Section */}
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

        {/* Reports Section */}
        <ScrollView style={styles.reportsScroll}>
          {reports.map((report, index) => {
            let statusSymbol;

            if (report.status === "Pending")
              statusSymbol = <Ionicons name="help-circle" size={20} color="orange" />;
            else if (report.status === "False Symptom")
              statusSymbol = <Ionicons name="close-circle" size={20} color="red" />;
            else if (report.status === "Sign of Symptom")
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

                  {expandedItem === index && report.status === "Pending" && (
                    <View style={styles.expandedDetails}>
                      <Text style={styles.reportDetails}>Is this a symptom?</Text>
                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          style={styles.symptomButton}
                          onPress={() => {
                            const updatedReports = [...reports];
                            updatedReports[index].status = "Sign of Symptom";
                            setReports(updatedReports);
                            
                            navigation.navigate('Records', { reports: updatedReports });
                          }}
                        >
                          <Text style={styles.buttonText}>Symptoms</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.notSymptomButton}
                          onPress={() => {
                            const updatedReports = [...reports];
                            updatedReports[index].status = "False Symptom";
                            setReports(updatedReports);

                            navigation.navigate('Records', { reports: updatedReports });
                          }}
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
  seeMoreButton: {
    alignSelf: 'flex-end',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#2C2F48',
    borderRadius: 5,
  },
  seeMoreText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
  
});

export default HomeScreen;
