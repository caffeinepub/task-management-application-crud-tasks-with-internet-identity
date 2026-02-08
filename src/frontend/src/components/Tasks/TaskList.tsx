import { Task } from '../../backend';
import TaskItem from './TaskItem';
import TaskListSkeleton from './TaskListSkeleton';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (taskId: bigint) => void;
  onDuplicate?: (task: Task) => void;
}

export default function TaskList({ tasks, isLoading, onEdit, onDuplicate }: TaskListProps) {
  if (isLoading) {
    return <TaskListSkeleton />;
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <img
          src="/assets/generated/empty-state-clipboard.dim_1200x800.png"
          alt="No tasks"
          className="w-64 h-auto mb-6 opacity-80"
        />
        <h3 className="font-semibold text-lg mb-1">No tasks found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Create your first task to get started, or adjust your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id.toString()}
          task={task}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}
