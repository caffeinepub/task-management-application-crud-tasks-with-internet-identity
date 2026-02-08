import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { TaskPriority } from '../../backend';
import { normalizeBackendError } from '../../utils/normalizeBackendError';

interface CreateTaskParams {
  title: string;
  description: string;
  dueDate: bigint;
  priority: TaskPriority;
  tags: string[];
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description, dueDate, priority, tags }: CreateTaskParams) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.createTask(title, description, dueDate, priority, tags);
      } catch (error) {
        throw new Error(normalizeBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
