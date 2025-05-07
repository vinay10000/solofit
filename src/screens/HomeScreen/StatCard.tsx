// src/components/StatCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Define the props interface
type StatCardProps = {
  icon: string;
  title: string;
  valueMain: string;
  valueSub: string;
};

const StatCard: React.FC<StatCardProps> = ({ icon, title, valueMain, valueSub }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.values}>
        <Text style={styles.valueMain}>{valueMain}</Text>
        <Text style={styles.valueSub}>{valueSub}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e2f',
    padding: 15,
    borderRadius: 10,
    width: 130,
    alignItems: 'center',
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  icon: {
    fontSize: 28,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    color: '#ccc',
    marginBottom: 6,
  },
  values: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  valueMain: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 4,
  },
  valueSub: {
    fontSize: 12,
    color: '#aaa',
  },
});

export default StatCard;