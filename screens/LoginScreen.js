import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';

const LoginScreen = ({navigation}) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#2C2F48'}}>
        <View style={[styles.container, {justifyContent: 'center'}]}>
            <View style={styles.header}>
            {/* <Image
                source={require('./assets/chaewon.jpg')}
                style={styles.headerImg}
                alt="Logo "
            /> */}

            <Text style={styles.title}>KERALA</Text>

            <Text style={styles.subtitle}>
                Sign in to KERALA
            </Text>

            <View styles={styles.form}>
                <View style={styles.input}>
                <Text style={styles.inputLabel}>Username</Text>

                <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    style={styles.inputControl}
                    placeholder='Enter username'
                    placeholderTextColor="#6b7280"
                    value={form.email}
                    onChangeText={email => setForm({...form, email})}
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

            </View>

            <View style={styles.formAction}>
                <TouchableOpacity
                onPress={() => {
                //handle onPress

                // Alert.alert('Successfully logged in');
                navigation.navigate("Main")
                }}>
                <View style={styles.btn}>
                    <Text style={styles.btnText}>Sign in</Text>
                </View>
                </TouchableOpacity>
               
            </View>
           
            <TouchableOpacity
                style={{ marginTop: 'auto'}}
                onPress={() => {
               
                // handle onPress
                navigation.navigate("Register")
                }}>
                <Text style={styles.formFooter}>
                Don't have an account?{' '}
                <Text style={{ textDecorationLine: 'underline'}}>Sign up</Text>
                </Text>
            </TouchableOpacity>

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
  headerImg: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 36,
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
    marginVertical: 10, //inadd ko
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

export default LoginScreen;