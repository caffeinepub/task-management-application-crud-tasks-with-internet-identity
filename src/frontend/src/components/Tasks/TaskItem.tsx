import { Task, TaskStatus } from '../../backend';
import { useDeleteTask } from '../../hooks/tasks/useDeleteTask';
import { useUpdateTaskStatus } from '../../hooks/tasks/useUpdateTaskStatus';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Edit2, Trash2, Calendar, Loader2, Copy, Archive, ArchiveRestore } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmDialog from '../Shared/ConfirmDialog';
import { useState } from 'react';
import { getDueDateBadge, isTaskOverdue } from './taskUtils';

interface TaskItemProps {
  task: Task;
  onEdit: (taskId: bigint) => void;
  onDuplicate?: (task: Task) => void;
}

export default function TaskItem({ task, onEdit, onDuplicate }: TaskItemProps) {
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateTaskStatus();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleComplete = () => {
    const newStatus = task.status === TaskStatus.completed ? TaskStatus.open : TaskStatus.completed;
    updateStatus({ taskId: task.id, newStatus });
  };

  const handleArchive = () => {
    const newStatus = task.status === TaskStatus.archived ? TaskStatus.open : TaskStatus.archived;
    updateStatus({ taskId: task.id, newStatus });
  };

  const handleDelete = () => {
    deleteTask(task.id, {
      onSuccess: () => setShowDeleteConfirm(false),
    });
  };

  const isPending = isUpdatingStatus || isDeleting;
  const isOverdue = isTaskOverdue(task);
  const dueDateBadge = getDueDateBadge(task);

  const statusLabel = {
    [TaskStatus.open]: 'Open',
    [TaskStatus.inProgress]: 'In Progress',
    [TaskStatus.completed]: 'Completed',
    [TaskStatus.archived]: 'Archived',
  }[task.status];

  const priorityLabel = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  }[task.priority];

  return (
    <>
      <Card
        className={`p-4 transition-all ${
          task.status === TaskStatus.completed ? 'opacity-60' : ''
        } ${isOverdue ? 'border-l-4 border-l-destructive bg-destructive/5' : ''}`}
      >
        <div className="flex items-start gap-3">
          <div className="pt-1">
            <Checkbox
              checked={task.status === TaskStatus.completed}
              onCheckedChange={handleToggleComplete}
              disabled={isPending}
              className="h-5 w-5"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className={`font-semibold text-base ${
                  task.status === TaskStatus.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {task.title}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {statusLabel}
                </Badge>
                <Badge
                  variant={
                    task.priority === 'urgent'
                      ? 'destructive'
                      : task.priority === 'high'
                      ? 'default'
                      : 'outline'
                  }
                  className="text-xs"
                >
                  {priorityLabel}
                </Badge>
                {dueDateBadge && (
                  <Badge variant={dueDateBadge.variant} className="text-xs">
                    {dueDateBadge.label}
                  </Badge>
                )}
              </div>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">
                {task.description}
              </p>
            )}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {task.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {task.dueDate && (
                <div className={`flex items-center gap-1 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                  <Calendar className="h-3 w-3" />
                  {format(new Date(Number(task.dueDate) / 1_000_000), 'MMM d, yyyy')}
                </div>
              )}
              <div>Created {format(new Date(Number(task.createdAt) / 1_000_000), 'MMM d, yyyy')}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {onDuplicate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDuplicate(task)}
                disabled={isPending}
                className="h-8 w-8"
                title="Duplicate task"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleArchive}
              disabled={isPending}
              className="h-8 w-8"
              title={task.status === TaskStatus.archived ? 'Unarchive' : 'Archive'}
            >
              {task.status === TaskStatus.archived ? (
                <ArchiveRestore className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(task.id)}
              disabled={isPending}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </>
  );
}
