import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { TaskStatus } from '../../backend';
import { normalizeBackendError } from '../../utils/normalizeBackendError';

interface UpdateTaskStatusParams {
  taskId: bigint;
  newStatus: TaskStatus;
}

export function useUpdateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, newStatus }: UpdateTaskStatusParams) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.updateTaskStatus(taskId, newStatus);
      } catch (error) {
        throw new Error(normalizeBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
