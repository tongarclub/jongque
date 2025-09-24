'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Settings,
  Eye,
  Star,
  RotateCcw,
  Grid,
  List,
  Search,
  Filter
} from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  category: string;
  isFeatured: boolean;
  order: number;
  uploadedAt: string;
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

const IMAGE_CATEGORIES = [
  { value: 'all', label: 'ทั้งหมด', icon: '📷' },
  { value: 'services', label: 'บริการ', icon: '💄' },
  { value: 'interior', label: 'บรรยากาศร้าน', icon: '🏪' },
  { value: 'staff', label: 'ทีมงาน', icon: '👥' },
  { value: 'products', label: 'สินค้า', icon: '🛍️' },
  { value: 'certificates', label: 'ใบประกาศ', icon: '🏆' },
  { value: 'before_after', label: 'ก่อน-หลัง', icon: '✨' },
  { value: 'events', label: 'กิจกรรม', icon: '🎉' }
];

export default function GalleryManagementPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Gallery state
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Edit state
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    isFeatured: false
  });

  useEffect(() => {
    if (session?.user) {
      loadGalleryImages();
    }
  }, [session]);

  useEffect(() => {
    // Filter images based on category and search
    let filtered = images;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(img => img.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(img => 
        img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredImages(filtered);
  }, [images, selectedCategory, searchTerm]);

  const loadGalleryImages = async () => {
    setLoading(true);
    try {
      // Mock API call
      console.log('Loading gallery images...');
      
      // Mock data
      const mockImages: GalleryImage[] = [
        {
          id: '1',
          url: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Hair+Styling',
          title: 'การทำผมสไตล์โมเดิร์น',
          description: 'ผลงานการทำผมแบบโมเดิร์นสไตล์',
          category: 'services',
          isFeatured: true,
          order: 1,
          uploadedAt: '2024-01-15T10:30:00Z',
          fileSize: 245760,
          dimensions: { width: 400, height: 300 }
        },
        {
          id: '2',
          url: 'https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Nail+Art',
          title: 'ศิลปะเล็บสุดชิค',
          description: 'ผลงานทำเล็บแบบต่าง ๆ',
          category: 'services',
          isFeatured: false,
          order: 2,
          uploadedAt: '2024-01-14T14:20:00Z',
          fileSize: 198432,
          dimensions: { width: 400, height: 300 }
        },
        {
          id: '3',
          url: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Salon+Interior',
          title: 'บรรยากาศภายในร้าน',
          description: 'ออกแบบภายในร้านที่อบอุ่น',
          category: 'interior',
          isFeatured: true,
          order: 3,
          uploadedAt: '2024-01-13T09:15:00Z',
          fileSize: 356789,
          dimensions: { width: 400, height: 300 }
        },
        {
          id: '4',
          url: 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Team',
          title: 'ทีมช่างมืออาชีพ',
          description: 'ทีมงานที่มีประสบการณ์',
          category: 'staff',
          isFeatured: false,
          order: 4,
          uploadedAt: '2024-01-12T16:45:00Z',
          fileSize: 287654,
          dimensions: { width: 400, height: 300 }
        }
      ];
      
      setImages(mockImages);
      
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    fileArray.forEach(file => {
      if (file.type.startsWith('image/')) {
        uploadImage(file);
      }
    });
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      console.log('Uploading image:', file.name);
      
      // Mock upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock image object
      const newImage: GalleryImage = {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: URL.createObjectURL(file),
        title: file.name.replace(/\.[^/.]+$/, ""),
        description: '',
        category: 'services',
        isFeatured: false,
        order: images.length + 1,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size,
        dimensions: { width: 400, height: 300 } // Mock dimensions
      };
      
      setImages(prev => [newImage, ...prev]);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setEditForm({
      title: image.title,
      description: image.description || '',
      category: image.category,
      isFeatured: image.isFeatured
    });
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;
    
    setSaving(true);
    try {
      console.log('Updating image:', editingImage.id, editForm);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setImages(prev => prev.map(img => 
        img.id === editingImage.id 
          ? { ...img, ...editForm }
          : img
      ));
      
      setEditingImage(null);
      
    } catch (error) {
      console.error('Error updating image:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('คุณต้องการลบรูปภาพนี้หรือไม่?')) return;
    
    try {
      console.log('Deleting image:', imageId);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setImages(prev => prev.filter(img => img.id !== imageId));
      setSelectedImages(prev => prev.filter(id => id !== imageId));
      
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('เกิดข้อผิดพลาดในการลบรูปภาพ');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return;
    if (!confirm(`คุณต้องการลบรูปภาพ ${selectedImages.length} รูปหรือไม่?`)) return;
    
    try {
      console.log('Bulk deleting images:', selectedImages);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setImages(prev => prev.filter(img => !selectedImages.includes(img.id)));
      setSelectedImages([]);
      
    } catch (error) {
      console.error('Error bulk deleting images:', error);
      alert('เกิดข้อผิดพลาดในการลบรูปภาพ');
    }
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const toggleFeatured = async (imageId: string) => {
    try {
      console.log('Toggling featured status:', imageId);
      
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, isFeatured: !img.isFeatured }
          : img
      ));
      
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-600">คุณต้องเข้าสู่ระบบเพื่อจัดการแกลเลอรี</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <ImageIcon className="h-6 w-6 mr-2" />
                จัดการแกลเลอรี
              </h1>
              <p className="text-gray-600">อัปโหลดและจัดการรูปภาพของร้าน</p>
            </div>
            <div className="flex items-center space-x-3">
              {selectedImages.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  ลบที่เลือก ({selectedImages.length})
                </Button>
              )}
              <Button
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? (
                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Upload Area */}
        <Card className="p-8 mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              ลากไฟล์มาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์
            </p>
            <p className="text-sm text-gray-500">
              รองรับไฟล์ JPG, PNG, GIF ขนาดไม่เกิน 5MB ต่อไฟล์
            </p>
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="mt-4"
            >
              เลือกไฟล์
            </Button>
          </div>
        </Card>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {IMAGE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหารูปภาพ..."
                className="pl-10 w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {filteredImages.length} รูป
            </span>
            <div className="flex rounded-md border border-gray-300">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-sm ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Images Grid/List */}
        {filteredImages.length === 0 ? (
          <Card className="p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">
              {images.length === 0 ? 'ยังไม่มีรูปภาพในแกลเลอรี' : 'ไม่พบรูปภาพที่ตรงกับเงื่อนไข'}
            </p>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <Card key={image.id} className="group overflow-hidden">
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-48 object-cover"
                  />
                  {image.isFeatured && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                      <Star className="h-3 w-3 inline mr-1" />
                      เด่น
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image.id)}
                      onChange={() => toggleImageSelection(image.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(image.url, '_blank')}
                        className="bg-white/90 hover:bg-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(image)}
                        className="bg-white/90 hover:bg-white"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(image.id)}
                        className="bg-white/90 hover:bg-white text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm mb-1 truncate">{image.title}</h3>
                  {image.description && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{image.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{IMAGE_CATEGORIES.find(cat => cat.value === image.category)?.label}</span>
                    <button
                      onClick={() => toggleFeatured(image.id)}
                      className={`${image.isFeatured ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500`}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedImages.length === filteredImages.length && filteredImages.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedImages(filteredImages.map(img => img.id));
                          } else {
                            setSelectedImages([]);
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รูปภาพ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      หมวดหมู่
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ขนาด
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredImages.map((image) => (
                    <tr key={image.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedImages.includes(image.id)}
                          onChange={() => toggleImageSelection(image.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="h-12 w-12 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{image.title}</div>
                        {image.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{image.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {IMAGE_CATEGORIES.find(cat => cat.value === image.category)?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {image.dimensions && `${image.dimensions.width}×${image.dimensions.height}`}
                        </div>
                        {image.fileSize && (
                          <div className="text-sm text-gray-500">{formatFileSize(image.fileSize)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {image.isFeatured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              เด่น
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(image.url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(image)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(image.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">แก้ไขรูปภาพ</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Image Preview */}
              <div className="text-center">
                <img
                  src={editingImage.url}
                  alt={editingImage.title}
                  className="max-w-full h-48 object-cover rounded mx-auto"
                />
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อรูปภาพ
                  </label>
                  <Input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    placeholder="ใส่ชื่อรูปภาพ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    placeholder="ใส่คำอธิบายรูปภาพ"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หมวดหมู่
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      category: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {IMAGE_CATEGORIES.filter(cat => cat.value !== 'all').map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editForm.isFeatured}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        isFeatured: e.target.checked
                      }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">รูปภาพเด่น (แสดงในหน้าแรก)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t">
              <Button
                variant="outline"
                onClick={() => setEditingImage(null)}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
