import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
    const [bpmThreshold, setBpmThreshold] = useState('');
    const [dbThreshold, setDbThreshold] = useState('');
    const [bpmInput, setBpmInput] = useState('');
    const [dbInput, setDbInput] = useState('');

    useEffect(() => {
        const loadThresholds = async () => {
            try {
                const savedBpm = await AsyncStorage.getItem('bpmThreshold');
                const savedDb = await AsyncStorage.getItem('dbThreshold');

                setBpmThreshold(savedBpm ?? '');
                setDbThreshold(savedDb ?? '');
                setBpmInput(savedBpm ?? '');
                setDbInput(savedDb ?? '');
            } catch (error) {
                console.error('Error loading thresholds:', error);
            }
        };

        loadThresholds();
    }, []);

    const saveThresholds = async () => {
        setBpmThreshold(bpmInput);
        setDbThreshold(dbInput);

        await AsyncStorage.setItem('bpmThreshold', bpmInput);
        await AsyncStorage.setItem('dbThreshold', dbInput);

        navigation.navigate('Home', { bpmThreshold: bpmInput, dbThreshold: dbInput });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* <Text style={{ color: 'white' }}>
                {bpmThreshold}{"\n" + dbThreshold}
            </Text> */}
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
                    style={styles.setButton}
                    onPress={saveThresholds}
                >
                    <Text style={styles.setButtonText}>Set</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2C2F48', // Background color
        padding: 20,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center', // Center the record box vertically
        alignItems: 'center', // Center the record box horizontally
    },
    record: {
        backgroundColor: '#F3EEF8', // Records background
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
    setButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 1,
    },
});

export default SettingsScreen;
