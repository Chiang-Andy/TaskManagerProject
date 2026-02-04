import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors } from '../constants/colors';
import { Priorities } from '../constants/priorities';
import { getColorByKey } from '../constants/sectionColors';

const SWIPE_THRESHOLD = 80;

const TaskItem = ({ task, section, onToggle, onDelete, onPress }) => {
  const swipeableRef = useRef(null);
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

  // Auto-trigger on full swipe
  // direction = which panel opened ('left' = left panel = user swiped right, 'right' = right panel = user swiped left)
  const handleSwipeOpen = (direction) => {
    if (direction === 'left') {
      // Left panel opened = user swiped right = toggle complete
      onToggle();
    } else if (direction === 'right') {
      // Right panel opened = user swiped left = delete
      onDelete();
    }
    swipeableRef.current?.close();
  };

  // Right swipe action (Delete) - scales with drag
  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-120, -SWIPE_THRESHOLD, 0],
      outputRange: [1.3, 1, 0.5],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-SWIPE_THRESHOLD, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActionContainer}>
        <Animated.View style={[styles.actionContent, { transform: [{ scale }], opacity }]}>
          <Text style={styles.actionIcon}>🗑</Text>
          <Text style={styles.actionText}>Delete</Text>
        </Animated.View>
      </View>
    );
  };

  // Left swipe action (Complete/Uncomplete) - scales with drag
  const renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [0, SWIPE_THRESHOLD, 120],
      outputRange: [0.5, 1, 1.3],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [0, SWIPE_THRESHOLD],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.leftActionContainer, task.completed && styles.leftActionUncomplete]}>
        <Animated.View style={[styles.actionContent, { transform: [{ scale }], opacity }]}>
          <Text style={styles.actionIcon}>{task.completed ? '↩' : '✓'}</Text>
          <Text style={styles.actionText}>
            {task.completed ? 'Restore' : 'Done'}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.swipeContainer}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        rightThreshold={SWIPE_THRESHOLD}
        leftThreshold={SWIPE_THRESHOLD}
        overshootRight={false}
        overshootLeft={false}
        onSwipeableOpen={handleSwipeOpen}
        friction={2}
      >
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
        </Pressable>
      </Swipeable>
    </View>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
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
  // Swipe actions
  rightActionContainer: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  leftActionContainer: {
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
  },
  leftActionUncomplete: {
    backgroundColor: Colors.primary,
  },
  actionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TaskItem;
