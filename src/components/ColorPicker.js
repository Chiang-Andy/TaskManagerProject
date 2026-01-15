import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { SectionColors } from '../constants/sectionColors';

const ColorPicker = ({ selected, onSelect, label }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.colors}>
        {SectionColors.map((color) => (
          <TouchableOpacity
            key={color.key}
            style={[
              styles.colorOption,
              { backgroundColor: color.color },
              selected === color.key && styles.colorSelected,
            ]}
            onPress={() => onSelect(color.key)}
            activeOpacity={0.7}
          >
            {selected === color.key && <Text style={styles.checkmark}>✓</Text>}
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
  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: Colors.text,
  },
  checkmark: {
    color: Colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ColorPicker;
