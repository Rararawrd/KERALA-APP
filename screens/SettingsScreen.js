import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://pafntpcanmavljkxyerv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZm50cGNhbm1hdmxqa3h5ZXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1MDA5MDAsImV4cCI6MjA1MDA3NjkwMH0.GwUG6tDFxnYE5VhTOK1P8Yx8qxq696zrgvZXRgwagPM';
const supabase = createClient(supabaseUrl, supabaseKey);

const SettingsScreen = ({ navigation }) => {
    const [bpmThreshold, setBpmThreshold] = useState('');
    const [dbThreshold, setDbThreshold] = useState('');
    const [bpmInput, setBpmInput] = useState('');
    const [dbInput, setDbInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);
    const [lastActiveTimestamp, setLastActiveTimestamp] = useState(null);

    // Load saved timer state on component mount
    useEffect(() => {
        const loadTimerState = async () => {
            try {
                const savedState = await AsyncStorage.getItem('timerState');
                if (savedState) {
                    const { seconds: savedSeconds, isRecording: savedIsRecording, timestamp } = JSON.parse(savedState);
                    setSeconds(savedSeconds);
                    setIsRecording(savedIsRecording);
                    
                    // If recording was active when app closed, calculate additional time
                    if (savedIsRecording && timestamp) {
                        const timeElapsed = Math.floor((Date.now() - timestamp) / 1000);
                        setSeconds(savedSeconds + timeElapsed);
                    }
                }
            } catch (error) {
                console.error('Error loading timer state:', error);
            }
        };

        loadTimerState();
        loadThresholds();
    }, []);

    // Save timer state whenever it changes or app goes to background
    useEffect(() => {
        const saveTimerState = async () => {
            try {
                const timerState = {
                    seconds,
                    isRecording,
                    timestamp: isRecording ? Date.now() : null
                };
                await AsyncStorage.setItem('timerState', JSON.stringify(timerState));
            } catch (error) {
                console.error('Error saving timer state:', error);
            }
        };

        saveTimerState();

        // Handle app state changes
        const handleAppStateChange = (nextAppState) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                saveTimerState();
            }
        };

        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            appStateSubscription.remove();
            saveTimerState(); // Save one last time when component unmounts
        };
    }, [seconds, isRecording]);

    const loadThresholds = async () => {
        try {
            // Load from local storage
            const savedBpm = await AsyncStorage.getItem('bpmThreshold');
            const savedDb = await AsyncStorage.getItem('dbThreshold');

            // Load most recent recording from Supabase
            const { data, error } = await supabase
                .from('1_THRESHOLD')
                .select('threshold_bpm, threshold_db, recording')
                .order('threshold_ID', { ascending: false })
                .limit(1);

            if (!error && data && data.length > 0) {
                const latestRecording = data[0];
                // Use Supabase data if available, otherwise use local storage
                setBpmThreshold(latestRecording.threshold_bpm?.toString() ?? savedBpm ?? '');
                setDbThreshold(latestRecording.threshold_db?.toString() ?? savedDb ?? '');
                setBpmInput(latestRecording.threshold_bpm?.toString() ?? savedBpm ?? '');
                setDbInput(latestRecording.threshold_db?.toString() ?? savedDb ?? '');
                
                // Set recording status
                if (latestRecording.recording) {
                    setIsRecording(true);
                    startTimer();
                }
            } else {
                // Fallback to local storage if Supabase fails
                setBpmThreshold(savedBpm ?? '');
                setDbThreshold(savedDb ?? '');
                setBpmInput(savedBpm ?? '');
                setDbInput(savedDb ?? '');
            }
        } catch (error) {
            console.error('Error loading thresholds:', error);
        }
    };

    const startTimer = () => {
        // Only start if not already running
        if (!timerInterval) {
            const interval = setInterval(() => {
                setSeconds(prevSeconds => prevSeconds + 1);
            }, 1000);
            setTimerInterval(interval);
        }
    };

    const stopTimer = () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
        }
    };

    const resetTimer = async () => {
        stopTimer();
        setSeconds(0);
        setIsRecording(false);
        try {
            await AsyncStorage.removeItem('timerState');
        } catch (error) {
            console.error('Error resetting timer state:', error);
        }
    };

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    };

    const saveThresholds = async () => {
        if (!bpmInput || !dbInput) {
            Alert.alert('Error', 'Please enter both BPM and dB values');
            return;
        }
    
        setLoading(true);
        try {
            // Check if thresholds have changed
            const bpmChanged = bpmInput !== bpmThreshold;
            const dbChanged = dbInput !== dbThreshold;
            const thresholdsChanged = bpmChanged || dbChanged;
    
            // Save to local storage regardless
            await AsyncStorage.setItem('bpmThreshold', bpmInput);
            await AsyncStorage.setItem('dbThreshold', dbInput);
    
            if (thresholdsChanged) {
                // If thresholds changed, insert a new row with recording status true
                const { data, error } = await supabase
                    .from('1_THRESHOLD')
                    .insert([{ 
                        threshold_bpm: parseInt(bpmInput),
                        threshold_db: parseInt(dbInput),
                        recording: true
                    }])
                    .select();
    
                if (error) {
                    throw error;
                }
            } else {
                // If thresholds didn't change, find the most recent recording
                const { data: recentRecordings, error: findError } = await supabase
                    .from('1_THRESHOLD')
                    .select('threshold_ID')
                    .order('threshold_ID', { ascending: false })
                    .limit(1);
    
                if (findError) throw findError;
                
                if (!recentRecordings || recentRecordings.length === 0) {
                    throw new Error('No existing recording found');
                }
    
                const recordingId = recentRecordings[0].threshold_ID;
    
                // Update the recording status to true
                const { error: updateError } = await supabase
                    .from('1_THRESHOLD')
                    .update({ 
                        recording: true
                    })
                    .eq('threshold_ID', recordingId);
    
                if (updateError) throw updateError;
            }
    
            // Update state and navigate
            setBpmThreshold(bpmInput);
            setDbThreshold(dbInput);
            setIsRecording(true);
            startTimer();
            Alert.alert('Success', 'Recording started successfully');
            navigation.navigate('Home', { 
                bpmThreshold: bpmInput, 
                dbThreshold: dbInput 
            });
        } catch (error) {
            console.error('Error saving thresholds:', error);
            Alert.alert('Error', 'Failed to start recording');
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        try {
            // Find the most recent active recording
            const { data: activeRecordings, error: findError } = await supabase
                .from('1_THRESHOLD')
                .select('threshold_ID')
                .eq('recording', true)
                .order('threshold_ID', { ascending: false })
                .limit(1);

            if (findError) throw findError;
            
            if (!activeRecordings || activeRecordings.length === 0) {
                throw new Error('No active recording found');
            }

            const recordingId = activeRecordings[0].threshold_ID;

            // Update the recording status to false
            const { error: updateError } = await supabase
                .from('1_THRESHOLD')
                .update({ 
                    recording: false
                })
                .eq('threshold_ID', recordingId);

            if (updateError) throw updateError;

            setIsRecording(false);
            stopTimer();
            Alert.alert('Recording Stopped', 'The recording has been stopped');
        } catch (error) {
            console.error('Error stopping recording:', error);
            Alert.alert('Error', 'Failed to stop recording');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Timer Container */}
            <View style={styles.timerContainer}>
                <Text style={styles.timerTitle}>Total Recording Time:</Text>
                <Text style={styles.timerText}>
                    {formatTime(seconds)}
                </Text>
                <Text style={styles.timerStatus}>
                    Status: {isRecording ? 'Recording' : 'Not Recording'}
                </Text>
            </View>

            <View style={styles.record}>
                <Text style={styles.recordTitle}>Set Threshold</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Heart Rate"
                        placeholderTextColor="#857E81"
                        keyboardType="numeric"
                        value={bpmInput}
                        onChangeText={setBpmInput} 
                    />
                    <Text style={styles.unit}>BPM</Text>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Decibel"
                        placeholderTextColor="#857E81"
                        keyboardType="numeric"
                        value={dbInput}
                        onChangeText={setDbInput} 
                    />
                    <Text style={styles.unit}>dB</Text>
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[
                            styles.setButton, 
                            (loading || isRecording) && styles.disabledButton,
                            styles.flexButton
                        ]}
                        onPress={saveThresholds}
                        disabled={loading || isRecording}
                    >
                        <Text style={styles.setButtonText}>
                            {loading ? 'Starting...' : 'Start Recording'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.stopButton, 
                            !isRecording && styles.disabledButton,
                            styles.flexButton
                        ]}
                        onPress={handleStop}
                        disabled={!isRecording}
                    >
                        <Text style={styles.stopButtonText}>
                            Stop
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            <View style={styles.currentValues}>
                <Text style={styles.currentValueText}>
                    Notification will alert you if readings exceed thresholds and symptoms occur in the patient.
                </Text>
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
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerContainer: {
        width: '100%',
        padding: 15,
        backgroundColor: '#3A3E5B',
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    timerTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginBottom: 5,
    },
    timerText: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    timerStatus: {
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 10,
    },
    record: {
        backgroundColor: '#F3EEF8',
        padding: 20,
        borderRadius: 20,
        width: '100%',
    },
    recordTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        padding: 10,
        fontSize: 16,
    },
    unit: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#857E81',
        marginLeft: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    flexButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    setButton: {
        backgroundColor: '#2C2F48',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    stopButton: {
        backgroundColor: '#DF6660',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
    },
    setButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    stopButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    currentValues: {
        marginTop: 20,
        width: '100%',
        padding: 15,
        backgroundColor: '#3A3E5B',
        borderRadius: 10,
    },
    currentValueText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 5,
    },
});

export default SettingsScreen;