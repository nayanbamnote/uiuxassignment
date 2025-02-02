"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Eye, MessageSquare, MoreHorizontal, Plus } from "lucide-react"
import { useTaskStore } from "@/lib/store"
import AddCardModal from "./AddCardModal"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from "@/types/task"

const COLUMNS = [
  { id: 'general-info', title: 'General Information' },
  { id: 'backlog', title: 'Backlog' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'paused', title: 'Paused' },
  { id: 'completed', title: 'Ready for Launch' },
]

function SortableCard({ task, onEdit, isEditing, editProps }: { 
  task: Task; 
  onEdit: () => void;
  isEditing: boolean;
  editProps?: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onSave: () => void;
    onCancel: () => void;
  };
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="bg-white shadow-sm">
        <CardHeader className="p-3 pb-0">
          {task.tags && (
            <div className="flex gap-1 pb-2">
              {task.tags.map((tag) => (
                <div
                  key={tag}
                  className={`h-1.5 w-8 rounded-full ${
                    {
                      purple: "bg-purple-500",
                      blue: "bg-blue-500",
                      cyan: "bg-cyan-500",
                      green: "bg-green-500",
                      pink: "bg-pink-500",
                      red: "bg-red-500",
                    }[tag]
                  }`}
                />
              ))}
            </div>
          )}
          {isEditing && editProps ? (
            <div className="flex gap-2">
              <Input
                value={editProps.value}
                onChange={editProps.onChange}
                onKeyDown={editProps.onKeyDown}
                autoFocus
                className="text-sm font-medium"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={editProps.onSave}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={editProps.onCancel}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <h3
              className="text-sm font-medium cursor-pointer hover:text-blue-600"
              onClick={onEdit}
            >
              {task.title}
            </h3>
          )}
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {task.subtitle && <p className="text-xs text-gray-500">{task.subtitle}</p>}
        </CardContent>
        {(task.views ||
          task.comments ||
          task.date ||
          task.status ||
          task.badge ||
          task.assignee ||
          task.assignees) && (
          <CardFooter className="flex items-center gap-4 p-3 pt-0">
            <div className="flex items-center gap-3 text-gray-500">
              {task.views && (
                <div className="flex items-center gap-1 text-xs">
                  <Eye className="h-4 w-4" />
                  {task.views}
                </div>
              )}
              {task.comments && (
                <div className="flex items-center gap-1 text-xs">
                  <MessageSquare className="h-4 w-4" />
                  {task.comments}
                </div>
              )}
              {task.date && (
                <div className="flex items-center gap-1 text-xs">
                  <Calendar className="h-4 w-4" />
                  {task.date}
                </div>
              )}
              {task.badge && <div className="text-xs">{task.badge}</div>}
              {task.status && <div className="text-xs">Status: {task.status}</div>}
            </div>
            {(task.assignee || task.assignees) && (
              <div className="ml-auto flex -space-x-2">
                {task.assignee && (
                  <Avatar className="h-6 w-6 border-2 border-white">
                    <AvatarImage src={task.assignee} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
                {task.assignees?.map((assignee, i) => (
                  <Avatar key={i} className="h-6 w-6 border-2 border-white">
                    <AvatarImage src={assignee} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default function TaskManager() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState('')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const tasks = useTaskStore((state) => state.tasks)
  const updateTaskTitle = useTaskStore((state) => state.updateTaskTitle)
  const [activeId, setActiveId] = useState<string | null>(null);
  const reorderTasks = useTaskStore((state) => state.reorderTasks);
  
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

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {COLUMNS.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <div key={column.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-white">{column.title}</h2>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-blue-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
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

      <AddCardModal 
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        columnId={selectedColumn}
      />
    </div>
  )
}