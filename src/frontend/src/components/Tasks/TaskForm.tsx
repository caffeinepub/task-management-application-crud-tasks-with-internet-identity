import { useState, useEffect } from 'react';
import { useCreateTask } from '../../hooks/tasks/useCreateTask';
import { useUpdateTask } from '../../hooks/tasks/useUpdateTask';
import { useTasks } from '../../hooks/tasks/useTasks';
import { TaskPriority, TaskStatus } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Loader2, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TaskFormProps {
  taskId?: bigint | null;
  onClose: () => void;
}

export default function TaskForm({ taskId, onClose }: TaskFormProps) {
  const { data: tasks = [] } = useTasks();
  const existingTask = taskId ? tasks.find((t) => t.id === taskId) : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.medium);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.open);
  const [tags, setTags] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description);
      if (existingTask.dueDate) {
        setDueDate(new Date(Number(existingTask.dueDate) / 1_000_000));
      }
      setPriority(existingTask.priority);
      setStatus(existingTask.status);
      setTags(existingTask.tags.join(', '));
    }
  }, [existingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrorMessage(null);
    setValidationError(null);

    // Validate required fields
    if (!title.trim()) {
      setValidationError('Task title is required');
      return;
    }

    if (!dueDate) {
      setValidationError('Due date is required');
      return;
    }

    const dueDateNano = BigInt(dueDate.getTime() * 1_000_000);
    const tagsArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (taskId) {
      updateTask(
        {
          taskId,
          title: title.trim(),
          description: description.trim(),
          dueDate: dueDateNano,
          priority,
          tags: tagsArray,
        },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (error) => {
            setErrorMessage(error.message);
          },
        }
      );
    } else {
      createTask(
        {
          title: title.trim(),
          description: description.trim(),
          dueDate: dueDateNano,
          priority,
          tags: tagsArray,
        },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (error) => {
            setErrorMessage(error.message);
          },
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(errorMessage || validationError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage || validationError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Add task details (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isPending}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>
          Due Date <span className="text-destructive">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              disabled={isPending}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
            {dueDate && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setDueDate(undefined)}
                >
                  Clear Date
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {taskId && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TaskStatus.open}>Open</SelectItem>
              <SelectItem value={TaskStatus.inProgress}>In Progress</SelectItem>
              <SelectItem value={TaskStatus.completed}>Completed</SelectItem>
              <SelectItem value={TaskStatus.archived}>Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
          <SelectTrigger id="priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TaskPriority.low}>Low</SelectItem>
            <SelectItem value={TaskPriority.medium}>Medium</SelectItem>
            <SelectItem value={TaskPriority.high}>High</SelectItem>
            <SelectItem value={TaskPriority.urgent}>Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          placeholder="Enter tags separated by commas"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={isPending}
        />
        {tags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags
              .split(',')
              .map((t) => t.trim())
              .filter((t) => t.length > 0)
              .map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
          </div>
        )}
      </div>

      {existingTask && (
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <div>Created: {format(new Date(Number(existingTask.createdAt) / 1_000_000), 'PPP')}</div>
          <div>Updated: {format(new Date(Number(existingTask.updatedAt) / 1_000_000), 'PPP')}</div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending || !title.trim()} className="flex-1">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {taskId ? 'Updating...' : 'Creating...'}
            </>
          ) : taskId ? (
            'Update Task'
          ) : (
            'Create Task'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
