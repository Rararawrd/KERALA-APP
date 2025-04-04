import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pafntpcanmavljkxyerv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZm50cGNhbm1hdmxqa3h5ZXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1MDA5MDAsImV4cCI6MjA1MDA3NjkwMH0.GwUG6tDFxnYE5VhTOK1P8Yx8qxq696zrgvZXRgwagPM';
const supabase = createClient(supabaseUrl, supabaseKey);

const SeeMoreScreen = ({ navigation, route }) => {
  const [reports, setReports] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLatestReports = async () => {
    try {
      setIsRefreshing(true);
      const { data, error } = await supabase
        .from('1_READ')
        .select('read_bpm, read_db, symptom, read_ID, time')
        .order('read_ID', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const setupRealtime = () => {
    const subscription = supabase
      .channel('reports_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: '1_READ'
        },
        () => {
          fetchLatestReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  useEffect(() => {
    fetchLatestReports();
    const cleanup = setupRealtime();
    
    return () => {
      cleanup();
    };
  }, []);

  const handleRefresh = () => {
    fetchLatestReports();
  };

  const renderSymptomStatus = (symptom) => {
    if (symptom === true) return <Text style={styles.symptomTrue}>Sign of Symptoms</Text>;
    if (symptom === false) return <Text style={styles.symptomFalse}>False Symptoms</Text>;
    return <Text style={styles.symptomUnknown}>Status Unknown</Text>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.header}>Monitoring Records</Text>
        
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.timeCell]}>Time</Text>
            <Text style={[styles.headerCell, styles.heartRateCell]}>Heart Rate</Text>
            <Text style={[styles.headerCell, styles.decibelCell]}>Noise Level</Text>
            <Text style={[styles.headerCell, styles.statusCell]}>Status</Text>
          </View>
          
          <ScrollView style={styles.scrollContainer}>
            {reports.length > 0 ? (
              reports.map((report, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                    index === reports.length - 1 && styles.lastRow
                  ]}
                >
                  <Text style={[styles.cell, styles.timeCell]}>{formatDate(report.time)}</Text>
                  <Text style={[styles.cell, styles.heartRateCell]}>{report.read_bpm} bpm</Text>
                  <Text style={[styles.cell, styles.decibelCell]}>{report.read_db} dB</Text>
                  <View style={[styles.cell, styles.statusCell]}>
                    {renderSymptomStatus(report.symptom)}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No records available</Text>
            )}
          </ScrollView>
        </View>

        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.refreshButtonText}>Refresh</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C2F48',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  tableContainer: {
    flex: 0, // Don't grow, just take needed space
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E2030',
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3E5B',
  },
  lastRow: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomWidth: 0,
  },
  evenRow: {
    backgroundColor: '#3A3E5B',
  },
  oddRow: {
    backgroundColor: '#2C2F48',
  },
  cell: {
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  timeCell: {
    flex: 2,
    textAlign: 'left',
    paddingLeft: 8,
  },
  heartRateCell: {
    flex: 1,
  },
  decibelCell: {
    flex: 1,
  },
  statusCell: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    maxHeight: 400, // Set a max height to prevent taking full screen
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A3E5B',
  },
  noDataText: {
    color: '#FFFFFF',
    textAlign: 'center',
    padding: 20,
  },
  symptomTrue: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  symptomFalse: {
    color: '#6BCB77',
    fontWeight: 'bold',
  },
  symptomUnknown: {
    color: '#FFD93D',
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#F4A9BD',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SeeMoreScreen;