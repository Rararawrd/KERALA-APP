import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';

const supabaseUrl = 'https://pafntpcanmavljkxyerv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZm50cGNhbm1hdmxqa3h5ZXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1MDA5MDAsImV4cCI6MjA1MDA3NjkwMH0.GwUG6tDFxnYE5VhTOK1P8Yx8qxq696zrgvZXRgwagPM';
const supabase = createClient(supabaseUrl, supabaseKey);

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const hashPassword = async (password) => {
    try {
      // Create a SHA-256 hash of the password
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
      return digest;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }
  };

  const handleRegister = async () => {
    if (!form.username || !form.password || !form.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Hash the password before sending to Supabase
      const hashedPassword = await hashPassword(form.password);
      
      // Insert user data into SYSTEM_TEST table with hashed password
      const { data, error } = await supabase
        .from('1_SYSTEM')
        .insert([
          { 
            username: form.username,
            password: hashedPassword, // Now storing the hashed version
            new: true
          }
        ])
        .select();

      if (error) throw error;

      if (data) {
        Alert.alert('Success', 'Account created successfully!');
        navigation.navigate('Login');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#2C2F48' }}>
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={styles.header}>
            <Text style={styles.title}>KERALA</Text>
            <Text style={styles.subtitle}>Create an account to get started</Text>

            <View style={styles.form}>
              <View style={styles.input}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.inputControl}
                  placeholder="Enter username"
                  placeholderTextColor="#6b7280"
                  value={form.username}
                  onChangeText={(username) => setForm({ ...form, username })}
                />
              </View>

              <View style={styles.input}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  autoCapitalize="none"
                  secureTextEntry
                  style={styles.inputControl}
                  placeholder="Enter password"
                  placeholderTextColor="#6b7280"
                  value={form.password}
                  onChangeText={(password) => setForm({ ...form, password })}
                />
              </View>

              <View style={styles.input}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  autoCapitalize="none"
                  secureTextEntry
                  style={styles.inputControl}
                  placeholder="Confirm your password"
                  placeholderTextColor="#6b7280"
                  value={form.confirmPassword}
                  onChangeText={(confirmPassword) => setForm({ ...form, confirmPassword })}
                />
              </View>
            </View>

            <View style={styles.formAction}>
              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                style={styles.btn}
              >
                <Text style={styles.btnText}>
                  {loading ? 'Creating account...' : 'Sign up'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{ marginTop: 'auto' }}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.formFooter}>
                Already have an account?{' '}
                <Text style={{ textDecorationLine: 'underline' }}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

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
  },
});

export default RegisterScreen;