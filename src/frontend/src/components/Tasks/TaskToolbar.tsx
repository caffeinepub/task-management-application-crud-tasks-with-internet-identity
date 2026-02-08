import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskStatus, TaskPriority } from '../../backend';
import { Search, ArrowUpDown, X, AlertCircle, Clock, Zap, CheckCircle } from 'lucide-react';

interface TaskToolbarProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'alphabetical';
  onSortByChange: (value: 'createdAt' | 'dueDate' | 'priority' | 'alphabetical') => void;
  sortDirection: 'asc' | 'desc';
  onSortDirectionChange: (value: 'asc' | 'desc') => void;
  statusFilter: TaskStatus | 'all';
  onStatusFilterChange: (value: TaskStatus | 'all') => void;
  priorityFilter: TaskPriority | 'all';
  onPriorityFilterChange: (value: TaskPriority | 'all') => void;
  dueDateFilter: 'all' | 'today' | 'thisWeek' | 'overdue';
  onDueDateFilterChange: (value: 'all' | 'today' | 'thisWeek' | 'overdue') => void;
}

export default function TaskToolbar({
  searchText,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortDirectionChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  dueDateFilter,
  onDueDateFilterChange,
}: TaskToolbarProps) {
  const toggleSortDirection = () => {
    onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || dueDateFilter !== 'all';

  const clearFilters = () => {
    onStatusFilterChange('all');
    onPriorityFilterChange('all');
    onDueDateFilterChange('all');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={toggleSortDirection}>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as TaskStatus | 'all')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={TaskStatus.open}>Open</SelectItem>
            <SelectItem value={TaskStatus.inProgress}>In Progress</SelectItem>
            <SelectItem value={TaskStatus.completed}>Completed</SelectItem>
            <SelectItem value={TaskStatus.archived}>Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => onPriorityFilterChange(v as TaskPriority | 'all')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value={TaskPriority.urgent}>Urgent</SelectItem>
            <SelectItem value={TaskPriority.high}>High</SelectItem>
            <SelectItem value={TaskPriority.medium}>Medium</SelectItem>
            <SelectItem value={TaskPriority.low}>Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dueDateFilter} onValueChange={onDueDateFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Due Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Due Today</SelectItem>
            <SelectItem value="thisWeek">This Week</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-3 w-3" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={dueDateFilter === 'overdue' ? 'destructive' : 'outline'}
          className="cursor-pointer gap-1"
          onClick={() => onDueDateFilterChange(dueDateFilter === 'overdue' ? 'all' : 'overdue')}
        >
          <AlertCircle className="h-3 w-3" />
          Overdue
        </Badge>
        <Badge
          variant={dueDateFilter === 'today' ? 'default' : 'outline'}
          className="cursor-pointer gap-1"
          onClick={() => onDueDateFilterChange(dueDateFilter === 'today' ? 'all' : 'today')}
        >
          <Clock className="h-3 w-3" />
          Due Today
        </Badge>
        <Badge
          variant={priorityFilter === TaskPriority.high ? 'default' : 'outline'}
          className="cursor-pointer gap-1"
          onClick={() => onPriorityFilterChange(priorityFilter === TaskPriority.high ? 'all' : TaskPriority.high)}
        >
          <Zap className="h-3 w-3" />
          High Priority
        </Badge>
        <Badge
          variant={statusFilter === TaskStatus.completed ? 'secondary' : 'outline'}
          className="cursor-pointer gap-1"
          onClick={() => onStatusFilterChange(statusFilter === TaskStatus.completed ? 'all' : TaskStatus.completed)}
        >
          <CheckCircle className="h-3 w-3" />
          Completed
        </Badge>
      </div>
    </div>
  );
}
