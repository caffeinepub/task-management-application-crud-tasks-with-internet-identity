import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { TaskStatus } from '../../backend';

interface ToggleCompleteParams {
  taskId: bigint;
  completed: boolean;
}

export function useToggleCompleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, completed }: ToggleCompleteParams) => {
      if (!actor) throw new Error('Actor not available');
      const newStatus = completed ? TaskStatus.open : TaskStatus.completed;
      return actor.updateTaskStatus(taskId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
