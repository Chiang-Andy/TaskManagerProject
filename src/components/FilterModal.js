import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../constants/colors';

const SORT_OPTIONS = [
  { key: 'dueDate', label: 'Due Date' },
  { key: 'priority', label: 'Priority' },
  { key: 'createdAt', label: 'Created Date' },
  { key: 'alphabetical', label: 'Alphabetical' },
];

const PRIORITY_OPTIONS = [
  { key: 'all', label: 'All', color: Colors.textSecondary },
  { key: 'high', label: 'High', color: Colors.error },
  { key: 'medium', label: 'Medium', color: Colors.warning },
  { key: 'low', label: 'Low', color: Colors.success },
];

const FilterModal = ({
  visible,
  onClose,
  sortBy,
  setSortBy,
  filterPriority,
  setFilterPriority,
  hideCompleted,
  setHideCompleted,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <Text style={styles.title}>Sort & Filter</Text>

              {/* Sort By Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sort By</Text>
                <View style={styles.optionsRow}>
                  {SORT_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.chip,
                        sortBy === option.key && styles.chipSelected,
                      ]}
                      onPress={() => setSortBy(option.key)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          sortBy === option.key && styles.chipTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filter by Priority Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Filter by Priority</Text>
                <View style={styles.optionsRow}>
                  {PRIORITY_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.chip,
                        { borderColor: option.color },
                        filterPriority === option.key && {
                          backgroundColor: option.color,
                        },
                      ]}
                      onPress={() => setFilterPriority(option.key)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: option.color },
                          filterPriority === option.key && styles.chipTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Hide Completed Toggle */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.toggleRow}
                  onPress={() => setHideCompleted(!hideCompleted)}
                >
                  <Text style={styles.toggleLabel}>Hide Completed Tasks</Text>
                  <View
                    style={[
                      styles.toggle,
                      hideCompleted && styles.toggleActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleCircle,
                        hideCompleted && styles.toggleCircleActive,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Close Button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.textLight,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  closeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterModal;
