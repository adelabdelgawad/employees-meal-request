// components/ProductSheet/ProductSheet.tsx
"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ProductTable from "./ProductTable";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { toast } from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  isDeleted?: boolean;
}

interface ProductSheetProps {
  products: Product[];
  onSave: (deletedProducts: Product[]) => void;
  onClose: () => void;
}

export default function ProductSheet({
  products: initialProducts,
  onSave,
  onClose,
}: ProductSheetProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const handleDelete = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isDeleted: true } : p))
    );
    toast.success("Product marked for deletion");
  };

  const handleUndo = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isDeleted: false } : p))
    );
    toast.success("Product restored");
  };

  const handleSave = () => {
    const deletedProducts = products.filter((p) => p.isDeleted);
    if (deletedProducts.length > 0) {
      setShowSaveConfirmation(true);
    } else {
      onSave([]);
      onClose();
    }
  };

  const confirmSave = () => {
    const deletedProducts = products.filter((p) => p.isDeleted);
    onSave(deletedProducts);
    setShowSaveConfirmation(false);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <>
      <Sheet open onOpenChange={onClose}>
        <SheetContent className="sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>Product List</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <ProductTable
              products={products}
              onDelete={handleDelete}
              onUndo={handleUndo}
            />
          </div>
          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmationDialog
        isOpen={showSaveConfirmation}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete ${products.filter(p => p.isDeleted).length} product(s)?`}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={confirmSave}
        onCancel={() => setShowSaveConfirmation(false)}
        confirmButtonVariant="destructive"
      />
    </>
  );
}
