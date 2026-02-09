/**
 * @b0ase/task-contracts
 *
 * Task and bounty contract system for work agreements.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Task type */
export type TaskType = 'bounty' | 'gig' | 'project' | 'milestone' | 'maintenance';

/** Task status */
export type TaskStatus =
  | 'draft'
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'review'
  | 'revision'
  | 'completed'
  | 'cancelled'
  | 'disputed';

/** Payment status */
export type PaymentStatus =
  | 'pending'
  | 'escrowed'
  | 'partial'
  | 'released'
  | 'refunded'
  | 'disputed';

/** Submission status */
export type SubmissionStatus =
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'revision_requested';

/** Dispute status */
export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_poster'
  | 'resolved_worker'
  | 'resolved_split';

/** Task poster */
export interface TaskPoster {
  id: string;
  name: string;
  walletAddress?: string;
  rating?: number;
  completedTasks?: number;
}

/** Task worker */
export interface TaskWorker {
  id: string;
  name: string;
  walletAddress?: string;
  rating?: number;
  completedTasks?: number;
  appliedAt: Date;
  assignedAt?: Date;
}

/** Task milestone */
export interface TaskMilestone {
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
export interface TaskDeliverable {
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
export interface TaskSubmission {
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
export interface SubmittedDeliverable {
  deliverableId: string;
  type: 'file' | 'link' | 'text' | 'code' | 'design';
  url?: string;
  content?: string;
  filename?: string;
}

/** Task contract */
export interface TaskContract {
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
export interface TaskDispute {
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
export interface TaskApplication {
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
export interface CreateTaskInput {
  title: string;
  description: string;
  type: TaskType;
  totalAmount: bigint;
  currency: string;
  skills?: string[];
  deadline?: Date;
  milestones?: Omit<TaskMilestone, 'id' | 'status'>[];
}

// ============================================================================
// Task Contract Manager
// ============================================================================

export class TaskContractManager {
  private tasks: Map<string, TaskContract> = new Map();
  private applications: Map<string, TaskApplication[]> = new Map();
  private submissions: Map<string, TaskSubmission[]> = new Map();

  // ==========================================================================
  // Task Management
  // ==========================================================================

  createTask(input: CreateTaskInput, poster: TaskPoster): TaskContract {
    const id = this.generateId('task');
    const now = new Date();

    const milestones: TaskMilestone[] = input.milestones?.map((m, i) => ({
      ...m,
      id: this.generateId('milestone'),
      status: 'draft',
    })) || [{
      id: this.generateId('milestone'),
      title: 'Full Completion',
      amount: input.totalAmount,
      percentage: 100,
      status: 'draft',
    }];

    const task: TaskContract = {
      id,
      title: input.title,
      description: input.description,
      type: input.type,
      status: 'draft',
      poster,
      totalAmount: input.totalAmount,
      currency: input.currency,
      escrowedAmount: BigInt(0),
      releasedAmount: BigInt(0),
      paymentStatus: 'pending',
      milestones,
      skills: input.skills || [],
      deadline: input.deadline,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(id, task);
    this.applications.set(id, []);
    this.submissions.set(id, []);

    return task;
  }

  publishTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'draft') throw new Error('Task already published');

    task.status = 'open';
    task.updatedAt = new Date();
  }

  cancelTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    if (task.status === 'completed') throw new Error('Cannot cancel completed task');

    task.status = 'cancelled';
    task.updatedAt = new Date();

    // Refund escrowed amount
    if (task.escrowedAmount > BigInt(0)) {
      task.paymentStatus = 'refunded';
    }
  }

  getTask(taskId: string): TaskContract | undefined {
    return this.tasks.get(taskId);
  }

  getOpenTasks(): TaskContract[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'open');
  }

  getTasksByPoster(posterId: string): TaskContract[] {
    return Array.from(this.tasks.values()).filter(t => t.poster.id === posterId);
  }

  getTasksByWorker(workerId: string): TaskContract[] {
    return Array.from(this.tasks.values()).filter(t => t.worker?.id === workerId);
  }

  // ==========================================================================
  // Application Management
  // ==========================================================================

