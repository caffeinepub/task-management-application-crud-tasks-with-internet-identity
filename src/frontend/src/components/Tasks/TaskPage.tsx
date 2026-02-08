import { useState } from 'react';
import { useTasks } from '../../hooks/tasks/useTasks';
import { useCreateTask } from '../../hooks/tasks/useCreateTask';
import { TaskStatus, TaskPriority } from '../../backend';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import TaskKanbanView from './TaskKanbanView';
import TaskToolbar from './TaskToolbar';
import TaskBulkActionsBar from './TaskBulkActionsBar';
import DueAlertsBanner from './DueAlertsBanner';
import CommandPalette from './CommandPalette';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { filterAndSortTasks, computeDashboardMetrics } from './taskUtils';
import { Plus, ListTodo, LayoutGrid, List, TrendingUp, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

type ViewMode = 'list' | 'kanban';

export default function TaskPage() {
  const { data: tasks = [], isLoading, error } = useTasks();
  const { mutate: createTask } = useCreateTask();
  
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority' | 'alphabetical'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [dueDateFilter, setDueDateFilter] = useState<'all' | 'today' | 'thisWeek' | 'overdue'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<bigint | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTasks, setSelectedTasks] = useState<Set<bigint>>(new Set());
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const filteredTasks = filterAndSortTasks(tasks, {
    searchText,
    sortBy,
    sortDirection,
    statusFilter,
    priorityFilter,
    dueDateFilter,
    tagsFilter: [],
  });

  const metrics = computeDashboardMetrics(tasks);

  const handleEdit = (taskId: bigint) => {
    setEditingTaskId(taskId);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTaskId(null);
  };

  const handleDuplicate = (task: typeof tasks[0]) => {
    createTask({
      title: `${task.title} (Copy)`,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      tags: task.tags,
    });
  };

  const handleSelectTask = (taskId: bigint, selected: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (selected) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedTasks(new Set());
  };

  useKeyboardShortcuts({
    onNewTask: () => setShowForm(true),
    onSearch: () => {
      const searchInput = document.querySelector('input[placeholder="Search tasks..."]') as HTMLInputElement;
      searchInput?.focus();
    },
    onCommandPalette: () => setShowCommandPalette(true),
  });

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Tasks</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <DueAlertsBanner tasks={tasks} />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Tasks</h2>
          <p className="text-muted-foreground mt-1">Manage your tasks efficiently</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open Tasks</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.open}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Today</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completedToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.overdue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Due This Week</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.dueThisWeek}</div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTaskId ? 'Edit Task' : 'Create New Task'}</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm taskId={editingTaskId} onClose={handleFormClose} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              <CardTitle>Tasks</CardTitle>
              <Badge variant="secondary">{filteredTasks.length}</Badge>
            </div>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                List
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <TaskToolbar
            searchText={searchText}
            onSearchChange={setSearchText}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortDirection={sortDirection}
            onSortDirectionChange={setSortDirection}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            dueDateFilter={dueDateFilter}
            onDueDateFilterChange={setDueDateFilter}
          />

          <Separator />

          {selectedTasks.size > 0 && (
            <TaskBulkActionsBar
              selectedTaskIds={Array.from(selectedTasks)}
              onClearSelection={handleClearSelection}
            />
          )}

          {viewMode === 'list' ? (
            <TaskList
              tasks={filteredTasks}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              selectedTasks={selectedTasks}
              onSelectTask={handleSelectTask}
            />
          ) : (
            <TaskKanbanView
              tasks={filteredTasks}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
            />
          )}
        </CardContent>
      </Card>

      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        onNewTask={() => {
          setShowCommandPalette(false);
          setShowForm(true);
        }}
        onSearch={() => {
          setShowCommandPalette(false);
          const searchInput = document.querySelector('input[placeholder="Search tasks..."]') as HTMLInputElement;
          searchInput?.focus();
        }}
        onToggleView={() => {
          setShowCommandPalette(false);
          setViewMode(viewMode === 'list' ? 'kanban' : 'list');
        }}
      />
    </div>
  );
}
