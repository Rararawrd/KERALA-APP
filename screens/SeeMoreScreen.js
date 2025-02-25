import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

const SeeMoreScreen = ({ navigation, route }) => {
  const { reports } = route.params || { reports: [] };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
      <View style={styles.record}>
        <Text style={styles.recordTitle}>Records</Text>

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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C2F48', // Background color
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Center the record box vertically
    alignItems: 'center', // Center the record box horizontally
    padding: 20,
  },
  record: {
    backgroundColor: '#F3EEF8', // Records background
    padding: 20,
    borderRadius: 20,
    width: '100%', // Adjust width for better responsiveness
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
    textAlign: 'left', // Keep text aligned to the left
    color: '#857E81',
  },
  noDataText: {
    textAlign: 'left', // Keep text aligned to the left
    color: '#857E81',
  },
});

export default SeeMoreScreen;
