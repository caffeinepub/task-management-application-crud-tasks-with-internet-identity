import { Task, TaskStatus, TaskPriority } from '../../backend';

export interface FilterSortOptions {
  searchText: string;
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'alphabetical';
  sortDirection: 'asc' | 'desc';
  statusFilter: TaskStatus | 'all';
  priorityFilter: TaskPriority | 'all';
  dueDateFilter: 'all' | 'today' | 'thisWeek' | 'overdue';
  tagsFilter: string[];
}

export function filterAndSortTasks(tasks: Task[], options: Partial<FilterSortOptions>): Task[] {
  let filtered = [...tasks];
  const now = Date.now() * 1_000_000;

  // Apply status filter
  if (options.statusFilter && options.statusFilter !== 'all') {
    filtered = filtered.filter((t) => t.status === options.statusFilter);
  }

  // Apply priority filter
  if (options.priorityFilter && options.priorityFilter !== 'all') {
    filtered = filtered.filter((t) => t.priority === options.priorityFilter);
  }

  // Apply due date filter
  if (options.dueDateFilter && options.dueDateFilter !== 'all') {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);

    filtered = filtered.filter((t) => {
      if (!t.dueDate) return false;
      const dueDate = Number(t.dueDate);

      if (options.dueDateFilter === 'today') {
        return dueDate >= todayStart.getTime() * 1_000_000 && dueDate <= todayEnd.getTime() * 1_000_000;
      } else if (options.dueDateFilter === 'thisWeek') {
        return dueDate >= now && dueDate <= weekEnd.getTime() * 1_000_000;
      } else if (options.dueDateFilter === 'overdue') {
        return dueDate < now && t.status !== TaskStatus.completed;
      }
      return true;
    });
  }

  // Apply tags filter
  if (options.tagsFilter && options.tagsFilter.length > 0) {
    filtered = filtered.filter((t) =>
      options.tagsFilter!.some((tag) => t.tags.includes(tag))
    );
  }

  // Apply search filter
  if (options.searchText && options.searchText.trim()) {
    const searchLower = options.searchText.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
    );
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;

    if (options.sortBy === 'createdAt') {
      comparison = Number(a.createdAt - b.createdAt);
    } else if (options.sortBy === 'dueDate') {
      if (a.dueDate && b.dueDate) {
        comparison = Number(a.dueDate - b.dueDate);
      } else if (a.dueDate && !b.dueDate) {
        comparison = -1;
      } else if (!a.dueDate && b.dueDate) {
        comparison = 1;
      } else {
        comparison = Number(a.createdAt - b.createdAt);
      }
    } else if (options.sortBy === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (options.sortBy === 'alphabetical') {
      comparison = a.title.localeCompare(b.title);
    }

    return options.sortDirection === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

export interface DueDateCounts {
  overdue: number;
  dueSoon: number;
}

export function computeDueDateCounts(tasks: Task[]): DueDateCounts {
  const now = Date.now() * 1_000_000;
  const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1_000_000_000;

  let overdue = 0;
  let dueSoon = 0;

  for (const task of tasks) {
    if (task.status === TaskStatus.completed || !task.dueDate) continue;

    const dueDate = Number(task.dueDate);

    if (dueDate < now) {
      overdue++;
    } else if (dueDate <= sevenDaysFromNow) {
      dueSoon++;
    }
  }

  return { overdue, dueSoon };
}

export interface DueDateBadge {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function getDueDateBadge(task: Task): DueDateBadge | null {
  if (!task.dueDate) return null;

  if (task.status === TaskStatus.completed) {
    return { label: 'Done', variant: 'secondary' };
  }

  const now = Date.now() * 1_000_000;
  const dueDate = Number(task.dueDate);
  const diffMs = (dueDate - now) / 1_000_000;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const tomorrowEnd = new Date(todayEnd);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

  if (dueDate < now) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: overdueDays === 0 ? 'Overdue today' : `${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} overdue`,
      variant: 'destructive',
    };
  } else if (dueDate >= todayStart.getTime() * 1_000_000 && dueDate <= todayEnd.getTime() * 1_000_000) {
    return { label: 'Due today', variant: 'default' };
  } else if (dueDate >= tomorrowStart.getTime() * 1_000_000 && dueDate <= tomorrowEnd.getTime() * 1_000_000) {
    return { label: 'Tomorrow', variant: 'default' };
  } else if (diffDays > 0 && diffDays <= 7) {
    return { label: `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`, variant: 'outline' };
  } else if (diffDays > 7) {
    return { label: `Due in ${diffDays} days`, variant: 'outline' };
  }

  return null;
}

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === TaskStatus.completed) return false;
  const now = Date.now() * 1_000_000;
  return Number(task.dueDate) < now;
}

export interface DashboardMetrics {
  open: number;
  completedToday: number;
  overdue: number;
  dueThisWeek: number;
}

export function computeDashboardMetrics(tasks: Task[]): DashboardMetrics {
  const now = Date.now() * 1_000_000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartNano = todayStart.getTime() * 1_000_000;
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndNano = weekEnd.getTime() * 1_000_000;

  let open = 0;
  let completedToday = 0;
  let overdue = 0;
  let dueThisWeek = 0;

  for (const task of tasks) {
    if (task.status === TaskStatus.open || task.status === TaskStatus.inProgress) {
      open++;
    }

    if (task.status === TaskStatus.completed && Number(task.updatedAt) >= todayStartNano) {
      completedToday++;
    }

    if (task.dueDate && task.status !== TaskStatus.completed && Number(task.dueDate) < now) {
      overdue++;
    }

    if (task.dueDate && task.status !== TaskStatus.completed && Number(task.dueDate) >= now && Number(task.dueDate) <= weekEndNano) {
      dueThisWeek++;
    }
  }

  return { open, completedToday, overdue, dueThisWeek };
}
