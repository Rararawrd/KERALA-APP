import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SeeMoreScreen = ({ navigation, route }) => {
  const { reports: newReports } = route.params || { reports: [] };
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const storedReports = await AsyncStorage.getItem('reports');
        if (storedReports) {
          setReports(JSON.parse(storedReports));
        }
      } catch (error) {
        console.error('Failed to load reports', error);
      }
    };

    loadReports();
  }, []);

  useEffect(() => {
    const saveReports = async (updatedReports) => {
      try {
        await AsyncStorage.setItem('reports', JSON.stringify(updatedReports));
      } catch (error) {
        console.error('Failed to save reports', error);
      }
    };

    if (newReports.length > 0) {
      const updatedReports = [...newReports, ...reports];
      setReports(updatedReports);
      saveReports(updatedReports);
    }
  }, [newReports]);

  const clearData = async () => {
    try {
      await AsyncStorage.removeItem('reports');
      setReports([]);
    } catch (error) {
      console.error('Failed to clear reports', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
      <View style={styles.record}>
        <Text style={styles.recordTitle}>Records</Text>

        <ScrollView style={styles.scrollableRecord}>
          {reports.length > 0 ? (
            reports.map((report, index) => (
              <View key={index} style={styles.reportItem}>
                <Text style={styles.reportText}>
                  {report.HEARTRATE} bpm, {report.DECIBEL} db - {report.status}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No records available.</Text>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.clearButton} onPress={clearData}>
          <Text style={styles.clearButtonText}>Clear Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C2F48',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  record: {
    backgroundColor: '#F3EEF8',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    maxHeight: 300, // Limit height to make it scrollable
  },
  scrollableRecord: {
    maxHeight: 250, // Scrollable area for records
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  reportText: {
    textAlign: 'left',
    color: '#857E81',
  },
  noDataText: {
    textAlign: 'left',
    color: '#857E81',
  },
  clearButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default SeeMoreScreen;
