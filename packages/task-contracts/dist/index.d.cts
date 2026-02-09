/**
 * @b0ase/task-contracts
 *
 * Task and bounty contract system for work agreements.
 *
 * @packageDocumentation
 */
/** Task type */
type TaskType = 'bounty' | 'gig' | 'project' | 'milestone' | 'maintenance';
/** Task status */
type TaskStatus = 'draft' | 'open' | 'assigned' | 'in_progress' | 'review' | 'revision' | 'completed' | 'cancelled' | 'disputed';
/** Payment status */
type PaymentStatus = 'pending' | 'escrowed' | 'partial' | 'released' | 'refunded' | 'disputed';
/** Submission status */
type SubmissionStatus = 'submitted' | 'accepted' | 'rejected' | 'revision_requested';
/** Dispute status */
type DisputeStatus = 'open' | 'under_review' | 'resolved_poster' | 'resolved_worker' | 'resolved_split';
/** Task poster */
interface TaskPoster {
    id: string;
    name: string;
    walletAddress?: string;
    rating?: number;
    completedTasks?: number;
}
/** Task worker */
interface TaskWorker {
    id: string;
    name: string;
    walletAddress?: string;
    rating?: number;
    completedTasks?: number;
    appliedAt: Date;
    assignedAt?: Date;
}
/** Task milestone */
interface TaskMilestone {
    id: string;
    title: string;
    description?: string;
    amount: bigint;
    percentage: number;
    status: TaskStatus;
    dueDate?: Date;
    completedAt?: Date;
    deliverables?: TaskDeliverable[];
}
/** Task deliverable */
interface TaskDeliverable {
    id: string;
    title: string;
    description?: string;
    type: 'file' | 'link' | 'text' | 'code' | 'design';
    required: boolean;
    submitted?: boolean;
    submittedAt?: Date;
    url?: string;
    content?: string;
    feedback?: string;
}
/** Task submission */
interface TaskSubmission {
    id: string;
    taskId: string;
    workerId: string;
    milestoneId?: string;
    status: SubmissionStatus;
    deliverables: SubmittedDeliverable[];
    message?: string;
    submittedAt: Date;
    reviewedAt?: Date;
    feedback?: string;
}
/** Submitted deliverable */
interface SubmittedDeliverable {
    deliverableId: string;
    type: 'file' | 'link' | 'text' | 'code' | 'design';
    url?: string;
    content?: string;
    filename?: string;
}
/** Task contract */
interface TaskContract {
    id: string;
    title: string;
    description: string;
    type: TaskType;
    status: TaskStatus;
    poster: TaskPoster;
    worker?: TaskWorker;
    totalAmount: bigint;
    currency: string;
    escrowedAmount: bigint;
    releasedAmount: bigint;
    paymentStatus: PaymentStatus;
    milestones: TaskMilestone[];
    skills: string[];
    deadline?: Date;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    dispute?: TaskDispute;
    metadata?: Record<string, unknown>;
}
/** Task dispute */
interface TaskDispute {
    id: string;
    taskId: string;
    raisedBy: 'poster' | 'worker';
    status: DisputeStatus;
    reason: string;
    evidence?: string[];
    posterClaim?: string;
    workerClaim?: string;
    resolution?: string;
    splitRatio?: number;
    createdAt: Date;
    resolvedAt?: Date;
}
/** Task application */
interface TaskApplication {
    id: string;
    taskId: string;
    workerId: string;
    workerName: string;
    proposal: string;
    proposedAmount?: bigint;
    estimatedDuration?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    appliedAt: Date;
    respondedAt?: Date;
}
/** Create task input */
interface CreateTaskInput {
    title: string;
    description: string;
    type: TaskType;
    totalAmount: bigint;
    currency: string;
    skills?: string[];
    deadline?: Date;
    milestones?: Omit<TaskMilestone, 'id' | 'status'>[];
}
declare class TaskContractManager {
    private tasks;
    private applications;
    private submissions;
    createTask(input: CreateTaskInput, poster: TaskPoster): TaskContract;
    publishTask(taskId: string): void;
    cancelTask(taskId: string): void;
    getTask(taskId: string): TaskContract | undefined;
    getOpenTasks(): TaskContract[];
    getTasksByPoster(posterId: string): TaskContract[];
    getTasksByWorker(workerId: string): TaskContract[];
    applyToTask(taskId: string, worker: TaskWorker, proposal: string, proposedAmount?: bigint, estimatedDuration?: string): TaskApplication;
    acceptApplication(taskId: string, applicationId: string): void;
    rejectApplication(taskId: string, applicationId: string): void;
    getApplications(taskId: string): TaskApplication[];
    startWork(taskId: string): void;
    submitWork(taskId: string, workerId: string, deliverables: SubmittedDeliverable[], message?: string, milestoneId?: string): TaskSubmission;
    approveSubmission(taskId: string, submissionId: string, feedback?: string): void;
    requestRevision(taskId: string, submissionId: string, feedback: string): void;
    getSubmissions(taskId: string): TaskSubmission[];
    escrowPayment(taskId: string, amount: bigint): void;
    releasePayment(taskId: string, amount: bigint, milestoneId?: string): void;
    refundPayment(taskId: string, amount: bigint): void;
    raiseDispute(taskId: string, raisedBy: 'poster' | 'worker', reason: string, evidence?: string[]): TaskDispute;
    resolveDispute(taskId: string, resolution: 'poster' | 'worker' | 'split', splitRatio?: number, resolutionNote?: string): void;
    private generateId;
}
declare function createTaskContractManager(): TaskContractManager;
declare function calculateMilestoneProgress(task: TaskContract): number;
declare function calculatePaymentProgress(task: TaskContract): number;
declare function formatTaskAmount(amount: bigint, decimals?: number): string;
declare function isTaskOverdue(task: TaskContract): boolean;
declare function getTaskStatusColor(status: TaskStatus): string;

export { type CreateTaskInput, type DisputeStatus, type PaymentStatus, type SubmissionStatus, type SubmittedDeliverable, type TaskApplication, type TaskContract, TaskContractManager, type TaskDeliverable, type TaskDispute, type TaskMilestone, type TaskPoster, type TaskStatus, type TaskSubmission, type TaskType, type TaskWorker, calculateMilestoneProgress, calculatePaymentProgress, createTaskContractManager, formatTaskAmount, getTaskStatusColor, isTaskOverdue };
