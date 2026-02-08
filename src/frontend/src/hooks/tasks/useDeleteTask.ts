import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { normalizeBackendError } from '../../utils/normalizeBackendError';

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.deleteTask(taskId);
      } catch (error) {
        throw new Error(normalizeBackendError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
