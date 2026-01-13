import { Colors } from './colors';

export const Priorities = {
  low: {
    key: 'low',
    label: 'Low',
    color: Colors.success,
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    color: Colors.warning,
  },
  high: {
    key: 'high',
    label: 'High',
    color: Colors.error,
  },
};

export const PriorityList = [Priorities.low, Priorities.medium, Priorities.high];