  applyToTask(
    taskId: string,
    worker: TaskWorker,
    proposal: string,
    proposedAmount?: bigint,
    estimatedDuration?: string
  ): TaskApplication {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    if (task.status !== 'open') throw new Error('Task is not accepting applications');

    const application: TaskApplication = {
      id: this.generateId('app'),
      taskId,
      workerId: worker.id,
      workerName: worker.name,
      proposal,
      proposedAmount,
      estimatedDuration,
      status: 'pending',
      appliedAt: new Date(),
    };

    this.applications.get(taskId)!.push(application);
    return application;
  }

  acceptApplication(taskId: string, applicationId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    const applications = this.applications.get(taskId)!;
    const application = applications.find(a => a.id === applicationId);
    if (!application) throw new Error('Application not found');

    application.status = 'accepted';
    application.respondedAt = new Date();

    // Reject other applications
    for (const app of applications) {
      if (app.id !== applicationId && app.status === 'pending') {
        app.status = 'rejected';
        app.respondedAt = new Date();
      }
    }

    // Assign worker
    task.worker = {
      id: application.workerId,
      name: application.workerName,
      appliedAt: application.appliedAt,
      assignedAt: new Date(),
    };
    task.status = 'assigned';
    task.updatedAt = new Date();
  }

  rejectApplication(taskId: string, applicationId: string): void {
    const applications = this.applications.get(taskId);
    if (!applications) throw new Error('Task not found');

    const application = applications.find(a => a.id === applicationId);
    if (!application) throw new Error('Application not found');

    application.status = 'rejected';
    application.respondedAt = new Date();
  }

  getApplications(taskId: string): TaskApplication[] {
    return this.applications.get(taskId) || [];
  }

  // ==========================================================================
  // Work Management
  // ==========================================================================

  startWork(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    if (!task.worker) throw new Error('No worker assigned');
    if (task.status !== 'assigned') throw new Error('Task not in assigned state');

    task.status = 'in_progress';
    task.milestones[0].status = 'in_progress';
    task.updatedAt = new Date();
  }

  submitWork(
    taskId: string,
    workerId: string,
    deliverables: SubmittedDeliverable[],
    message?: string,
    milestoneId?: string
  ): TaskSubmission {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    if (task.worker?.id !== workerId) throw new Error('Not the assigned worker');

    const submission: TaskSubmission = {
      id: this.generateId('sub'),
      taskId,
      workerId,
      milestoneId,
      status: 'submitted',
      deliverables,
      message,
      submittedAt: new Date(),
    };

    this.submissions.get(taskId)!.push(submission);
    task.status = 'review';
    task.updatedAt = new Date();

    return submission;
  }

  approveSubmission(taskId: string, submissionId: string, feedback?: string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    const submissions = this.submissions.get(taskId)!;
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) throw new Error('Submission not found');

    submission.status = 'accepted';
    submission.reviewedAt = new Date();
    submission.feedback = feedback;

    // Complete milestone or task
    if (submission.milestoneId) {
      const milestone = task.milestones.find(m => m.id === submission.milestoneId);
      if (milestone) {
        milestone.status = 'completed';
        milestone.completedAt = new Date();
      }

      // Check if all milestones complete
      const allComplete = task.milestones.every(m => m.status === 'completed');
      if (allComplete) {
        task.status = 'completed';
        task.completedAt = new Date();
      }
    } else {
      task.status = 'completed';
      task.completedAt = new Date();
    }

    task.updatedAt = new Date();
  }

  requestRevision(taskId: string, submissionId: string, feedback: string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    const submissions = this.submissions.get(taskId)!;
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) throw new Error('Submission not found');

    submission.status = 'revision_requested';
    submission.reviewedAt = new Date();
    submission.feedback = feedback;

    task.status = 'revision';
    task.updatedAt = new Date();
  }

  getSubmissions(taskId: string): TaskSubmission[] {
    return this.submissions.get(taskId) || [];
  }

  // ==========================================================================
  // Payment Management
  // ==========================================================================

