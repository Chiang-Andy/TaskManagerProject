import React, { useState, useMemo } from 'react';
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
import { TaskItem, EmptyState, FilterModal } from '../components';
import { Colors } from '../constants/colors';
import { getColorByKey } from '../constants/sectionColors';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const HomeScreen = ({ navigation }) => {
  const { tasks, toggleTask, deleteTask } = useTasks();
  const { sections, getSectionById } = useSections();
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  // Filter & Sort state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState('dueDate');
  const [filterPriority, setFilterPriority] = useState('all');
  const [hideCompleted, setHideCompleted] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = sortBy !== 'dueDate' || filterPriority !== 'all' || hideCompleted;

  // Apply section filter
  const sectionFilteredTasks = selectedSectionId
    ? tasks.filter((task) => task.sectionId === selectedSectionId)
    : tasks;

  // Apply priority filter
  const priorityFilteredTasks = filterPriority === 'all'
    ? sectionFilteredTasks
    : sectionFilteredTasks.filter((task) => task.priority === filterPriority);

  // Split into pending and completed
  const pendingTasks = priorityFilteredTasks.filter((task) => !task.completed);
  const completedTasks = hideCompleted
    ? []
    : priorityFilteredTasks.filter((task) => task.completed);

  // Sort function based on sortBy
  const sortTasks = (tasksToSort) => {
    return [...tasksToSort].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'dueDate':
        default:
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
      }
    });
  };

  // Categorize pending tasks by due date (only when sorting by dueDate)
  const categorizedTasks = useMemo(() => {
    if (sortBy !== 'dueDate') {
      // When not sorting by due date, just return all pending tasks sorted
      return { all: sortTasks(pendingTasks) };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(today);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const upcoming7Days = new Date(today);
    upcoming7Days.setDate(upcoming7Days.getDate() + 7);

    const overdue = [];
    const dueToday = [];
    const upcoming = [];
    const other = [];

    pendingTasks.forEach((task) => {
      if (!task.dueDate) {
        other.push(task);
      } else {
        const taskDate = new Date(task.dueDate);
        if (taskDate < today) {
          overdue.push(task);
        } else if (taskDate >= today && taskDate < todayEnd) {
          dueToday.push(task);
        } else if (taskDate >= todayEnd && taskDate < upcoming7Days) {
          upcoming.push(task);
        } else {
          other.push(task);
        }
      }
    });

    // Sort each category by due date
    const sortByDueDate = (a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    };
    overdue.sort(sortByDueDate);
    dueToday.sort(sortByDueDate);
    upcoming.sort(sortByDueDate);
    other.sort(sortByDueDate);

    return { overdue, dueToday, upcoming, other };
  }, [pendingTasks, sortBy]);

  const pendingCount = pendingTasks.length;

  const renderTask = (task) => (
    <TaskItem
      key={task._id}
      task={task}
      section={task.sectionId ? getSectionById(task.sectionId) : null}
      onToggle={() => toggleTask(task._id)}
      onDelete={() => deleteTask(task._id)}
      onPress={() => navigation.navigate('TaskDetail', { taskId: task._id })}
    />
  );

  const renderSectionHeader = (title, count, color = Colors.primary) => (
    <View style={styles.sectionHeader} key={`header-${title}`}>
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      <View style={[styles.badge, { backgroundColor: color + '20' }]}>
        <Text style={[styles.badgeText, { color }]}>{count}</Text>
      </View>
    </View>
  );

  // Build the list data with headers and tasks
  const listData = useMemo(() => {
    const data = [];

    if (sortBy === 'dueDate') {
      // Show categorized by due date
      if (categorizedTasks.overdue?.length > 0) {
        data.push({ type: 'header', title: 'Overdue', count: categorizedTasks.overdue.length, color: Colors.error });
        categorizedTasks.overdue.forEach((task) => data.push({ type: 'task', task }));
      }

      if (categorizedTasks.dueToday?.length > 0) {
        data.push({ type: 'header', title: 'Today', count: categorizedTasks.dueToday.length, color: Colors.primary });
        categorizedTasks.dueToday.forEach((task) => data.push({ type: 'task', task }));
      }

      if (categorizedTasks.upcoming?.length > 0) {
        data.push({ type: 'header', title: 'Upcoming', count: categorizedTasks.upcoming.length, color: Colors.success });
        categorizedTasks.upcoming.forEach((task) => data.push({ type: 'task', task }));
      }

      if (categorizedTasks.other?.length > 0) {
        data.push({ type: 'header', title: 'Other', count: categorizedTasks.other.length, color: Colors.textSecondary });
        categorizedTasks.other.forEach((task) => data.push({ type: 'task', task }));
      }
    } else {
      // Show all pending tasks with a single header
      if (categorizedTasks.all?.length > 0) {
        const sortLabel = {
          priority: 'By Priority',
          createdAt: 'By Created Date',
          alphabetical: 'Alphabetical',
        }[sortBy];
        data.push({ type: 'header', title: `Pending (${sortLabel})`, count: categorizedTasks.all.length, color: Colors.primary });
        categorizedTasks.all.forEach((task) => data.push({ type: 'task', task }));
      }
    }

    if (completedTasks.length > 0) {
      data.push({ type: 'header', title: 'Completed', count: completedTasks.length, color: Colors.textSecondary });
      sortTasks(completedTasks).forEach((task) => data.push({ type: 'task', task }));
    }

    return data;
  }, [categorizedTasks, completedTasks, sortBy]);

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return renderSectionHeader(item.title, item.count, item.color);
    }
    return renderTask(item.task);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>My Tasks</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Calendar')}
            >
              <Text style={styles.iconButtonText}>📅</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('History')}
            >
              <Text style={styles.iconButtonText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Trash')}
            >
              <Text style={styles.iconButtonText}>🗑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sectionsButton}
              onPress={() => navigation.navigate('Sections')}
            >
              <Text style={styles.sectionsButtonText}>Files</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {pendingCount} pending, {completedTasks.length} completed
          {hasActiveFilters && ' (filtered)'}
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
            const isSelected = selectedSectionId === section._id;
            return (
              <TouchableOpacity
                key={section._id}
                style={[
                  styles.filterChip,
                  { borderColor: colorData.color },
                  isSelected && { backgroundColor: colorData.color },
                ]}
                onPress={() => setSelectedSectionId(section._id)}
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

      {listData.length === 0 ? (
        <EmptyState
          message={selectedSectionId ? 'No tasks in this file' : hasActiveFilters ? 'No tasks match filters' : 'No tasks yet'}
          subtitle={selectedSectionId ? 'Add a task to this file' : hasActiveFilters ? 'Try adjusting your filters' : 'Add a task to get started!'}
        />
      ) : (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.type === 'header' ? `header-${item.title}` : item.task._id
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={[styles.settingsButton, hasActiveFilters && styles.settingsButtonActive]}
        onPress={() => setShowFilterModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.settingsButtonText}>⚙</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        hideCompleted={hideCompleted}
        setHideCompleted={setHideCompleted}
      />
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: Colors.primary,
  },
  iconButtonText: {
    fontSize: 16,
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
    paddingTop: 12,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingsButton: {
    position: 'absolute',
    left: 20,
    bottom: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingsButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  settingsButtonText: {
    fontSize: 22,
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
