
// components/ProductSheet/ProductTable.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash, Undo } from "lucide-react";

interface Product {
  id: number;
  name: string;
  isDeleted?: boolean;
}

interface ProductTableProps {
  products: Product[];
  onDelete: (id: number) => void;
  onUndo: (id: number) => void;
}

export default function ProductTable({
  products,
  onDelete,
  onUndo,
}: ProductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow
            key={product.id}
            className={product.isDeleted ? "line-through text-gray-500" : ""}
          >
            <TableCell>{product.id}</TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>
              {product.isDeleted ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUndo(product.id)}
                >
                  <Undo className="h-4 w-4 mr-2" />
                  Undo
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(product.id)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
