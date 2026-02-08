import { useState } from 'react';
import { useUpdateTaskStatus } from '../../hooks/tasks/useUpdateTaskStatus';
import { useDeleteTask } from '../../hooks/tasks/useDeleteTask';
import { TaskStatus } from '../../backend';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Archive, Trash2, X, Loader2 } from 'lucide-react';
import ConfirmDialog from '../Shared/ConfirmDialog';

interface TaskBulkActionsBarProps {
  selectedTaskIds: bigint[];
  onClearSelection: () => void;
}

export default function TaskBulkActionsBar({ selectedTaskIds, onClearSelection }: TaskBulkActionsBarProps) {
  const { mutate: updateStatus } = useUpdateTaskStatus();
  const { mutate: deleteTask } = useDeleteTask();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkComplete = async () => {
    setIsProcessing(true);
    for (const taskId of selectedTaskIds) {
      updateStatus({ taskId, newStatus: TaskStatus.completed });
    }
    setTimeout(() => {
      setIsProcessing(false);
      onClearSelection();
    }, 500);
  };

  const handleBulkArchive = async () => {
    setIsProcessing(true);
    for (const taskId of selectedTaskIds) {
      updateStatus({ taskId, newStatus: TaskStatus.archived });
    }
    setTimeout(() => {
      setIsProcessing(false);
      onClearSelection();
    }, 500);
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    for (const taskId of selectedTaskIds) {
      deleteTask(taskId);
    }
    setTimeout(() => {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
      onClearSelection();
    }, 500);
  };

  return (
    <>
      <Alert>
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? 's' : ''} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkComplete}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Complete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkArchive}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Archive className="h-3.5 w-3.5" />}
              Archive
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isProcessing}
              className="gap-2 text-destructive hover:text-destructive"
            >
              {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={isProcessing}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleBulkDelete}
        title="Delete Multiple Tasks"
        description={`Are you sure you want to delete ${selectedTaskIds.length} task${selectedTaskIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete All"
        isLoading={isProcessing}
      />
    </>
  );
}
