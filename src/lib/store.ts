import { create } from 'zustand';
import { Task } from '@/types/task';
import { tasks } from '@/constants/hardCodedTasks';
import { arrayMove } from '@dnd-kit/sortable';

interface TaskState {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, newStatus: string) => void;
  updateTaskTitle: (taskId: string, newTitle: string) => void;
  reorderTasks: (activeId: string, overId: string) => void;
  updateTask: (taskId: string, updatedTask: Task) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: tasks,
  addTask: (task) => 
    set((state) => ({ tasks: [...state.tasks, task] })),
  updateTaskStatus: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ),
    })),
  updateTaskTitle: (taskId, newTitle) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, title: newTitle } : task
      ),
    })),
  reorderTasks: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.tasks.findIndex((task) => task.id === activeId);
      const newIndex = state.tasks.findIndex((task) => task.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return state;
      
      // Only allow reordering within the same status
      if (state.tasks[oldIndex].status !== state.tasks[newIndex].status) {
        return state;
      }
      
      return {
        tasks: arrayMove(state.tasks, oldIndex, newIndex),
      };
    }),
  updateTask: (taskId, updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? updatedTask : task
      ),
    })),
}));