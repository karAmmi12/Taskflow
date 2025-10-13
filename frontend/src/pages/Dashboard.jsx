import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import Navbar from '../components/Layout/Navbar';
import KanbanColumn from '../components/Board/KanbanColumn';
import TaskModal from '../components/Task/TaskModal';
import FilterBar from '../components/Board/FilterBar';
import TaskCard from '../components/Task/TaskCard';
import useTaskStore from '../store/taskStore';

const Dashboard = () => {
  const {
    tasks,
    stats,
    filters,
    loading,
    fetchTasks,
    fetchStats,
    createTask,
    updateTask,
    deleteTask,
    setFilters,
    resetFilters,
  } = useTaskStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  // Grouper les tâches par statut
  const tasksByStatus = {
    todo: tasks.filter((task) => task.status === 'todo'),
    in_progress: tasks.filter((task) => task.status === 'in_progress'),
    done: tasks.filter((task) => task.status === 'done'),
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      await updateTask(taskId, { status: newStatus });
    }
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      await deleteTask(taskId);
    }
  };

  const handleModalSubmit = async (taskData) => {
    if (editingTask) {
      const result = await updateTask(editingTask.id, taskData);
      if (result.success) {
        setIsModalOpen(false);
        setEditingTask(null);
      }
    } else {
      const result = await createTask(taskData);
      if (result.success) {
        setIsModalOpen(false);
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Tableau Kanban
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gérez vos tâches avec facilité
          </p>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          onNewTask={handleNewTask}
          stats={stats}
        />

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column: To Do */}
            <KanbanColumn
              id="todo"
              title="À faire"
              tasks={tasksByStatus.todo}
              color="bg-slate-400"
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />

            {/* Column: In Progress */}
            <KanbanColumn
              id="in_progress"
              title="En cours"
              tasks={tasksByStatus.in_progress}
              color="bg-yellow-400"
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />

            {/* Column: Done */}
            <KanbanColumn
              id="done"
              title="Terminé"
              tasks={tasksByStatus.done}
              color="bg-green-400"
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 scale-105">
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Loading state */}
        {loading && (
          <div className="text-center text-slate-600 dark:text-slate-400 mt-4">
            Chargement des tâches...
          </div>
        )}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          initialData={editingTask}
        />
      )}
    </div>
  );
};

export default Dashboard;