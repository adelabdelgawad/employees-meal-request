"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import React from "react";

interface PrintTableProps<T> {
  columns: string[];
  data: T[];
}

function PrintTable<T>({ columns, data }: PrintTableProps<T>) {
  const handlePrint = () => {
    const printContent =
      document.getElementById("printable-content")?.outerHTML;
    if (!printContent) return;

    const newWindow = window.open("", "", "height=500,width=800");
    newWindow?.document.write(`
      <html>
        <head>
          <title>Print Table</title>
          <style>
            @page {
              margin: 0;
            }
            body {
              margin: 1cm;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
            }
            td.number {
              text-align: right;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    newWindow?.document.close();
    newWindow?.print();
  };

  return (
    <div>
      {/* Print Button */}
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>

      {/* Hidden Table for Printing */}
      <div style={{ display: "none" }}>
        <table id="printable-content">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column}>{row[column as keyof T]?.toString()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PrintTable;
