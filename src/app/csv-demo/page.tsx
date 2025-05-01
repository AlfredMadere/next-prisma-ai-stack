'use client';

import { CsvTextareaParser } from '@/components/csv-textarea-parser';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CsvDemoPage() {
  const handleFlashcardData = (data: Record<string, string>[]) => {
    // In a real application, you would send this data to a server action
    console.log('Parsed flashcard data:', data);
    toast.success(`Processed ${data.length} flashcards`);
  };

  const handleUserData = (data: Record<string, string>[]) => {
    // In a real application, you would send this data to a server action
    console.log('Parsed user data:', data);
    toast.success(`Processed ${data.length} user records`);
  };

  // Column definitions for flashcards
  const flashcardColumns = [
    {
      key: 'front',
      label: 'Front Side',
      description: 'The question or prompt shown to the user',
      required: true,
      fakerMethod: 'lorem.sentence' // Generate a question-like sentence
    },
    {
      key: 'back',
      label: 'Back Side',
      description: 'The answer or content revealed after flipping',
      required: true,
      fakerMethod: 'lorem.paragraph' // Generate an answer-like paragraph
    },
    {
      key: 'category_id',
      label: 'Category',
      description: 'Foreign key to the categories table',
      required: false,
      // Using valueOptions to represent foreign key relationships
      valueOptions: [
        { value: 1, description: 'Programming' },
        { value: 2, description: 'Mathematics' },
        { value: 3, description: 'Science' },
        { value: 4, description: 'Languages' },
        { value: 5, description: 'History' }
      ]
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      description: 'Difficulty level of the flashcard',
      required: false,
      // Using valueOptions for enumerated values
      valueOptions: [
        { value: 'easy', description: 'Beginner level' },
        { value: 'medium', description: 'Intermediate level' },
        { value: 'hard', description: 'Advanced level' }
      ]
    }
  ];

  // Column definitions for users
  const userColumns = [
    {
      key: 'name',
      label: 'Full Name',
      required: true,
      fakerMethod: 'person.fullName'
    },
    {
      key: 'email',
      label: 'Email Address',
      description: 'Must be unique',
      required: true,
      fakerMethod: 'internet.email'
    },
    {
      key: 'role_id',
      label: 'User Role',
      description: 'Foreign key to the roles table',
      required: true,
      // Using valueOptions to represent foreign key relationships
      valueOptions: [
        { value: 1, description: 'Admin - Full system access' },
        { value: 2, description: 'Editor - Can edit content' },
        { value: 3, description: 'User - Basic access' },
        { value: 4, description: 'Guest - Limited access' }
      ]
    },
    {
      key: 'status',
      label: 'Account Status',
      description: 'Current status of the user account',
      required: true,
      valueOptions: [
        { value: 'active', description: 'Account is active' },
        { value: 'inactive', description: 'Account is temporarily disabled' },
        { value: 'pending', description: 'Account awaiting verification' },
        { value: 'banned', description: 'Account permanently disabled' }
      ]
    },
    {
      key: 'last_login',
      label: 'Last Login',
      description: 'Timestamp of the last login',
      required: false,
      fakerMethod: 'date.recent'
    }
  ];

  return (
    <div className="px-10 py-10 w-full">
      <h1 className="text-3xl font-bold tracking-tight mb-6">CSV Data Import Demo</h1>
      <p className="text-muted-foreground mb-6">
        This demo shows how the CSV parser can be used to rapidly seed data for prototyping.
        Select the type of data you want to import below.
      </p>
      
      <Tabs defaultValue="flashcards" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flashcards" className="space-y-6">
          <CsvTextareaParser 
            onSubmit={handleFlashcardData} 
            columns={flashcardColumns}
            title="Import Flashcards"
            exampleRowCount={4}
          />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <CsvTextareaParser 
            onSubmit={handleUserData} 
            columns={userColumns}
            title="Import Users"
            exampleRowCount={5}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
