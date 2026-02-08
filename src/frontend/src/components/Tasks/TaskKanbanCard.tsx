import { Task, TaskStatus } from '../../backend';
import { useDeleteTask } from '../../hooks/tasks/useDeleteTask';
import { useUpdateTaskStatus } from '../../hooks/tasks/useUpdateTaskStatus';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, Calendar, Loader2, CheckCircle2, Circle, Copy, Archive, ArchiveRestore } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmDialog from '../Shared/ConfirmDialog';
import { useState } from 'react';
import { getDueDateBadge, isTaskOverdue } from './taskUtils';

interface TaskKanbanCardProps {
  task: Task;
  onEdit: (taskId: bigint) => void;
  onDuplicate?: (task: Task) => void;
}

export default function TaskKanbanCard({ task, onEdit, onDuplicate }: TaskKanbanCardProps) {
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

  const priorityLabel = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  }[task.priority];

  return (
    <>
      <Card
        className={`mb-3 hover:shadow-md transition-shadow ${
          isOverdue ? 'border-l-4 border-l-destructive bg-destructive/5' : ''
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold line-clamp-2">{task.title}</CardTitle>
            <div className="flex items-center gap-1 flex-shrink-0">
              {onDuplicate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDuplicate(task)}
                  disabled={isPending}
                  className="h-7 w-7"
                  title="Duplicate"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleArchive}
                disabled={isPending}
                className="h-7 w-7"
                title={task.status === TaskStatus.archived ? 'Unarchive' : 'Archive'}
              >
                {task.status === TaskStatus.archived ? (
                  <ArchiveRestore className="h-3.5 w-3.5" />
                ) : (
                  <Archive className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(task.id)}
                disabled={isPending}
                className="h-7 w-7"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isPending}
                className="h-7 w-7 text-destructive hover:text-destructive"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1">
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
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
              <Calendar className="h-3 w-3" />
              {format(new Date(Number(task.dueDate) / 1_000_000), 'MMM d, yyyy')}
            </div>
          )}
          <Button
            variant={task.status === TaskStatus.completed ? 'outline' : 'default'}
            size="sm"
            onClick={handleToggleComplete}
            disabled={isPending}
            className="w-full gap-2"
          >
            {isUpdatingStatus ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : task.status === TaskStatus.completed ? (
              <Circle className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            {task.status === TaskStatus.completed ? 'Reopen' : 'Complete'}
          </Button>
        </CardContent>
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
