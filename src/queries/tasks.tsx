import { useAxios } from '@/providers/AxiosProvider'
import { useSession } from '@/providers/SessionProvider'
import { ErrorResp } from '@/utils/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

/**
 * Fetch tasks from a specific list
 */
export function useGetTasksFromList(id: number | null) {
  // Services
  const axios = useAxios()
  const { isAuthenticated } = useSession()

  // Query
  return useQuery<TTask[], ErrorResp>({
    queryKey: ['get-tasks', id],
    queryFn: async () => {
      const { status, data } = await axios.get<TGetTasksFromListResponse>(`/lists/${id}/tasks`)

      if (status === 200 && data.status) {
        return data.payload
      }

      throw new Error('error.useGetTasksFromList')
    },
    enabled: isAuthenticated === true && id != null
  })
}

/**
 * Mark task as completed/uncompleted
 */
export function useToggleCompleted() {
  // Services
  const axios = useAxios()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      return await axios.patch(`/tasks/${id}/completed`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-tasks'] })
    }
  })
}

/**
 * Create a new task
 */
export function useCreateNewTask(listId: number | null) {
  // Services
  const axios = useAxios()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (text: string) => {
      return await axios.post(`/tasks/new`, { text, listId, tagIds: [] })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-tasks', listId] })
    }
  })
}

/**
 * Update task
 */
export function useUpdateTask() {
  // Services
  const axios = useAxios()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ text, taskId }: { text: string; taskId: number }) => {
      return await axios.patch(`/tasks/${taskId}`, { text })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-tasks'] })
    }
  })
}

/**
 * Change status
 */
export function useChangeTaskStatus() {
  // Services
  const axios = useAxios()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, statusId }: { taskId: number; statusId: string }) => {
      return await axios.patch(`/tasks/${taskId}/status`, { statusId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-tasks'] })
    }
  })
}

/**
 * Delete task
 */
export function useDeleteTask() {
  // Services
  const axios = useAxios()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: number) => {
      return await axios.delete(`/tasks/${taskId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-tasks'] })
    }
  })
}

/**
 * Types
 */
type TGetTasksFromListResponse = {
  status: boolean
  message: string | null
  payload: TTask[]
}

export type TTask = {
  id: number
  text: string
  isCompleted: boolean
  completedAt: string
  completedBy: string
  status: TStatus
}

export type TStatus = {
  id: string
  label: string
  color: string
}
