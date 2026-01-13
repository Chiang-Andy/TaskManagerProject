import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { PriorityList } from '../constants/priorities';

const PrioritySelector = ({ selected, onSelect, label }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.options}>
        {PriorityList.map((priority) => (
          <TouchableOpacity
            key={priority.key}
            style={[
              styles.option,
              {
                borderColor: priority.color,
                backgroundColor:
                  selected === priority.key ? priority.color : 'transparent',
              },
            ]}
            onPress={() => onSelect(priority.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color:
                    selected === priority.key ? Colors.textLight : priority.color,
                },
              ]}
            >
              {priority.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  options: {
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PrioritySelector;
