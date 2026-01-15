import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Priorities } from '../constants/priorities';
import { getColorByKey } from '../constants/sectionColors';

const TaskItem = ({ task, section, onToggle, onDelete, onPress }) => {
  const priority = Priorities[task.priority] || Priorities.medium;
  const sectionColor = section ? getColorByKey(section.color) : null;

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now && !task.completed;

    return {
      text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isOverdue,
    };
  };

  const dueDate = formatDueDate(task.dueDate);

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <TouchableOpacity
        style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
        onPress={onToggle}
      >
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, task.completed && styles.titleCompleted]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <View
            style={[styles.priorityBadge, { backgroundColor: priority.color + '20' }]}
          >
            <Text style={[styles.priorityText, { color: priority.color }]}>
              {priority.label}
            </Text>
          </View>
        </View>
        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
        {(section || dueDate) && (
          <View style={styles.metaRow}>
            {section && (
              <View style={styles.sectionTag}>
                <View
                  style={[styles.sectionDot, { backgroundColor: sectionColor.color }]}
                />
                <Text style={[styles.sectionText, { color: sectionColor.color }]}>
                  {section.name}
                </Text>
              </View>
            )}
            {dueDate && (
              <View style={[styles.dueDateTag, dueDate.isOverdue && styles.dueDateOverdue]}>
                <Text style={styles.dueDateIcon}>📅</Text>
                <Text style={[styles.dueDateText, dueDate.isOverdue && styles.dueDateTextOverdue]}>
                  {dueDate.text}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteText}>×</Text>
      </TouchableOpacity>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  sectionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dueDateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dueDateOverdue: {
    backgroundColor: Colors.error + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dueDateIcon: {
    fontSize: 10,
  },
  dueDateText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dueDateTextOverdue: {
    color: Colors.error,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteText: {
    color: Colors.error,
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default TaskItem;
