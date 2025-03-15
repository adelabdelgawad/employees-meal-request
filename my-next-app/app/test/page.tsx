"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import ProductSheet from "@/components/History/ProductSheet";
import { toast } from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  isDeleted?: boolean;
}

export default function RequestsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [products] = useState<Product[]>([
    { id: 1, name: "Product A" },
    { id: 2, name: "Product B" },
    { id: 3, name: "Product C" },
  ]);

  const handleSave = (deletedProducts: Product[]) => {
    console.log("Deleted Products:", deletedProducts);
    toast.success("Changes saved. Check console for deleted items.");
  };

  return (
    <div className="container mx-auto p-4">
      <Button onClick={() => setIsSheetOpen(true)}>Open Product Sheet</Button>
      {isSheetOpen && (
        <ProductSheet
          products={products}
          onSave={handleSave}
          onClose={() => setIsSheetOpen(false)}
        />
      )}
    </div>
  );
}