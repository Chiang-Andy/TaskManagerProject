import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTasks } from '../context/TaskContext';
import { useSections } from '../context/SectionContext';
import { EmptyState } from '../components';
import { Colors } from '../constants/colors';
import { Priorities } from '../constants/priorities';
import { getColorByKey } from '../constants/sectionColors';

const HistoryScreen = ({ navigation }) => {
  const { tasks, toggleTask, deleteTask } = useTasks();
  const { getSectionById } = useSections();

  // Get only completed tasks, sorted by completion date
  const completedTasks = useMemo(() => {
    return tasks
      .filter((task) => task.completed)
      .sort((a, b) => {
        const dateA = a.completedAt || a.createdAt;
        const dateB = b.completedAt || b.createdAt;
        return new Date(dateB) - new Date(dateA);
      });
  }, [tasks]);

  // Group tasks by date category
  const groupedTasks = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    completedTasks.forEach((task) => {
      const taskDate = new Date(task.completedAt || task.createdAt);
      const taskDay = new Date(
        taskDate.getFullYear(),
        taskDate.getMonth(),
        taskDate.getDate()
      );

      if (taskDay.getTime() === today.getTime()) {
        groups.today.push(task);
      } else if (taskDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(task);
      } else if (taskDay >= thisWeekStart) {
        groups.thisWeek.push(task);
      } else {
        groups.older.push(task);
      }
    });

    return groups;
  }, [completedTasks]);

  const renderHistoryItem = ({ item: task }) => {
    const priority = Priorities[task.priority] || Priorities.medium;
    const section = task.sectionId ? getSectionById(task.sectionId) : null;
    const sectionColor = section ? getColorByKey(section.color) : null;

    const formatCompletedDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    };

    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => navigation.navigate('TaskDetail', { taskId: task._id })}
      >
        <View style={styles.taskContent}>
          <View style={styles.titleRow}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {task.title}
            </Text>
          </View>
          {task.description ? (
            <Text style={styles.description} numberOfLines={1}>
              {task.description}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            <View
              style={[styles.priorityBadge, { backgroundColor: priority.color + '20' }]}
            >
              <Text style={[styles.priorityText, { color: priority.color }]}>
                {priority.label}
              </Text>
            </View>
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
            <Text style={styles.completedTime}>
              {formatCompletedDate(task.completedAt || task.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={() => toggleTask(task._id)}
          >
            <Text style={styles.restoreIcon}>↩</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteTask(task._id)}
          >
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (title, count) => {
    if (count === 0) return null;
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </View>
    );
  };

  // Combine all groups into a flat list with section headers
  const listData = useMemo(() => {
    const data = [];

    if (groupedTasks.today.length > 0) {
      data.push({ type: 'header', title: 'Today', count: groupedTasks.today.length });
      groupedTasks.today.forEach((task) => data.push({ type: 'task', task }));
    }

    if (groupedTasks.yesterday.length > 0) {
      data.push({ type: 'header', title: 'Yesterday', count: groupedTasks.yesterday.length });
      groupedTasks.yesterday.forEach((task) => data.push({ type: 'task', task }));
    }

    if (groupedTasks.thisWeek.length > 0) {
      data.push({ type: 'header', title: 'This Week', count: groupedTasks.thisWeek.length });
      groupedTasks.thisWeek.forEach((task) => data.push({ type: 'task', task }));
    }

    if (groupedTasks.older.length > 0) {
      data.push({ type: 'header', title: 'Older', count: groupedTasks.older.length });
      groupedTasks.older.forEach((task) => data.push({ type: 'task', task }));
    }

    return data;
  }, [groupedTasks]);

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return renderSectionHeader(item.title, item.count);
    }
    return renderHistoryItem({ item: item.task });
  };

  if (completedTasks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          message="No completed tasks"
          subtitle="Tasks you complete will appear here"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.type === 'header' ? `header-${item.title}` : item.task._id
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: Colors.success + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  taskCard: {
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
  taskContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    marginLeft: 34,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 34,
    gap: 8,
    flexWrap: 'wrap',
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
  completedTime: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restoreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreIcon: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: Colors.error,
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
