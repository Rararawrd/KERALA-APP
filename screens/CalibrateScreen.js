import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';

const CalibrateScreen = ({ navigation }) => {

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.content}>
            <Text style={styles.title}>Device Calibration</Text>
            <Text style={styles.subtitle}>
                Your device is setting up for initial readings. This process only occurs during the first setup. Please restart the application to proceeed.
            </Text>
            
            {/* <TouchableOpacity 
                style={styles.button} 
                onPress={() => {navigation.navigate("Startup")}}
            >
                <Text style={styles.buttonText}>Restart Application</Text>
            </TouchableOpacity> */}
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2C2F48',
        padding: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#DF6660',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtitle: {
        marginTop: 20,
        width: '100%',
        padding: 15,
        backgroundColor: '#3A3E5B',
        borderRadius: 10,
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 20,
    },
});

export default CalibrateScreen;