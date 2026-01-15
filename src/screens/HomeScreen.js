import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useTasks } from '../context/TaskContext';
import { useSections } from '../context/SectionContext';
import { TaskItem, EmptyState } from '../components';
import { Colors } from '../constants/colors';
import { getColorByKey } from '../constants/sectionColors';

const HomeScreen = ({ navigation }) => {
  const { tasks, toggleTask, deleteTask } = useTasks();
  const { sections, getSectionById } = useSections();
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  const filteredTasks = selectedSectionId
    ? tasks.filter((task) => task.sectionId === selectedSectionId)
    : tasks;

  const pendingTasks = filteredTasks.filter((task) => !task.completed);
  const completedTasks = filteredTasks.filter((task) => task.completed);

  const renderTask = ({ item }) => (
    <TaskItem
      task={item}
      section={item.sectionId ? getSectionById(item.sectionId) : null}
      onToggle={() => toggleTask(item.id)}
      onDelete={() => deleteTask(item.id)}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
    />
  );

  const renderSectionHeader = (title, count) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>My Tasks</Text>
          <TouchableOpacity
            style={styles.sectionsButton}
            onPress={() => navigation.navigate('Sections')}
          >
            <Text style={styles.sectionsButtonText}>Files</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          {pendingTasks.length} pending, {completedTasks.length} completed
        </Text>
      </View>

      {sections.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
          style={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedSectionId && styles.filterChipSelected,
            ]}
            onPress={() => setSelectedSectionId(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedSectionId && styles.filterChipTextSelected,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {sections.map((section) => {
            const colorData = getColorByKey(section.color);
            const isSelected = selectedSectionId === section.id;
            return (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.filterChip,
                  { borderColor: colorData.color },
                  isSelected && { backgroundColor: colorData.color },
                ]}
                onPress={() => setSelectedSectionId(section.id)}
              >
                <View
                  style={[
                    styles.filterDot,
                    { backgroundColor: isSelected ? Colors.textLight : colorData.color },
                  ]}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? Colors.textLight : colorData.color },
                  ]}
                  numberOfLines={1}
                >
                  {section.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {filteredTasks.length === 0 ? (
        <EmptyState
          message={selectedSectionId ? 'No tasks in this file' : 'No tasks yet'}
          subtitle={selectedSectionId ? 'Add a task to this file' : 'Add a task to get started!'}
        />
      ) : (
        <FlatList
          data={[...pendingTasks, ...completedTasks]}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            pendingTasks.length > 0
              ? renderSectionHeader('Pending', pendingTasks.length)
              : null
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  sectionsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
  },
  sectionsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterScroll: {
    maxHeight: 32,
    marginBottom: 0,
  },
  filterContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  filterChipSelected: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    maxWidth: 100,
  },
  filterChipTextSelected: {
    color: Colors.textLight,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: Colors.textLight,
    lineHeight: 36,
  },
});

export default HomeScreen;
