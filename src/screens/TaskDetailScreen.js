import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useTasks } from '../context/TaskContext';
import { useSections } from '../context/SectionContext';
import { Button, PrioritySelector, SectionSelector, DueDatePicker } from '../components';
import { Colors } from '../constants/colors';

const TaskDetailScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { tasks, toggleTask, deleteTask, updateTask } = useTasks();

  const task = tasks.find((t) => t._id === taskId);

  // Local state for editing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Sync local state with task data
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Task not found</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleTitleChange = (text) => {
    setTitle(text);
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      updateTask(taskId, { title: title.trim() });
    } else if (!title.trim()) {
      setTitle(task.title); // Reset if empty
    }
  };

  const handleDescriptionChange = (text) => {
    setDescription(text);
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      updateTask(taskId, { description });
    }
  };

  const handleDelete = () => {
    deleteTask(taskId);
    navigation.goBack();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.statusBadge,
              task.completed && styles.statusBadgeCompleted,
            ]}
            onPress={() => toggleTask(taskId)}
          >
            <Text
              style={[
                styles.statusText,
                task.completed && styles.statusTextCompleted,
              ]}
            >
              {task.completed ? '✓ Completed' : '○ Pending'}
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.titleInput, task.completed && styles.titleCompleted]}
          value={title}
          onChangeText={handleTitleChange}
          onBlur={handleTitleBlur}
          placeholder="Task title"
          placeholderTextColor={Colors.textSecondary}
          multiline
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={handleDescriptionChange}
            onBlur={handleDescriptionBlur}
            placeholder="Add a description..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <PrioritySelector
            label="Priority"
            selected={task.priority || 'medium'}
            onSelect={(priority) => updateTask(taskId, { priority })}
          />
        </View>

        <View style={styles.section}>
          <SectionSelector
            label="File"
            selected={task.sectionId}
            onSelect={(sectionId) => updateTask(taskId, { sectionId })}
            onManageSections={() => navigation.navigate('Sections')}
          />
        </View>

        <View style={styles.section}>
          <DueDatePicker
            label="Due Date"
            value={task.dueDate ? new Date(task.dueDate) : null}
            onChange={(date) => updateTask(taskId, { dueDate: date ? date.toISOString() : null })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Created</Text>
          <Text style={styles.dateText}>{formatDate(task.createdAt)}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title={task.completed ? 'Mark as Pending' : 'Mark as Completed'}
            onPress={() => toggleTask(taskId)}
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Delete Task"
            variant="secondary"
            onPress={handleDelete}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusBadge: {
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeCompleted: {
    backgroundColor: Colors.success + '20',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
  },
  statusTextCompleted: {
    color: Colors.success,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
    padding: 0,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  descriptionInput: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    minHeight: 80,
    padding: 0,
  },
  dateText: {
    fontSize: 14,
    color: Colors.text,
  },
  actions: {
    marginTop: 24,
  },
  buttonSpacer: {
    height: 12,
  },
});

export default TaskDetailScreen;
