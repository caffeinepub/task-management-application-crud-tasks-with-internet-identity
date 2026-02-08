import { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../../backend';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, X } from 'lucide-react';

interface DueAlertsBannerProps {
  tasks: Task[];
}

export default function DueAlertsBanner({ tasks }: DueAlertsBannerProps) {
  const [dismissedOverdue, setDismissedOverdue] = useState(false);
  const [dismissedDueSoon, setDismissedDueSoon] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('dismissedAlerts');
    if (dismissed) {
      const { overdue, dueSoon } = JSON.parse(dismissed);
      setDismissedOverdue(overdue);
      setDismissedDueSoon(dueSoon);
    }
  }, []);

  const now = Date.now() * 1_000_000;
  const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1_000_000_000;

  let overdueCount = 0;
  let dueSoonCount = 0;

  for (const task of tasks) {
    if (task.status === TaskStatus.completed || !task.dueDate) continue;
    const dueDate = Number(task.dueDate);
    if (dueDate < now) {
      overdueCount++;
    } else if (dueDate <= sevenDaysFromNow) {
      dueSoonCount++;
    }
  }

  const handleDismissOverdue = () => {
    setDismissedOverdue(true);
    sessionStorage.setItem('dismissedAlerts', JSON.stringify({ overdue: true, dueSoon: dismissedDueSoon }));
  };

  const handleDismissDueSoon = () => {
    setDismissedDueSoon(true);
    sessionStorage.setItem('dismissedAlerts', JSON.stringify({ overdue: dismissedOverdue, dueSoon: true }));
  };

  return (
    <>
      {overdueCount > 0 && !dismissedOverdue && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You have <strong>{overdueCount}</strong> overdue task{overdueCount !== 1 ? 's' : ''} that need attention.
            </span>
            <Button variant="ghost" size="sm" onClick={handleDismissOverdue}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {dueSoonCount > 0 && !dismissedDueSoon && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You have <strong>{dueSoonCount}</strong> task{dueSoonCount !== 1 ? 's' : ''} due in the next 7 days.
            </span>
            <Button variant="ghost" size="sm" onClick={handleDismissDueSoon}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
