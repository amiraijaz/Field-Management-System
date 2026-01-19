import { Response } from "express";
import * as taskService from "./task.service";
import { AuthRequest, UserRole } from "../../types/index";
import {
  successResponse,
  errorResponse,
  createdResponse,
} from "../../utils/response";
import { getTenantId } from "../../middlewares/tenant.middleware";
import { emitToJob } from "../../config/socket";

export const getTasks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { jobId } = req.params;
    const tasks = await taskService.getTasksByJobId(jobId);
    successResponse(res, tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    errorResponse(res, "Failed to fetch tasks", 500);
  }
};

export const createTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { title, description } = req.body;

    if (!title) {
      errorResponse(res, "Title is required", 400);
      return;
    }

    const task = await taskService.createTask({
      jobId,
      title,
      description,
    });

    // Emit socket event for new task
    emitToJob(jobId, 'task:created', task);

    createdResponse(res, task, "Task created successfully");
  } catch (error) {
    console.error("Create task error:", error);
    errorResponse(res, "Failed to create task", 500);
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const { taskId } = req.params;

    // Verify tenant access
    const hasAccess = await taskService.verifyTaskTenant(taskId, tenantId);
    if (!hasAccess) {
      errorResponse(res, "Task not found", 404);
      return;
    }

    const task = await taskService.updateTask(taskId, req.body);

    if (!task) {
      errorResponse(res, "Task not found", 404);
      return;
    }

    successResponse(res, task, "Task updated successfully");
  } catch (error) {
    console.error("Update task error:", error);
    errorResponse(res, "Failed to update task", 500);
  }
};

export const completeTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const { taskId } = req.params;
    const { complete = true } = req.body;

    // Verify access
    if (req.user?.role === UserRole.WORKER) {
      const hasAccess = await taskService.verifyWorkerAccess(
        taskId,
        req.user.userId
      );
      if (!hasAccess) {
        errorResponse(res, "Access denied", 403);
        return;
      }
    } else {
      const hasAccess = await taskService.verifyTaskTenant(taskId, tenantId);
      if (!hasAccess) {
        errorResponse(res, "Task not found", 404);
        return;
      }
    }

    const task = await taskService.completeTask(
      taskId,
      req.user!.userId,
      complete
    );

    if (!task) {
      errorResponse(res, "Task not found", 404);
      return;
    }

    // Emit socket event for task completion
    const fullTask = await taskService.getTaskById(taskId);
    if (fullTask) {
      emitToJob(fullTask.job_id, 'task:updated', fullTask);
    }

    successResponse(res, task, complete ? "Task completed" : "Task reopened");
  } catch (error) {
    console.error("Complete task error:", error);
    errorResponse(res, "Failed to update task", 500);
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const { taskId } = req.params;

    // Verify tenant access
    const hasAccess = await taskService.verifyTaskTenant(taskId, tenantId);
    if (!hasAccess) {
      errorResponse(res, "Task not found", 404);
      return;
    }

    // Get task info before deleting for socket event
    const task = await taskService.getTaskById(taskId);

    const deleted = await taskService.deleteTask(taskId);

    if (!deleted) {
      errorResponse(res, "Task not found", 404);
      return;
    }

    // Emit socket event for task deletion
    if (task) {
      emitToJob(task.job_id, 'task:deleted', { id: taskId });
    }

    successResponse(res, null, "Task deleted successfully");
  } catch (error) {
    console.error("Delete task error:", error);
    errorResponse(res, "Failed to delete task", 500);
  }
};
