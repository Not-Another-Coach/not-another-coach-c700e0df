import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, FileText, Database, Code, Settings, Users } from 'lucide-react';
import { PagesDocumentation } from '@/components/documentation/PagesDocumentation';
import { HooksDocumentation } from '@/components/documentation/HooksDocumentation';
import { DatabaseDocumentation } from '@/components/documentation/DatabaseDocumentation';
import { FeaturesDocumentation } from '@/components/documentation/FeaturesDocumentation';
import { APIDocumentation } from '@/components/documentation/APIDocumentation';
import { MessageComposer } from '@/components/documentation/MessageComposer';
import { KBDocumentationTab } from '@/components/knowledge-base/KBDocumentationTab';

const Documentation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [clickedElements, setClickedElements] = useState<string[]>([]);

  const handleElementClick = useCallback((elementText: string) => {
    setClickedElements(prev => [...prev, elementText]);
    
    // Add the element to the message
    setMessage(prev => {
      const separator = prev ? (prev.endsWith(' ') ? '' : ' ') : '';
      return prev + separator + elementText;
    });
  }, []);

  const handleClearElements = useCallback(() => {
    setClickedElements([]);
    setMessage('');
  }, []);

  const handleRemoveElement = useCallback((index: number) => {
    const elementToRemove = clickedElements[index];
    setClickedElements(prev => prev.filter((_, i) => i !== index));
    
    // Remove the element from the message
    setMessage(prev => {
      const regex = new RegExp(`\\b${elementToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      return prev.replace(regex, '').replace(/\s+/g, ' ').trim();
    });
  }, [clickedElements]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Application Documentation
          </h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive reference guide for all pages, features, hooks, and database tables
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="pages" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="apis" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              APIs
            </TabsTrigger>
            <TabsTrigger value="hooks" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Hooks
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="knowledge-base" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Knowledge Base
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="mt-6">
            <PagesDocumentation searchTerm={searchTerm} onElementClick={handleElementClick} />
          </TabsContent>

          <TabsContent value="apis" className="mt-6">
            <APIDocumentation searchTerm={searchTerm} onElementClick={handleElementClick} />
          </TabsContent>

          <TabsContent value="hooks" className="mt-6">
            <HooksDocumentation searchTerm={searchTerm} onElementClick={handleElementClick} />
          </TabsContent>

          <TabsContent value="database" className="mt-6">
            <DatabaseDocumentation searchTerm={searchTerm} onElementClick={handleElementClick} />
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <FeaturesDocumentation searchTerm={searchTerm} onElementClick={handleElementClick} />
          </TabsContent>

          <TabsContent value="knowledge-base" className="mt-6">
            <KBDocumentationTab searchTerm={searchTerm} onElementClick={handleElementClick} />
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <MessageComposer
            message={message}
            setMessage={setMessage}
            clickedElements={clickedElements}
            onClearElements={handleClearElements}
            onRemoveElement={handleRemoveElement}
          />
        </div>
      </div>
    </div>
  );
};

export default Documentation;