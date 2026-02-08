import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Subtask {
    id: SubtaskId;
    title: string;
    isCompleted: boolean;
}
export type TaskId = bigint;
export type SubtaskId = bigint;
export interface Task {
    id: TaskId;
    status: TaskStatus;
    title: string;
    assignedTo?: Principal;
    createdAt: bigint;
    createdBy: Principal;
    tags: Array<string>;
    dueDate: bigint;
    description: string;
    updatedAt: bigint;
    priority: TaskPriority;
    orderKey?: bigint;
    subtasks: Array<Subtask>;
}
export interface UserProfile {
    name: string;
}
export enum TaskPriority {
    low = "low",
    high = "high",
    urgent = "urgent",
    medium = "medium"
}
export enum TaskStatus {
    open = "open",
    completed = "completed",
    inProgress = "inProgress",
    archived = "archived"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSubtask(taskId: TaskId, title: string): Promise<Subtask>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTask(title: string, description: string, dueDate: bigint, priority: TaskPriority, tags: Array<string>): Promise<Task>;
    deleteSubtask(taskId: TaskId, subtaskId: SubtaskId): Promise<void>;
    deleteTask(taskId: TaskId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompletedTaskCount(): Promise<bigint>;
    getTaskCount(): Promise<bigint>;
    getTasks(): Promise<Array<Task>>;
    getTasksByStatus(status: TaskStatus): Promise<Array<Task>>;
    getTasksSortedByDueDate(): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleSubtaskCompletion(taskId: TaskId, subtaskId: SubtaskId): Promise<Subtask>;
    updateSubtask(taskId: TaskId, subtaskId: SubtaskId, title: string): Promise<Subtask>;
    updateTask(taskId: TaskId, title: string, description: string, dueDate: bigint, priority: TaskPriority, tags: Array<string>): Promise<Task>;
    updateTaskOrder(status: TaskStatus, orderedTaskIds: Array<TaskId>): Promise<void>;
    updateTaskStatus(taskId: TaskId, newStatus: TaskStatus): Promise<Task>;
}
