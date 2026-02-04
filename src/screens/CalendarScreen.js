import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTasks } from '../context/TaskContext';
import { useSections } from '../context/SectionContext';
import { TaskItem, EmptyState } from '../components';
import { Colors } from '../constants/colors';

const CalendarScreen = ({ navigation }) => {
  const { tasks, toggleTask, deleteTask } = useTasks();
  const { getSectionById } = useSections();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Group tasks by due date for calendar markers
  const markedDates = useMemo(() => {
    const marks = {};

    tasks.forEach((task) => {
      if (task.dueDate) {
        const dateKey = task.dueDate.split('T')[0];
        if (!marks[dateKey]) {
          marks[dateKey] = {
            marked: true,
            dots: [],
          };
        }
        // Add dot based on priority
        const dotColor = task.completed
          ? Colors.success
          : task.priority === 'high'
          ? Colors.error
          : task.priority === 'medium'
          ? Colors.warning
          : Colors.primary;

        if (marks[dateKey].dots.length < 3) {
          marks[dateKey].dots.push({ color: dotColor });
        }
      }
    });

    // Add selected date styling
    if (marks[selectedDate]) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: Colors.primary,
      };
    } else {
      marks[selectedDate] = {
        selected: true,
        selectedColor: Colors.primary,
      };
    }

    return marks;
  }, [tasks, selectedDate]);

  // Get tasks for selected date
  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate.split('T')[0] === selectedDate;
    });
  }, [tasks, selectedDate]);

  const formatSelectedDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderTask = ({ item }) => (
    <TaskItem
      task={item}
      section={item.sectionId ? getSectionById(item.sectionId) : null}
      onToggle={() => toggleTask(item._id)}
      onDelete={() => deleteTask(item._id)}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item._id })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={{
          backgroundColor: Colors.background,
          calendarBackground: Colors.surface,
          textSectionTitleColor: Colors.textSecondary,
          selectedDayBackgroundColor: Colors.primary,
          selectedDayTextColor: Colors.textLight,
          todayTextColor: Colors.primary,
          dayTextColor: Colors.text,
          textDisabledColor: Colors.border,
          dotColor: Colors.primary,
          selectedDotColor: Colors.textLight,
          arrowColor: Colors.primary,
          monthTextColor: Colors.text,
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
        }}
        style={styles.calendar}
      />

      <View style={styles.tasksSection}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateTitle}>{formatSelectedDate(selectedDate)}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{tasksForSelectedDate.length}</Text>
          </View>
        </View>

        {tasksForSelectedDate.length === 0 ? (
          <EmptyState
            message="No tasks for this day"
            subtitle="Tasks with due dates will appear here"
          />
        ) : (
          <FlatList
            data={tasksForSelectedDate}
            renderItem={renderTask}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tasksSection: {
    flex: 1,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default CalendarScreen;
