"use client";

import { useState } from "react";
import { CsvTextareaParser } from "@/components/csv-textarea-parser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { importItems } from "@/app/items/import/actions";

export default function ImportItemsPage() {
  const [isImporting, setIsImporting] = useState(false);

  // Column definitions for Items
  const itemColumns = [
    {
      key: 'name',
      label: 'Item Name',
      description: 'The name of the item',
      required: true,
      fakerMethod: 'commerce.productName'
    },
    {
      key: 'description',
      label: 'Description',
      description: 'A brief description of the item',
      required: false,
      fakerMethod: 'commerce.productDescription'
    },
    {
      key: 'type_id',
      label: 'Type ID',
      description: 'Foreign key to the types table',
      required: true,
      valueOptions: [
        { value: 1, description: 'Electronics' },
        { value: 2, description: 'Clothing' },
        { value: 3, description: 'Books' },
        { value: 4, description: 'Home Goods' },
        { value: 5, description: 'Sports Equipment' }
      ]
    }
  ];

  // Handle the parsed CSV data
  const handleParsedData = async (data: any[]) => {
    try {
      setIsImporting(true);
      
      // Call the server action to import items
      const result = await importItems(data);
      
      if (result.success) {
        toast.success(`Successfully imported ${result.data.count} items`);
      } else {
        toast.error(`Error importing items: ${result.error}`);
      }
    } catch (error) {
      console.error("Error importing items:", error);
      toast.error(`Error importing items: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="px-10 py-10 w-full">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Import Items</h1>
      <p className="text-muted-foreground mb-6">
        Use this tool to bulk import items into the database. Items will be associated with the current user.
      </p>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Import Items</CardTitle>
            <CardDescription>
              Paste CSV data with item details or use the example data to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CsvTextareaParser
              columns={itemColumns}
              onParsedData={handleParsedData}
              isProcessing={isImporting}
              exampleRowCount={5}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
