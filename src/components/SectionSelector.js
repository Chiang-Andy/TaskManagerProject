import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { getColorByKey } from '../constants/sectionColors';
import { useSections } from '../context/SectionContext';

const SectionSelector = ({ selected, onSelect, label, onManageSections }) => {
  const { sections } = useSections();

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.option,
            !selected && styles.optionSelected,
          ]}
          onPress={() => onSelect(null)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.optionText,
              !selected && styles.optionTextSelected,
            ]}
          >
            None
          </Text>
        </TouchableOpacity>

        {sections.map((section) => {
          const colorData = getColorByKey(section.color);
          const isSelected = selected === section.id;
          return (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.option,
                { borderColor: colorData.color },
                isSelected && { backgroundColor: colorData.color },
              ]}
              onPress={() => onSelect(section.id)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.colorDot, { backgroundColor: colorData.color }]}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: isSelected ? Colors.textLight : colorData.color },
                ]}
                numberOfLines={1}
              >
                {section.name}
              </Text>
            </TouchableOpacity>
          );
        })}

        {onManageSections && (
          <TouchableOpacity
            style={styles.manageButton}
            onPress={onManageSections}
            activeOpacity={0.7}
          >
            <Text style={styles.manageButtonText}>+ New</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {sections.length === 0 && onManageSections && (
        <Text style={styles.hint}>
          No files yet. Tap "+ New" to create one.
        </Text>
      )}
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
  scrollContent: {
    gap: 10,
    paddingRight: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 6,
  },
  optionSelected: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    maxWidth: 120,
  },
  optionTextSelected: {
    color: Colors.textLight,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  manageButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});

export default SectionSelector;
