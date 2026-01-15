import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTasks } from '../context/TaskContext';
import { Input, Button, PrioritySelector, SectionSelector, DueDatePicker } from '../components';
import { Colors } from '../constants/colors';

const AddTaskScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [sectionId, setSectionId] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const { addTask } = useTasks();

  const handleAddTask = () => {
    if (title.trim()) {
      addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        sectionId,
        dueDate: dueDate ? dueDate.toISOString() : null,
      });
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <Input
              label="Task Title"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
            />

            <Input
              label="Description (optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              multiline
              numberOfLines={4}
            />

            <PrioritySelector
              label="Priority"
              selected={priority}
              onSelect={setPriority}
            />

            <SectionSelector
              label="File"
              selected={sectionId}
              onSelect={setSectionId}
              onManageSections={() => navigation.navigate('Sections')}
            />

            <DueDatePicker
              label="Due Date (optional)"
              value={dueDate}
              onChange={setDueDate}
            />
          </View>

          <View style={styles.buttons}>
            <Button
              title="Add Task"
              onPress={handleAddTask}
              disabled={!title.trim()}
            />
            <View style={styles.buttonSpacer} />
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => navigation.goBack()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  form: {
    flex: 1,
  },
  buttons: {
    marginTop: 24,
  },
  buttonSpacer: {
    height: 12,
  },
});

export default AddTaskScreen;
