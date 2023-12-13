import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LocationTracker from './Components/LocationTracker/LocationTracker';
import Header from './Components/Header/Header';

export default function App() {
  return (
    <View>
      <Header/>
      <LocationTracker/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
