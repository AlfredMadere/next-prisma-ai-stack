'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { faker } from '@faker-js/faker';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

type FakerMethod = keyof typeof faker | string;

type ValueOption = {
  value: any;
  description: string;
};

type ColumnDefinition = {
  key: string;
  label: string;
  description?: string;
  required?: boolean;
  fakerMethod?: FakerMethod; // Method from faker.js to generate sample data
  valueOptions?: ValueOption[]; // Options for foreign keys or enum values
};

type CsvTextareaParserProps = {
  onSubmit: (data: Record<string, string>[]) => void;
  className?: string; // optional Tailwind container styles
  columns?: ColumnDefinition[]; // expected columns in the CSV
  title?: string; // optional custom title
  exampleRowCount?: number; // number of example rows to generate
};

export function CsvTextareaParser({ 
  onSubmit, 
  className, 
  columns = [], 
  title = "CSV Data Import",
  exampleRowCount = 3
}: CsvTextareaParserProps) {
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExampleOpen, setIsExampleOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true); // Toggle between simple example and prompt
  
  // Generate example CSV data based on column definitions
  const generateExampleCsv = useCallback(() => {
    if (columns.length === 0) return '';
    
    // Generate header row
    const headerRow = columns.map(col => col.key).join(',');
    
    // Generate data rows
    const dataRows = [];
    for (let i = 0; i < exampleRowCount; i++) {
      const row = columns.map(col => {
        // If valueOptions are provided, use them
        if (col.valueOptions && col.valueOptions.length > 0) {
          // Pick a random option from the valueOptions array
          const randomIndex = Math.floor(Math.random() * col.valueOptions.length);
          const option = col.valueOptions[randomIndex];
          return JSON.stringify(option.value);
        }
        
        // Generate value based on faker method if provided
        if (col.fakerMethod) {
          try {
            // Handle nested methods like 'name.firstName'
            const methodPath = col.fakerMethod.split('.');
            let fakerObj: any = faker;
            
            for (const path of methodPath) {
              if (fakerObj[path]) {
                fakerObj = fakerObj[path];
              } else {
                // If method doesn't exist, return a placeholder
                return `[${col.label} example]`;
              }
            }
            
            // If it's a function, call it
            if (typeof fakerObj === 'function') {
              return JSON.stringify(fakerObj());
            }
            
            return `[${col.label} example]`;
          } catch (error) {
            return `[${col.label} example]`;
          }
        }
        
        // Default values if no faker method or valueOptions provided
        switch (col.key.toLowerCase()) {
          case 'name':
          case 'fullname':
            return JSON.stringify(faker.person.fullName());
          case 'email':
            return JSON.stringify(faker.internet.email());
          case 'phone':
            return JSON.stringify(faker.phone.number());
          case 'address':
            return JSON.stringify(faker.location.streetAddress());
          case 'city':
            return JSON.stringify(faker.location.city());
          case 'country':
            return JSON.stringify(faker.location.country());
          case 'description':
          case 'text':
            return JSON.stringify(faker.lorem.sentence());
          case 'id':
            return faker.string.uuid();
          default:
            return `[${col.label} example]`;
        }
      }).join(',');
      
      dataRows.push(row);
    }
    
    return [headerRow, ...dataRows].join('\n');
  }, [columns, exampleRowCount]);
  
  // Generate a structured data generation prompt
  const generateDataPrompt = useCallback(() => {
    if (columns.length === 0) return '';
    
    // Generate column descriptions section
    let prompt = 'Description of columns:\n';
    columns.forEach(col => {
      prompt += `${col.key}\n`;
      prompt += `description: ${col.description || col.label}\n`;
      
      // Determine data type
      let dataType;
      if (col.valueOptions && col.valueOptions.length > 0) {
        // If valueOptions are provided, list the possible values
        dataType = `one of [${col.valueOptions.map(opt => 
          typeof opt.value === 'string' ? `"${opt.value}"` : opt.value
        ).join(', ')}]`;
      } else {
        // Otherwise infer a data type
        switch (col.key.toLowerCase()) {
          case 'id':
            dataType = 'uuid or string';
            break;
          case 'email':
            dataType = 'email address';
            break;
          case 'name':
          case 'fullname':
            dataType = 'person name';
            break;
          case 'phone':
            dataType = 'phone number';
            break;
          case 'date':
          case 'created_at':
          case 'updated_at':
          case 'timestamp':
            dataType = 'date/time';
            break;
          case 'price':
          case 'amount':
          case 'cost':
            dataType = 'decimal number';
            break;
          case 'count':
          case 'quantity':
          case 'age':
            dataType = 'integer';
            break;
          default:
            dataType = 'string';
        }
      }
      
      prompt += `data_type: ${dataType}\n`;
      prompt += `required: ${col.required ? 'true' : 'false'}\n\n`;
    });
    
    // Add example CSV section
    const exampleCsv = generateExampleCsv();
    prompt += '\nExample csv:\n';
    prompt += exampleCsv;
    
    // Add instructions
    prompt += '\n\nInstructions:\n';
    prompt += 'Given the described data above, generate 10 rows of csv data into a copyable text block.';
    
    return prompt;
  }, [columns, generateExampleCsv]);

  // Handle copy to clipboard
  const handleCopyExample = async () => {
    const content = showPrompt ? generateDataPrompt() : generateExampleCsv();
    
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast.success(showPrompt ? 'Prompt copied to clipboard' : 'Example copied to clipboard');
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
      console.error('Copy failed:', error);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvText(e.target.value);
  };

  const handleParse = () => {
    if (!csvText.trim()) {
      toast.error('Please enter CSV data');
      return;
    }

    setIsProcessing(true);

    try {
      Papa.parse(csvText, {
        header: true, // First row is header
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            toast.error('Error parsing CSV', {
              description: results.errors[0].message
            });
            setIsProcessing(false);
            return;
          }

          // Check if we have data
          if (results.data.length === 0) {
            toast.error('No data found in CSV');
            setIsProcessing(false);
            return;
          }

          // Validate that all rows have the same keys
          const firstRowKeys = Object.keys(results.data[0] as Record<string, string>).sort();
          const hasInvalidRows = results.data.some((row) => {
            const rowKeys = Object.keys(row as Record<string, string>).sort();
            return (
              rowKeys.length !== firstRowKeys.length ||
              rowKeys.some((key, i) => key !== firstRowKeys[i])
            );
          });

          if (hasInvalidRows) {
            toast.error('Invalid CSV format', {
              description: 'Some rows have different columns than the header'
            });
            setIsProcessing(false);
            return;
          }
          
          // Validate against expected columns if provided
          if (columns.length > 0) {
            const expectedKeys = columns.filter(col => col.required).map(col => col.key);
            const missingRequiredColumns = expectedKeys.filter(key => !firstRowKeys.includes(key));
            
            if (missingRequiredColumns.length > 0) {
              toast.error('Missing required columns', {
                description: `Missing: ${missingRequiredColumns.join(', ')}`
              });
              setIsProcessing(false);
              return;
            }
          }

          // Success - pass data to callback
          toast.success('CSV parsed successfully', {
            description: `${results.data.length} records found`
          });
          onSubmit(results.data as Record<string, string>[]);
          setIsProcessing(false);
        },
        error: (error) => {
          toast.error('Failed to parse CSV', {
            description: error.message
          });
          setIsProcessing(false);
        }
      });
    } catch (error) {
      toast.error('Failed to process CSV', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      setIsProcessing(false);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {columns.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Expected Columns:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {columns.map((col) => (
                <div key={col.key} className="flex items-start gap-2 text-sm">
                  <div className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    col.required 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {col.required ? "Required" : "Optional"}
                  </div>
                  <div>
                    <div className="font-medium">{col.label} <span className="text-muted-foreground font-mono text-xs">({col.key})</span></div>
                    {col.description && (
                      <div className="text-xs text-muted-foreground">{col.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Example CSV Generator */}
            {columns.length > 0 && (
              <div className="mt-4">
                <Collapsible
                  open={isExampleOpen}
                  onOpenChange={setIsExampleOpen}
                  className="border rounded-md"
                >
                  <div className="flex items-center justify-between px-4 py-2">
                    <h3 className="text-sm font-medium">
                      {showPrompt ? "Data Generation Prompt" : "Example CSV Data"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 mr-2">
                        <Button
                          variant={!showPrompt ? "secondary" : "ghost"}
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setShowPrompt(false)}
                        >
                          CSV
                        </Button>
                        <Button
                          variant={showPrompt ? "secondary" : "ghost"}
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setShowPrompt(true)}
                        >
                          Prompt
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={handleCopyExample}
                        disabled={isCopied}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {isExampleOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {isExampleOpen ? "Close" : "Open"} example
                          </span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  <CollapsibleContent>
                    <div className="px-4 pb-4">
                      {showPrompt ? (
                        <>
                          <pre className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto whitespace-pre">
                            {generateDataPrompt()}
                          </pre>
                          <p className="text-xs text-muted-foreground mt-2">
                            This prompt can be used with AI tools to generate more sample data.
                          </p>
                        </>
                      ) : (
                        <>
                          <pre className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto whitespace-pre">
                            {generateExampleCsv()}
                          </pre>
                          <p className="text-xs text-muted-foreground mt-2">
                            This shows the expected CSV format with example data.
                          </p>
                        </>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Click the copy button to copy to your clipboard.
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
            
            <div className="h-px bg-border my-4"></div>
          </div>
        )}
        <Textarea
          placeholder="Paste your CSV data here..."
          className="min-h-[200px] font-mono text-sm"
          value={csvText}
          onChange={handleTextChange}
        />
        <div className="text-xs text-muted-foreground mt-2">
          First row should contain column headers. Data should be comma-separated.
          {columns.length > 0 && " Column names should match the keys shown above."}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleParse} 
          disabled={isProcessing || !csvText.trim()}
        >
          {isProcessing ? 'Processing...' : 'Parse CSV'}
        </Button>
      </CardFooter>
    </Card>
  );
}
