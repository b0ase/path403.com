// src/index.ts
var TaskContractManager = class {
  constructor() {
    this.tasks = /* @__PURE__ */ new Map();
    this.applications = /* @__PURE__ */ new Map();
    this.submissions = /* @__PURE__ */ new Map();
  }
  // ==========================================================================
  // Task Management
  // ==========================================================================
  createTask(input, poster) {
    const id = this.generateId("task");
    const now = /* @__PURE__ */ new Date();
    const milestones = input.milestones?.map((m, i) => ({
      ...m,
      id: this.generateId("milestone"),
      status: "draft"
    })) || [{
      id: this.generateId("milestone"),
      title: "Full Completion",
      amount: input.totalAmount,
      percentage: 100,
      status: "draft"
    }];
    const task = {
      id,
      title: input.title,
      description: input.description,
      type: input.type,
      status: "draft",
      poster,
      totalAmount: input.totalAmount,
      currency: input.currency,
      escrowedAmount: BigInt(0),
      releasedAmount: BigInt(0),
      paymentStatus: "pending",
      milestones,
      skills: input.skills || [],
      deadline: input.deadline,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.set(id, task);
    this.applications.set(id, []);
    this.submissions.set(id, []);
    return task;
  }
  publishTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");
    if (task.status !== "draft") throw new Error("Task already published");
    task.status = "open";
    task.updatedAt = /* @__PURE__ */ new Date();
  }
  cancelTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");
    if (task.status === "completed") throw new Error("Cannot cancel completed task");
    task.status = "cancelled";
    task.updatedAt = /* @__PURE__ */ new Date();
    if (task.escrowedAmount > BigInt(0)) {
      task.paymentStatus = "refunded";
    }
  }
  getTask(taskId) {
    return this.tasks.get(taskId);
  }
  getOpenTasks() {
    return Array.from(this.tasks.values()).filter((t) => t.status === "open");
  }
  getTasksByPoster(posterId) {
    return Array.from(this.tasks.values()).filter((t) => t.poster.id === posterId);
  }
  getTasksByWorker(workerId) {
    return Array.from(this.tasks.values()).filter((t) => t.worker?.id === workerId);
  }
  // ==========================================================================
  // Application Management
  // ==========================================================================
  applyToTask(taskId, worker, proposal, proposedAmount, estimatedDuration) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");
    if (task.status !== "open") throw new Error("Task is not accepting applications");
    const application = {
      id: this.generateId("app"),
      taskId,
      workerId: worker.id,
      workerName: worker.name,
      proposal,
      proposedAmount,
      estimatedDuration,
      status: "pending",
      appliedAt: /* @__PURE__ */ new Date()
    };
    this.applications.get(taskId).push(application);
    return application;
  }
  acceptApplication(taskId, applicationId) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");
    const applications = this.applications.get(taskId);
    const application = applications.find((a) => a.id === applicationId);
    if (!application) throw new Error("Application not found");
    application.status = "accepted";
    application.respondedAt = /* @__PURE__ */ new Date();
    for (const app of applications) {
      if (app.id !== applicationId && app.status === "pending") {
        app.status = "rejected";
        app.respondedAt = /* @__PURE__ */ new Date();
      }
    }
    task.worker = {
      id: application.workerId,
      name: application.workerName,
      appliedAt: application.appliedAt,
      assignedAt: /* @__PURE__ */ new Date()
    };
    task.status = "assigned";
    task.updatedAt = /* @__PURE__ */ new Date();
  }
  rejectApplication(taskId, applicationId) {
    const applications = this.applications.get(taskId);
    if (!applications) throw new Error("Task not found");
    const application = applications.find((a) => a.id === applicationId);
    if (!application) throw new Error("Application not found");
    application.status = "rejected";
    application.respondedAt = /* @__PURE__ */ new Date();
  }
  getApplications(taskId) {
    return this.applications.get(taskId) || [];
  }
  // ==========================================================================
  // Work Management
  // ==========================================================================
  startWork(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");
    if (!task.worker) throw new Error("No worker assigned");
    if (task.status !== "assigned") throw new Error("Task not in assigned state");
    task.status = "in_progress";
    task.milestones[0].status = "in_progress";
    task.updatedAt = /* @__PURE__ */ new Date();
  }
  submitWork(taskId, workerId, deliverables, message, milestoneId) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");
    if (task.worker?.id !== workerId) throw new Error("Not the assigned worker");
    const submission = {
      id: this.generateId("sub"),
      taskId,
      workerId,
      milestoneId,
      status: "submitted",
      deliverables,
      message,
      submittedAt: /* @__PURE__ */ new Date()
    };
    this.submissions.get(taskId).push(submission);
    task.status = "review";
    task.updatedAt = /* @__PURE__ */ new Date();
    return submission;
  }
  approveSubmission(taskId, submissionId, feedback) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");
    const submissions = this.submissions.get(taskId);
    const submission = submissions.find((s) => s.id === submissionId);
    if (!submission) throw new Error("Submission not found");
    submission.status = "accepted";
    submission.reviewedAt = /* @__PURE__ */ new Date();
    submission.feedback = feedback;
    if (submission.milestoneId) {
      const milestone = task.milestones.find((m) => m.id === submission.milestoneId);
      if (milestone) {
        milestone.status = "completed";
        milestone.completedAt = /* @__PURE__ */ new Date();
      }
      const allComplete = task.milestones.every((m) => m.status === "completed");
      if (allComplete) {
        task.status = "completed";
        task.completedAt = /* @__PURE__ */ new Date();
      }
    } else {
      task.status = "completed";
      task.completedAt = /* @__PURE__ */ new Date();
    }
    task.updatedAt = /* @__PURE__ */ new Date();
  }
  requestRevision(taskId, submissionId, feedback) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");
    const submissions = this.submissions.get(taskId);
    const submission = submissions.find((s) => s.id === submissionId);
    if (!submission) throw new Error("Submission not found");
    submission.status = "revision_requested";
    submission.reviewedAt = /* @__PURE__ */ new Date();
    submission.feedback = feedback;
    task.status = "revision";
    task.updatedAt = /* @__PURE__ */ new Date();
  }
  getSubmissions(taskId) {
    return this.submissions.get(taskId) || [];
  }
  // ==========================================================================
  // Payment Management
  // ==========================================================================
  escrowPayment(taskId, amount) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");
    task.escrowedAmount += amount;
    task.paymentStatus = task.escrowedAmount >= task.totalAmount ? "escrowed" : "partial";
    task.updatedAt = /* @__PURE__ */ new Date();
  }
  releasePayment(taskId, amount, milestoneId) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");
    if (amount > task.escrowedAmount - task.releasedAmount) {
      throw new Error("Insufficient escrowed funds");
    }
    task.releasedAmount += amount;
    if (task.releasedAmount >= task.totalAmount) {
      task.paymentStatus = "released";
    }
    task.updatedAt = /* @__PURE__ */ new Date();
  }
  refundPayment(taskId, amount) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");
    if (amount > task.escrowedAmount - task.releasedAmount) {
      throw new Error("Insufficient funds to refund");
    }
    task.escrowedAmount -= amount;
    if (task.escrowedAmount === BigInt(0)) {
      task.paymentStatus = "refunded";
    }
    task.updatedAt = /* @__PURE__ */ new Date();
  }
  // ==========================================================================
  // Dispute Management
  // ==========================================================================
  raiseDispute(taskId, raisedBy, reason, evidence) {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error("Task not found");
    if (task.dispute) throw new Error("Dispute already exists");
    const dispute = {
      id: this.generateId("dispute"),
      taskId,
      raisedBy,
      status: "open",
      reason,
      evidence,
      createdAt: /* @__PURE__ */ new Date()
    };
    task.dispute = dispute;
    task.status = "disputed";
    task.paymentStatus = "disputed";
    task.updatedAt = /* @__PURE__ */ new Date();
    return dispute;
  }
  resolveDispute(taskId, resolution, splitRatio, resolutionNote) {
    const task = this.tasks.get(taskId);
    if (!task?.dispute) throw new Error("No dispute found");
    const dispute = task.dispute;
    dispute.resolution = resolutionNote;
    dispute.resolvedAt = /* @__PURE__ */ new Date();
    switch (resolution) {
      case "poster":
        dispute.status = "resolved_poster";
        task.paymentStatus = "refunded";
        break;
      case "worker":
        dispute.status = "resolved_worker";
        task.paymentStatus = "released";
        task.releasedAmount = task.escrowedAmount;
        break;
      case "split":
        dispute.status = "resolved_split";
        dispute.splitRatio = splitRatio || 50;
        const workerShare = task.escrowedAmount * BigInt(dispute.splitRatio) / BigInt(100);
        task.releasedAmount = workerShare;
        task.paymentStatus = "released";
        break;
    }
    task.status = "completed";
    task.completedAt = /* @__PURE__ */ new Date();
    task.updatedAt = /* @__PURE__ */ new Date();
  }
  // ==========================================================================
  // Helpers
  // ==========================================================================
  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};
