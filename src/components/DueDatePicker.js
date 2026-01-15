import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../constants/colors';

const DueDatePicker = ({ value, onChange, label }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const formatDate = (date) => {
    if (!date) return 'No due date';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      } else {
        onChange(selectedDate);
      }
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      const newDate = new Date(tempDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      onChange(newDate);
    }
  };

  const handleClear = () => {
    onChange(null);
  };

  const isOverdue = value && new Date() > value;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.dateButton, isOverdue && styles.overdueButton]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateIcon}>📅</Text>
          <Text style={[styles.dateText, isOverdue && styles.overdueText]}>
            {formatDate(value)}
          </Text>
          {value && (
            <Text style={[styles.timeText, isOverdue && styles.overdueText]}>
              {formatTime(value)}
            </Text>
          )}
        </TouchableOpacity>

        {value && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}

      {Platform.OS === 'ios' && showDatePicker && (
        <View style={styles.iosButtons}>
          <TouchableOpacity
            style={styles.iosButton}
            onPress={() => setShowDatePicker(false)}
          >
            <Text style={styles.iosCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iosButton}
            onPress={() => {
              setShowDatePicker(false);
              setShowTimePicker(true);
            }}
          >
            <Text style={styles.iosDoneText}>Set Time</Text>
          </TouchableOpacity>
        </View>
      )}

      {Platform.OS === 'ios' && showTimePicker && (
        <View style={styles.iosButtons}>
          <TouchableOpacity
            style={styles.iosButton}
            onPress={() => setShowTimePicker(false)}
          >
            <Text style={styles.iosCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iosButton}
            onPress={() => {
              setShowTimePicker(false);
              onChange(tempDate);
            }}
          >
            <Text style={styles.iosDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  overdueButton: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10',
  },
  dateIcon: {
    fontSize: 16,
  },
  dateText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  overdueText: {
    color: Colors.error,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  iosButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  iosButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  iosCancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  iosDoneText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default DueDatePicker;