  escrowPayment(taskId: string, amount: bigint): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    task.escrowedAmount += amount;
    task.paymentStatus = task.escrowedAmount >= task.totalAmount ? 'escrowed' : 'partial';
    task.updatedAt = new Date();
  }

  releasePayment(taskId: string, amount: bigint, milestoneId?: string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    if (amount > task.escrowedAmount - task.releasedAmount) {
      throw new Error('Insufficient escrowed funds');
    }

    task.releasedAmount += amount;
    if (task.releasedAmount >= task.totalAmount) {
      task.paymentStatus = 'released';
    }
    task.updatedAt = new Date();
  }

  refundPayment(taskId: string, amount: bigint): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');

    if (amount > task.escrowedAmount - task.releasedAmount) {
      throw new Error('Insufficient funds to refund');
    }

    task.escrowedAmount -= amount;
    if (task.escrowedAmount === BigInt(0)) {
      task.paymentStatus = 'refunded';
    }
    task.updatedAt = new Date();
  }

  // ==========================================================================
  // Dispute Management
  // ==========================================================================

  raiseDispute(
    taskId: string,
    raisedBy: 'poster' | 'worker',
    reason: string,
    evidence?: string[]
  ): TaskDispute {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    if (task.dispute) throw new Error('Dispute already exists');

    const dispute: TaskDispute = {
      id: this.generateId('dispute'),
      taskId,
      raisedBy,
      status: 'open',
      reason,
      evidence,
      createdAt: new Date(),
    };

    task.dispute = dispute;
    task.status = 'disputed';
    task.paymentStatus = 'disputed';
    task.updatedAt = new Date();

    return dispute;
  }

  resolveDispute(
    taskId: string,
    resolution: 'poster' | 'worker' | 'split',
    splitRatio?: number,
    resolutionNote?: string
  ): void {
    const task = this.tasks.get(taskId);
    if (!task?.dispute) throw new Error('No dispute found');

    const dispute = task.dispute;
    dispute.resolution = resolutionNote;
    dispute.resolvedAt = new Date();

    switch (resolution) {
      case 'poster':
        dispute.status = 'resolved_poster';
        // Refund to poster
        task.paymentStatus = 'refunded';
        break;
      case 'worker':
        dispute.status = 'resolved_worker';
        // Release to worker
        task.paymentStatus = 'released';
        task.releasedAmount = task.escrowedAmount;
        break;
      case 'split':
        dispute.status = 'resolved_split';
        dispute.splitRatio = splitRatio || 50;
        // Split payment
        const workerShare = (task.escrowedAmount * BigInt(dispute.splitRatio)) / BigInt(100);
        task.releasedAmount = workerShare;
        task.paymentStatus = 'released';
        break;
    }

    task.status = 'completed';
    task.completedAt = new Date();
    task.updatedAt = new Date();
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createTaskContractManager(): TaskContractManager {
  return new TaskContractManager();
}

// ============================================================================
// Utility Functions
// ============================================================================

export function calculateMilestoneProgress(task: TaskContract): number {
  if (task.milestones.length === 0) return 0;
  const completed = task.milestones.filter(m => m.status === 'completed').length;
  return (completed / task.milestones.length) * 100;
}

export function calculatePaymentProgress(task: TaskContract): number {
  if (task.totalAmount === BigInt(0)) return 0;
  return Number((task.releasedAmount * BigInt(100)) / task.totalAmount);
}

export function formatTaskAmount(amount: bigint, decimals: number = 8): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  if (fraction === BigInt(0)) return whole.toString();
  return `${whole}.${fraction.toString().padStart(decimals, '0').replace(/0+$/, '')}`;
}

export function isTaskOverdue(task: TaskContract): boolean {
  if (!task.deadline) return false;
  return new Date() > task.deadline && !['completed', 'cancelled'].includes(task.status);
}

export function getTaskStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    draft: '#6B7280',
    open: '#3B82F6',
    assigned: '#8B5CF6',
    in_progress: '#F59E0B',
    review: '#10B981',
    revision: '#F97316',
    completed: '#22C55E',
    cancelled: '#EF4444',
    disputed: '#DC2626',
  };
  return colors[status];
}
