import { Response } from "express";
import { ApiResponse, PaginatedResponse } from "../types/index";

export const successResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  error: string,
  statusCode = 400
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return res.status(statusCode).json(response);
};

export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number }
): Response => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages,
    },
  };
  return res.status(200).json(response);
};

export const createdResponse = <T>(
  res: Response,
  data: T,
  message = "Created successfully"
): Response => {
  return successResponse(res, data, message, 201);
};

export const noContentResponse = (res: Response): Response => {
  return res.status(204).send();
};
