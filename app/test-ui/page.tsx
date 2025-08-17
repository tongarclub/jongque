"use client"

import { useState } from "react"
import Link from "next/link"
import { Button, Input, Modal, Label, Card, CardHeader, CardTitle, CardContent } from "@/components/ui"

export default function TestUIPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState("components")
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New booking", message: "คุณมีการจองใหม่", time: "2 นาทีที่แล้ว", type: "info" },
    { id: 2, title: "Payment received", message: "ได้รับการชำระเงินแล้ว", time: "5 นาทีที่แล้ว", type: "success" },
    { id: 3, title: "System maintenance", message: "ระบบจะปิดปรับปรุงในคืนนี้", time: "1 ชั่วโมงที่แล้ว", type: "warning" },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">🎨 UI Components Showcase</h1>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                ← กลับหน้าหลัก
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: "components", label: "🧩 Components", icon: "🧩" },
              { id: "forms", label: "📝 Forms", icon: "📝" },
              { id: "layout", label: "📐 Layout", icon: "📐" },
              { id: "feedback", label: "💬 Feedback", icon: "💬" },
              { id: "navigation", label: "🧭 Navigation", icon: "🧭" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-8 space-y-8">
        {selectedTab === "components" && (
          <div className="space-y-8">
            {/* Existing components content */}
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

          </div>
        )}

        {selectedTab === "forms" && (
          <div className="space-y-8">
            {/* Advanced Form Elements */}
            <Card>
              <CardHeader>
                <CardTitle>📝 Advanced Form Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="select">Select Dropdown</Label>
                    <select className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>เลือกตัวเลือก</option>
                      <option>ตัวเลือก 1</option>
                      <option>ตัวเลือก 2</option>
                      <option>ตัวเลือก 3</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="textarea">Textarea</Label>
                    <textarea 
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={3}
                      placeholder="กรอกข้อความ..."
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="checkbox1" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <Label htmlFor="checkbox1">Checkbox Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="checkbox2" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <Label htmlFor="checkbox2">Checkbox Option 2</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="radio1" name="radio" className="text-blue-600 focus:ring-blue-500" />
                    <Label htmlFor="radio1">Radio Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="radio2" name="radio" className="text-blue-600 focus:ring-blue-500" />
                    <Label htmlFor="radio2">Radio Option 2</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "layout" && (
          <div className="space-y-8">
            {/* Grid System */}
            <Card>
              <CardHeader>
                <CardTitle>📐 Grid System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-100 p-4 rounded text-center">Column 1</div>
                  <div className="bg-green-100 p-4 rounded text-center">Column 2</div>
                  <div className="bg-yellow-100 p-4 rounded text-center">Column 3</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="bg-gray-100 p-2 rounded text-center text-sm">Item {i}</div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Spacing Examples */}
            <Card>
              <CardHeader>
                <CardTitle>📏 Spacing Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-2 bg-red-100 rounded">Padding Small (p-2)</div>
                  <div className="p-4 bg-blue-100 rounded">Padding Medium (p-4)</div>
                  <div className="p-8 bg-green-100 rounded">Padding Large (p-8)</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "feedback" && (
          <div className="space-y-8">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>💬 Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      notification.type === 'success' ? 'bg-green-50 border-green-400' :
                      notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Alert Messages */}
            <Card>
              <CardHeader>
                <CardTitle>🚨 Alert Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  <strong>Success!</strong> การดำเนินการสำเร็จแล้ว
                </div>
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                  <strong>Warning!</strong> กรุณาตรวจสอบข้อมูลอีกครั้ง
                </div>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <strong>Error!</strong> เกิดข้อผิดพลาดในระบบ
                </div>
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                  <strong>Info!</strong> ข้อมูลเพิ่มเติมสำหรับผู้ใช้
                </div>
              </CardContent>
            </Card>

            {/* Progress Bars */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Progress Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Progress 25%</span>
                    <span className="text-sm text-gray-500">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '25%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Progress 50%</span>
                    <span className="text-sm text-gray-500">50%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '50%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Progress 75%</span>
                    <span className="text-sm text-gray-500">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === "navigation" && (
          <div className="space-y-8">
            {/* Breadcrumbs */}
            <Card>
              <CardHeader>
                <CardTitle>🧭 Breadcrumbs</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                      <a href="#" className="text-gray-700 hover:text-blue-600">หน้าหลัก</a>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <span className="mx-2 text-gray-400">/</span>
                        <a href="#" className="text-gray-700 hover:text-blue-600">UI Components</a>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <span className="mx-2 text-gray-400">/</span>
                        <span className="text-gray-500">Navigation</span>
                      </div>
                    </li>
                  </ol>
                </nav>
              </CardContent>
            </Card>

            {/* Pagination */}
            <Card>
              <CardHeader>
                <CardTitle>📄 Pagination</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button variant="outline">ก่อนหน้า</Button>
                    <Button variant="outline">ถัดไป</Button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        แสดง <span className="font-medium">1</span> ถึง <span className="font-medium">10</span> จาก{' '}
                        <span className="font-medium">97</span> รายการ
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <Button variant="outline" size="sm">ก่อนหน้า</Button>
                        <Button variant="outline" size="sm" className="bg-blue-50 border-blue-500 text-blue-600">1</Button>
                        <Button variant="outline" size="sm">2</Button>
                        <Button variant="outline" size="sm">3</Button>
                        <Button variant="outline" size="sm">ถัดไป</Button>
                      </nav>
                    </div>
                  </div>
                </nav>
              </CardContent>
            </Card>

            {/* Menu Items */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Menu Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <span className="mr-3">🏠</span>
                    <span>หน้าหลัก</span>
                  </div>
                  <div className="flex items-center p-3 rounded-lg bg-blue-100 text-blue-700">
                    <span className="mr-3">🎨</span>
                    <span>UI Components</span>
                  </div>
                  <div className="flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <span className="mr-3">⚙️</span>
                    <span>การตั้งค่า</span>
                  </div>
                  <div className="flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <span className="mr-3">👤</span>
                    <span>โปรไฟล์</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
    </div>
  )
}
