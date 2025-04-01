import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';

const RegisterScreen = ({navigation}) => {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = () => {
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    // Here you would typically handle the registration logic
    Alert.alert('Success', 'Successfully registered');
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#2C2F48'}}>
        <View style={styles.container}>
            <View style={{flex: 1, justifyContent: 'center'}}>
                <View style={styles.header}>
                    <Text style={styles.title}>KERALA</Text>

                    <Text style={styles.subtitle}>
                        Create an account to get started
                    </Text>

                    <View styles={styles.form}>
                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Username</Text>

                            <TextInput
                                autoCapitalize="none"
                                autoCorrect={false}
                                style={styles.inputControl}
                                placeholder='Enter username'
                                placeholderTextColor="#6b7280"
                                value={form.username}
                                onChangeText={username => setForm({...form, username})}
                            />
                        </View>

                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Password</Text>

                            <TextInput
                                secureTextEntry
                                style={styles.inputControl}
                                placeholder='Enter password'
                                placeholderTextColor="#6b7280"
                                value={form.password}
                                onChangeText={password => setForm({...form, password})}
                            />
                        </View>

                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Re-type Password</Text>

                            <TextInput
                                secureTextEntry
                                style={styles.inputControl}
                                placeholder='Confirm your password'
                                placeholderTextColor="#6b7280"
                                value={form.confirmPassword}
                                onChangeText={confirmPassword => setForm({...form, confirmPassword})}
                            />
                        </View>
                    </View>

                    <View style={styles.formAction}>
                        <TouchableOpacity
                            onPress={handleRegister}>
                            <View style={styles.btn}>
                                <Text style={styles.btnText}>Sign up</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={{ marginTop: 'auto'}}
                        onPress={() => {
                            navigation.navigate("Login")
                        }}>
                        <Text style={styles.formFooter}>
                            Already have an account?{' '}
                            <Text style={{ textDecorationLine: 'underline'}}>Sign in</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },
  header: {
    marginVertical: 36,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#F4A9BD',
    marginBottom: 6,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'left',
    marginVertical: 10,
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#F4A9BD',
    marginBottom: 8,
  },
  inputControl: {
    height: 44,
    backgroundColor: '#3b3d56',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  form: {
    marginBottom: 24,
    flex: 1,
  },
  formAction: {
    marginVertical: 24,
  },
  formFooter: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.15,
  },
  btn: {
    backgroundColor: '#DF6660',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#075eec',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  }
});

export default RegisterScreen;