function createTaskContractManager() {
  return new TaskContractManager();
}
function calculateMilestoneProgress(task) {
  if (task.milestones.length === 0) return 0;
  const completed = task.milestones.filter((m) => m.status === "completed").length;
  return completed / task.milestones.length * 100;
}
function calculatePaymentProgress(task) {
  if (task.totalAmount === BigInt(0)) return 0;
  return Number(task.releasedAmount * BigInt(100) / task.totalAmount);
}
function formatTaskAmount(amount, decimals = 8) {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  if (fraction === BigInt(0)) return whole.toString();
  return `${whole}.${fraction.toString().padStart(decimals, "0").replace(/0+$/, "")}`;
}
function isTaskOverdue(task) {
  if (!task.deadline) return false;
  return /* @__PURE__ */ new Date() > task.deadline && !["completed", "cancelled"].includes(task.status);
}
function getTaskStatusColor(status) {
  const colors = {
    draft: "#6B7280",
    open: "#3B82F6",
    assigned: "#8B5CF6",
    in_progress: "#F59E0B",
    review: "#10B981",
    revision: "#F97316",
    completed: "#22C55E",
    cancelled: "#EF4444",
    disputed: "#DC2626"
  };
  return colors[status];
}
export {
  TaskContractManager,
  calculateMilestoneProgress,
  calculatePaymentProgress,
  createTaskContractManager,
  formatTaskAmount,
  getTaskStatusColor,
  isTaskOverdue
};
//# sourceMappingURL=index.js.map