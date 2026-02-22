import { Response } from 'express';

// Update: Added 'meta' as an optional fourth argument
export const successResponse = (
  res: Response, 
  data: any, 
  statusCode: number = 200, 
  meta?: any // Use 'any' or a specific interface for your metadata
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta && { meta }), // Only include 'meta' in the JSON if it exists
  });
};

export const errorResponse = (res: Response, message: string, statusCode: number = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};