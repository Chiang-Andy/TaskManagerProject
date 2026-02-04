import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useTasks } from '../context/TaskContext';
import { useSections } from '../context/SectionContext';
import { EmptyState } from '../components';
import { Colors } from '../constants/colors';
import { Priorities } from '../constants/priorities';
import { getColorByKey } from '../constants/sectionColors';

const TrashScreen = ({ navigation }) => {
  const { deletedTasks, restoreTask, permanentDeleteTask, emptyTrash } = useTasks();
  const { getSectionById } = useSections();

  // Sort by deletion date, newest first
  const sortedDeletedTasks = useMemo(() => {
    return [...deletedTasks].sort((a, b) => {
      return new Date(b.deletedAt) - new Date(a.deletedAt);
    });
  }, [deletedTasks]);

  const handleRestore = async (taskId) => {
    await restoreTask(taskId);
  };

  const handlePermanentDelete = (taskId, taskTitle) => {
    Alert.alert(
      'Delete Permanently',
      `Are you sure you want to permanently delete "${taskTitle}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => permanentDeleteTask(taskId),
        },
      ]
    );
  };

  const handleEmptyTrash = () => {
    if (deletedTasks.length === 0) return;

    Alert.alert(
      'Empty Trash',
      `Are you sure you want to permanently delete all ${deletedTasks.length} items? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Empty Trash',
          style: 'destructive',
          onPress: () => emptyTrash(),
        },
      ]
    );
  };

  const getTimeRemaining = (deletedAt) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = expiryDate - now;

    if (diff <= 0) return 'Expires soon';

    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const renderTrashItem = ({ item: task }) => {
    const priority = Priorities[task.priority] || Priorities.medium;
    const section = task.sectionId ? getSectionById(task.sectionId) : null;
    const sectionColor = section ? getColorByKey(section.color) : null;
    const timeRemaining = getTimeRemaining(task.deletedAt);

    return (
      <View style={styles.taskCard}>
        <View style={styles.taskContent}>
          <View style={styles.titleRow}>
            <View style={styles.trashIcon}>
              <Text style={styles.trashEmoji}>🗑</Text>
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
            <View style={styles.expiryTag}>
              <Text style={styles.expiryText}>{timeRemaining}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={() => handleRestore(task._id)}
          >
            <Text style={styles.restoreIcon}>↩</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handlePermanentDelete(task._id, task.title)}
          >
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (sortedDeletedTasks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          message="Trash is empty"
          subtitle="Deleted tasks will appear here for 24 hours"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {deletedTasks.length} item{deletedTasks.length !== 1 ? 's' : ''} in trash
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={handleEmptyTrash}>
          <Text style={styles.emptyButtonText}>Empty Trash</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          Items are permanently deleted after 24 hours
        </Text>
      </View>
      <FlatList
        data={sortedDeletedTasks}
        renderItem={renderTrashItem}
        keyExtractor={(item) => item._id}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyButton: {
    backgroundColor: Colors.error + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  infoBar: {
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.warning,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
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
    opacity: 0.8,
  },
  taskContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trashIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashEmoji: {
    fontSize: 16,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
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
  expiryTag: {
    backgroundColor: Colors.error + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  expiryText: {
    fontSize: 10,
    color: Colors.error,
    fontWeight: '500',
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
    backgroundColor: Colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreIcon: {
    color: Colors.success,
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

export default TrashScreen;
