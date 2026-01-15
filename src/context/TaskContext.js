import React, { createContext, useContext } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  // Queries - automatically update when data changes
  const tasks = useQuery(api.tasks.list) ?? [];
  const isLoading = tasks === undefined;

  // Mutations
  const createTask = useMutation(api.tasks.create);
  const updateTaskMutation = useMutation(api.tasks.update);
  const toggleTaskMutation = useMutation(api.tasks.toggleComplete);
  const deleteTaskMutation = useMutation(api.tasks.remove);

  // Wrapper functions to maintain existing API
  const addTask = async (task) => {
    await createTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      sectionId: task.sectionId || null,
      dueDate: task.dueDate || null,
    });
  };

  const deleteTask = async (taskId) => {
    await deleteTaskMutation({ id: taskId });
  };

  const toggleTask = async (taskId) => {
    await toggleTaskMutation({ id: taskId });
  };

  const updateTask = async (taskId, updates) => {
    await updateTaskMutation({ id: taskId, ...updates });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        addTask,
        deleteTask,
        toggleTask,
        updateTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
