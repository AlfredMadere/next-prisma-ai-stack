"use client";

import { useState } from "react";
import { CsvTextareaParser } from "@/components/csv-textarea-parser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { importTypes } from "./actions";

export default function ImportTypesPage() {
  const [isImporting, setIsImporting] = useState(false);

  // Column definitions for Types
  const typeColumns = [
    {
      key: 'name',
      label: 'Type Name',
      description: 'The name of the item type',
      required: true,
      fakerMethod: 'commerce.department'
    },
    {
      key: 'description',
      label: 'Description',
      description: 'A brief description of the item type',
      required: false,
      fakerMethod: 'commerce.productAdjective'
    }
  ];

  // Handle the parsed CSV data
  const handleParsedData = async (data: any[]) => {
    try {
      setIsImporting(true);
      
      // Call the server action to import types
      const result = await importTypes(data);
      
      if (result.success) {
        toast.success(`Successfully imported ${result.data.count} types`);
      } else {
        toast.error(`Error importing types: ${result.error}`);
      }
    } catch (error) {
      console.error("Error importing types:", error);
      toast.error(`Error importing types: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="px-10 py-10 w-full">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Import Item Types</h1>
      <p className="text-muted-foreground mb-6">
        Use this tool to bulk import item types into the database. These types can be used to categorize items.
      </p>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Import Types</CardTitle>
            <CardDescription>
              Paste CSV data with type details or use the example data to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CsvTextareaParser
              columns={typeColumns}
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
