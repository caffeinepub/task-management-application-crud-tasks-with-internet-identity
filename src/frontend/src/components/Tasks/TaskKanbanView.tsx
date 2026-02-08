import { Task, TaskStatus } from '../../backend';
import TaskKanbanCard from './TaskKanbanCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskKanbanViewProps {
  tasks: Task[];
  onEdit: (taskId: bigint) => void;
  onDuplicate?: (task: Task) => void;
}

export default function TaskKanbanView({ tasks, onEdit, onDuplicate }: TaskKanbanViewProps) {
  const openTasks = tasks.filter((t) => t.status === TaskStatus.open);
  const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.inProgress);
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.completed);
  const archivedTasks = tasks.filter((t) => t.status === TaskStatus.archived);

  const columns = [
    { title: 'Open', tasks: openTasks, color: 'primary' },
    { title: 'In Progress', tasks: inProgressTasks, color: 'default' },
    { title: 'Completed', tasks: completedTasks, color: 'secondary' },
    { title: 'Archived', tasks: archivedTasks, color: 'muted' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
      {columns.map((column) => (
        <div key={column.title} className="space-y-3 min-w-[280px]">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {column.title}
            </h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              column.color === 'primary' ? 'bg-primary/10 text-primary' :
              column.color === 'secondary' ? 'bg-secondary text-secondary-foreground' :
              'bg-muted text-muted-foreground'
            }`}>
              {column.tasks.length}
            </span>
          </div>
          <ScrollArea className="h-[600px] pr-4">
            {column.tasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No {column.title.toLowerCase()} tasks
              </div>
            ) : (
              <div>
                {column.tasks.map((task) => (
                  <TaskKanbanCard key={task.id.toString()} task={task} onEdit={onEdit} onDuplicate={onDuplicate} />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
