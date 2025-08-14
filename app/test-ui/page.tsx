"use client"

import { useState } from "react"
import { Button, Input, Modal, Label, Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui"

export default function TestUIPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">UI Components Test</h1>
      
      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent className="space-x-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </CardContent>
      </Card>

      {/* Button Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>Button Sizes</CardTitle>
        </CardHeader>
        <CardContent className="space-x-4 flex items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🚀</Button>
        </CardContent>
      </Card>

      {/* Form Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email" 
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Enter your password" 
              className="mt-1"
            />
          </div>
          <Button className="w-full">Submit</Button>
        </CardContent>
      </Card>

      {/* Modal */}
      <Card>
        <CardHeader>
          <CardTitle>Modal Dialog</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>
        </CardContent>
      </Card>

      {/* Colors Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Color System</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-primary h-16 rounded flex items-center justify-center text-primary-foreground">
            Primary
          </div>
          <div className="bg-secondary h-16 rounded flex items-center justify-center text-secondary-foreground">
            Secondary
          </div>
          <div className="bg-muted h-16 rounded flex items-center justify-center text-muted-foreground">
            Muted
          </div>
          <div className="bg-destructive h-16 rounded flex items-center justify-center text-destructive-foreground">
            Destructive
          </div>
        </CardContent>
      </Card>

      {/* Modal Component */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Test Modal"
        size="md"
      >
        <div className="space-y-4">
          <p>This is a test modal to demonstrate the Modal component.</p>
          <div>
            <Label htmlFor="modal-input">Input in Modal</Label>
            <Input 
              id="modal-input" 
              placeholder="Type something..."
              className="mt-1"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
