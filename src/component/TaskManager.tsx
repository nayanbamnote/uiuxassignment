"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus } from "lucide-react"
import { useTaskStore } from "@/lib/store"
import AddCardModal from "./AddCardModal"
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableCard from "./SortableCard"
import EditTaskModal from './EditTaskModal'
import { Task } from "@/types/task"
import SearchBar from "./SearchBar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const COLUMNS = [
  { id: 'general-info', title: 'General Information' },
  { id: 'backlog', title: 'Backlog' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'paused', title: 'Paused' },
  { id: 'completed', title: 'Ready for Launch' },
]

type SortOption = 'none' | 'dateOldest' | 'dateNewest' | 'alphabetical';

export default function TaskManager() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState('')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const tasks = useTaskStore((state) => state.tasks)
  const updateTaskTitle = useTaskStore((state) => state.updateTaskTitle)
  const [activeId, setActiveId] = useState<string | null>(null);
  const reorderTasks = useTaskStore((state) => state.reorderTasks);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [columnSortOptions, setColumnSortOptions] = useState<Record<string, SortOption>>({});
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleTitleSubmit = (taskId: string) => {
    if (editingTitle.trim()) {
      updateTaskTitle(taskId, editingTitle.trim())
    }
    setEditingTaskId(null)
    setEditingTitle('')
  }

  const handleEditCancel = () => {
    setEditingTaskId(null)
    setEditingTitle('')
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
      if (!matchesSearch) return false

      switch (filterType) {
        case "no-date":
          return !task.startDate && !task.endDate
        case "has-comments":
          return task.comments && task.comments > 0
        case "has-assignee":
          return task.assignee || (task.assignees && task.assignees.length > 0)
        case "has-tags":
          return task.tags && task.tags.length > 0
        default:
          return true
      }
    })
  }, [tasks, searchTerm, filterType])

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setFilterType("all")
  }

  const getSortedTasks = (tasks: Task[], sortOption: SortOption) => {
    if (sortOption === 'none') return tasks;

    return [...tasks].sort((a, b) => {
      switch (sortOption) {
        case 'dateOldest':
          return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
        case 'dateNewest':
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const draggedTask = tasks.find(task => task.id === event.active.id);
    if (draggedTask) {
      setColumnSortOptions(prev => ({
        ...prev,
        [draggedTask.status]: 'none'
      }));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      reorderTasks(active.id as string, over.id as string);
    }
    
    setActiveId(null);
  };

  return (
    <div className="min-h-screen bg-[#3B82F6] p-6">
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterChange={setFilterType}
        onClear={handleClearSearch}
      />
      <div className="mt-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {COLUMNS.map((column) => {
              let columnTasks = getTasksByStatus(column.id);
              columnTasks = getSortedTasks(columnTasks, columnSortOptions[column.id] || 'none');
              
              return (
                <div key={column.id} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-white">{column.title}</h2>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-blue-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setColumnSortOptions(prev => ({
                            ...prev,
                            [column.id]: 'dateOldest'
                          }))}
                        >
                          Date created (oldest first)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setColumnSortOptions(prev => ({
                            ...prev,
                            [column.id]: 'dateNewest'
                          }))}
                        >
                          Date created (newest first)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setColumnSortOptions(prev => ({
                            ...prev,
                            [column.id]: 'alphabetical'
                          }))}
                        >
                          Card name (alphabetically)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-col gap-2">
                    <SortableContext
                      items={columnTasks.map(task => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {columnTasks.map((task) => (
                        <SortableCard
                          key={task.id}
                          task={task}
                          isEditing={editingTaskId === task.id}
                          editProps={
                            editingTaskId === task.id
                              ? {
                                  value: editingTitle,
                                  onChange: (e) => setEditingTitle(e.target.value),
                                  onKeyDown: (e) => {
                                    if (e.key === 'Enter') {
                                      handleTitleSubmit(task.id);
                                    } else if (e.key === 'Escape') {
                                      handleEditCancel();
                                    }
                                  },
                                  onSave: () => handleTitleSubmit(task.id),
                                  onCancel: handleEditCancel,
                                }
                              : undefined
                          }
                          onEdit={() => {
                            setEditingTaskId(task.id);
                            setEditingTitle(task.title);
                          }}
                          onOpenEditModal={() => {
                            setSelectedTask(task);
                            setIsEditModalOpen(true);
                          }}
                        />
                      ))}
                    </SortableContext>
                    
                    <Button
                      variant="ghost"
                      className="flex w-full items-center justify-between bg-white/10 text-white hover:bg-white/20"
                      onClick={() => {
                        setSelectedColumn(column.id);
                        setIsModalOpen(true);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add a card
                      </span>
                      <span className="flex gap-2 text-xs">
                        <span>⌘</span>
                        <span>⏎</span>
                      </span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>

      <AddCardModal 
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        columnId={selectedColumn}
      />

      {selectedTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
        />
      )}
    </div>
  )
}