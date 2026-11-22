import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Patient Health</Text>
        <Text style={{ marginTop: 8, color: '#475569' }}>Home • Health • Care • Records • Profile</Text>
        <Text style={{ marginTop: 16, color: '#64748b' }}>How is my health and what do I need to do today?</Text>
      </View>
    </SafeAreaView>
  );
}
