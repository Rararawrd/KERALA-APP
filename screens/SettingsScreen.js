import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
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

    useEffect(() => {
        const loadThresholds = async () => {
            try {
                // Load from local storage
                const savedBpm = await AsyncStorage.getItem('bpmThreshold');
                const savedDb = await AsyncStorage.getItem('dbThreshold');

                // Load from Supabase where t_id = 1
                const { data, error } = await supabase
                    .from('threshold')
                    .select('t_bpm, t_dba')
                    .eq('t_id', 1)
                    .single();

                if (!error && data) {
                    // Use Supabase data if available, otherwise use local storage
                    setBpmThreshold(data.t_bpm?.toString() ?? savedBpm ?? '');
                    setDbThreshold(data.t_dba?.toString() ?? savedDb ?? '');
                    setBpmInput(data.t_bpm?.toString() ?? savedBpm ?? '');
                    setDbInput(data.t_dba?.toString() ?? savedDb ?? '');
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

        loadThresholds();
    }, []);

    const saveThresholds = async () => {
        if (!bpmInput || !dbInput) {
            Alert.alert('Error', 'Please enter both BPM and dB values');
            return;
        }

        setLoading(true);
        try {
            // Save to local storage
            await AsyncStorage.setItem('bpmThreshold', bpmInput);
            await AsyncStorage.setItem('dbThreshold', dbInput);
            
            // Update Supabase where t_id = 1
            const { error } = await supabase
                .from('threshold')
                .update({ 
                    t_bpm: parseInt(bpmInput),
                    t_dba: parseInt(dbInput)
                })
                .eq('t_id', 1);  // This ensures we only update the row with t_id = 1

            if (error) {
                throw error;
            }

            // Update state and navigate
            setBpmThreshold(bpmInput);
            setDbThreshold(dbInput);
            Alert.alert('Success', 'Thresholds updated successfully');
            navigation.navigate('Home', { 
                bpmThreshold: bpmInput, 
                dbThreshold: dbInput 
            });
        } catch (error) {
            console.error('Error saving thresholds:', error);
            Alert.alert('Error', 'Failed to update thresholds');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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

                <TouchableOpacity
                    style={[styles.setButton, loading && styles.disabledButton]}
                    onPress={saveThresholds}
                    disabled={loading}
                >
                    <Text style={styles.setButtonText}>
                        {loading ? 'Saving...' : 'Set'}
                    </Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.currentValues}>
                <Text style={styles.currentValueText}>
                    Current Heart Rate: {bpmThreshold || 'Not set'} BPM
                </Text>
                <Text style={styles.currentValueText}>
                    Current Decibel: {dbThreshold || 'Not set'} dB
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
    setButton: {
        backgroundColor: '#2C2F48',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#6C757D',
    },
    setButtonText: {
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