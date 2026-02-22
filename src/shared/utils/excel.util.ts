import ExcelJS from 'exceljs';
import { Response } from 'express';

export const sendExcelFile = async (
  res: Response,
  workbook: ExcelJS.Workbook,
  filename: string
) => {
  // Set response headers
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
};

export const createWorkbook = () => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Ramadan Kitchen System';
  workbook.created = new Date();
  return workbook;
};

export const addHeaderRow = (worksheet: ExcelJS.Worksheet, headers: string[]) => {
  const headerRow = worksheet.addRow(headers);
  
  // Make headers bold
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
  });
  
  return headerRow;
};