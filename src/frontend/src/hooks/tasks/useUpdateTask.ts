import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { TaskPriority } from '../../backend';
import { normalizeBackendError } from '../../utils/normalizeBackendError';

interface UpdateTaskParams {
  taskId: bigint;
  title: string;
  description: string;
  dueDate: bigint;
  priority: TaskPriority;
  tags: string[];
}

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, title, description, dueDate, priority, tags }: UpdateTaskParams) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.updateTask(taskId, title, description, dueDate, priority, tags);
      } catch (error) {
        throw new Error(normalizeBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
