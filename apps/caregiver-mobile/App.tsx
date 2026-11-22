import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Caregiver</Text>
        <Text style={{ marginTop: 8, color: '#475569' }}>Home • Patient • Care • Records • More</Text>
        <Text style={{ marginTop: 16, color: '#64748b' }}>Is the patient okay and does anything require my attention?</Text>
      </View>
    </SafeAreaView>
  );
}
