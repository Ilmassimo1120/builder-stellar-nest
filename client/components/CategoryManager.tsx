import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  FolderPlus,
  Folder,
  ChevronRight,
  Save,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { ProductCategory, ProductSubcategory } from "@/lib/productCatalog";
import { categoryService } from "@/lib/categoryService";

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesChanged: () => void;
}

export default function CategoryManager({
  isOpen,
  onClose,
  onCategoriesChanged,
}: CategoryManagerProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<ProductCategory[]>(
    categoryService.getCategories()
  );
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<ProductSubcategory | null>(null);

  // Form state
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editCategory, setEditCategory] = useState<ProductCategory | null>(null);
  const [newSubcategory, setNewSubcategory] = useState({ name: "", description: "" });

  // Drag and drop state
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [draggedSubcategory, setDraggedSubcategory] = useState<string | null>(null);
  const [dragOverSubcategory, setDragOverSubcategory] = useState<string | null>(null);

  const refreshCategories = () => {
    const updatedCategories = categoryService.getCategories();
    setCategories(updatedCategories);
    onCategoriesChanged();
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      categoryService.addCategory(newCategory.name, newCategory.description);
      setNewCategory({ name: "", description: "" });
      setIsAddingCategory(false);
      refreshCategories();
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = () => {
    if (!editCategory || !editCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      categoryService.updateCategory(editCategory.id, {
        name: editCategory.name,
        description: editCategory.description,
      });
      setEditCategory(null);
      setIsEditingCategory(false);
      refreshCategories();
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    try {
      const productsInCategory = categoryService.getProductsInCategory(categoryId);
      if (productsInCategory > 0) {
        toast({
          title: "Cannot Delete",
          description: `This category contains ${productsInCategory} products. Please move or delete all products first.`,
          variant: "destructive",
        });
        return;
      }

      categoryService.deleteCategory(categoryId);
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
      }
      refreshCategories();
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleAddSubcategory = () => {
    if (!selectedCategory || !newSubcategory.name.trim()) {
      toast({
        title: "Error",
        description: "Subcategory name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      categoryService.addSubcategory(
        selectedCategory.id,
        newSubcategory.name,
        newSubcategory.description
      );
      setNewSubcategory({ name: "", description: "" });
      setIsAddingSubcategory(false);
      refreshCategories();
      // Update selected category to show new subcategory
      const updatedCategory = categoryService.getCategory(selectedCategory.id);
      if (updatedCategory) setSelectedCategory(updatedCategory);
      toast({
        title: "Success",
        description: "Subcategory added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add subcategory",
        variant: "destructive",
      });
    }
  };

  const handleEditSubcategory = () => {
    if (!editingSubcategory || !editingSubcategory.name.trim()) {
      toast({
        title: "Error",
        description: "Subcategory name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      categoryService.updateSubcategory(editingSubcategory.id, {
        name: editingSubcategory.name,
        description: editingSubcategory.description,
      });
      setEditingSubcategory(null);
      refreshCategories();
      // Update selected category to show updated subcategory
      if (selectedCategory) {
        const updatedCategory = categoryService.getCategory(selectedCategory.id);
        if (updatedCategory) setSelectedCategory(updatedCategory);
      }
      toast({
        title: "Success",
        description: "Subcategory updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subcategory",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubcategory = (subcategoryId: string) => {
    try {
      const productsInSubcategory = categoryService.getProductsInSubcategory(subcategoryId);
      if (productsInSubcategory > 0) {
        toast({
          title: "Cannot Delete",
          description: `This subcategory contains ${productsInSubcategory} products. Please move or delete all products first.`,
          variant: "destructive",
        });
        return;
      }

      categoryService.deleteSubcategory(subcategoryId);
      refreshCategories();
      // Update selected category to remove deleted subcategory
      if (selectedCategory) {
        const updatedCategory = categoryService.getCategory(selectedCategory.id);
        if (updatedCategory) setSelectedCategory(updatedCategory);
      }
      toast({
        title: "Success",
        description: "Subcategory deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete subcategory",
        variant: "destructive",
      });
    }
  };

  // Category drag handlers
  const handleCategoryDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategory(categoryId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCategoryDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCategory(categoryId);
  };

  const handleCategoryDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleCategoryDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    setDragOverCategory(null);

    if (draggedCategory && draggedCategory !== targetCategoryId) {
      const newOrder = [...categories];
      const draggedIndex = newOrder.findIndex(cat => cat.id === draggedCategory);
      const targetIndex = newOrder.findIndex(cat => cat.id === targetCategoryId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedItem] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedItem);

        categoryService.reorderCategories(newOrder.map(cat => cat.id));
        refreshCategories();

        toast({
          title: "Success",
          description: "Category order updated successfully",
        });
      }
    }

    setDraggedCategory(null);
  };

  const handleMoveCategoryUp = (categoryId: string) => {
    if (categoryService.moveCategoryUp(categoryId)) {
      refreshCategories();
      toast({
        title: "Success",
        description: "Category moved up successfully",
      });
    }
  };

  const handleMoveCategoryDown = (categoryId: string) => {
    if (categoryService.moveCategoryDown(categoryId)) {
      refreshCategories();
      toast({
        title: "Success",
        description: "Category moved down successfully",
      });
    }
  };

  // Subcategory drag handlers
  const handleSubcategoryDragStart = (e: React.DragEvent, subcategoryId: string) => {
    setDraggedSubcategory(subcategoryId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSubcategoryDragOver = (e: React.DragEvent, subcategoryId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSubcategory(subcategoryId);
  };

  const handleSubcategoryDragLeave = () => {
    setDragOverSubcategory(null);
  };

  const handleSubcategoryDrop = (e: React.DragEvent, targetSubcategoryId: string) => {
    e.preventDefault();
    setDragOverSubcategory(null);

    if (draggedSubcategory && draggedSubcategory !== targetSubcategoryId && selectedCategory) {
      const newOrder = [...selectedCategory.subcategories];
      const draggedIndex = newOrder.findIndex(sub => sub.id === draggedSubcategory);
      const targetIndex = newOrder.findIndex(sub => sub.id === targetSubcategoryId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedItem] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedItem);

        categoryService.reorderSubcategories(selectedCategory.id, newOrder.map(sub => sub.id));
        refreshCategories();

        // Update selected category
        const updatedCategory = categoryService.getCategory(selectedCategory.id);
        if (updatedCategory) setSelectedCategory(updatedCategory);

        toast({
          title: "Success",
          description: "Subcategory order updated successfully",
        });
      }
    }

    setDraggedSubcategory(null);
  };

  const handleMoveSubcategoryUp = (subcategoryId: string) => {
    if (categoryService.moveSubcategoryUp(subcategoryId)) {
      refreshCategories();
      if (selectedCategory) {
        const updatedCategory = categoryService.getCategory(selectedCategory.id);
        if (updatedCategory) setSelectedCategory(updatedCategory);
      }
      toast({
        title: "Success",
        description: "Subcategory moved up successfully",
      });
    }
  };

  const handleMoveSubcategoryDown = (subcategoryId: string) => {
    if (categoryService.moveSubcategoryDown(subcategoryId)) {
      refreshCategories();
      if (selectedCategory) {
        const updatedCategory = categoryService.getCategory(selectedCategory.id);
        if (updatedCategory) setSelectedCategory(updatedCategory);
      }
      toast({
        title: "Success",
        description: "Subcategory moved down successfully",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Category Management
          </DialogTitle>
          <DialogDescription>
            Manage product categories and subcategories. Drag items to reorder or use the up/down buttons.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          {/* Categories List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Categories</h3>
              <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>
                      Create a new product category for organizing your products.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category-name">Category Name</Label>
                      <Input
                        id="category-name"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory({ ...newCategory, name: e.target.value })
                        }
                        placeholder="e.g., EV Chargers"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category-description">Description</Label>
                      <Textarea
                        id="category-description"
                        value={newCategory.description}
                        onChange={(e) =>
                          setNewCategory({ ...newCategory, description: e.target.value })
                        }
                        placeholder="Brief description of this category"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCategory}>Add Category</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {categories.map((category) => {
                const productCount = categoryService.getProductsInCategory(category.id);
                return (
                  <Card
                    key={category.id}
                    draggable
                    onDragStart={(e) => handleCategoryDragStart(e, category.id)}
                    onDragOver={(e) => handleCategoryDragOver(e, category.id)}
                    onDragLeave={handleCategoryDragLeave}
                    onDrop={(e) => handleCategoryDrop(e, category.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedCategory?.id === category.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    } ${
                      draggedCategory === category.id ? "opacity-50 scale-105" : ""
                    } ${
                      dragOverCategory === category.id ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{category.name}</h4>
                              <Badge variant="outline">{productCount} products</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {category.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {category.subcategories.length} subcategories
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveCategoryUp(category.id);
                              }}
                              disabled={categories.findIndex(c => c.id === category.id) === 0}
                            >
                              <ChevronUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveCategoryDown(category.id);
                              }}
                              disabled={categories.findIndex(c => c.id === category.id) === categories.length - 1}
                            >
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                          </div>
                          <Dialog open={isEditingCategory && editCategory?.id === category.id} onOpenChange={(open) => {
                            setIsEditingCategory(open);
                            if (open) setEditCategory({ ...category });
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Category</DialogTitle>
                                <DialogDescription>
                                  Update the category name and description.
                                </DialogDescription>
                              </DialogHeader>
                              {editCategory && (
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-category-name">Category Name</Label>
                                    <Input
                                      id="edit-category-name"
                                      value={editCategory.name}
                                      onChange={(e) =>
                                        setEditCategory({ ...editCategory, name: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-category-description">Description</Label>
                                    <Textarea
                                      id="edit-category-description"
                                      value={editCategory.description}
                                      onChange={(e) =>
                                        setEditCategory({ ...editCategory, description: e.target.value })
                                      }
                                      rows={3}
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditingCategory(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleEditCategory}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                  All subcategories will also be deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Subcategories List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedCategory ? `${selectedCategory.name} Subcategories` : "Subcategories"}
              </h3>
              {selectedCategory && (
                <Dialog open={isAddingSubcategory} onOpenChange={setIsAddingSubcategory}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Add Subcategory
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Subcategory to {selectedCategory.name}</DialogTitle>
                      <DialogDescription>
                        Create a new subcategory within this category.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="subcategory-name">Subcategory Name</Label>
                        <Input
                          id="subcategory-name"
                          value={newSubcategory.name}
                          onChange={(e) =>
                            setNewSubcategory({ ...newSubcategory, name: e.target.value })
                          }
                          placeholder="e.g., AC Chargers - Residential"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subcategory-description">Description</Label>
                        <Textarea
                          id="subcategory-description"
                          value={newSubcategory.description}
                          onChange={(e) =>
                            setNewSubcategory({ ...newSubcategory, description: e.target.value })
                          }
                          placeholder="Brief description of this subcategory"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddingSubcategory(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddSubcategory}>Add Subcategory</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {selectedCategory ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {selectedCategory.subcategories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No subcategories yet</p>
                    <p className="text-sm">Add your first subcategory to get started</p>
                  </div>
                ) : (
                  selectedCategory.subcategories.map((subcategory) => {
                    const productCount = categoryService.getProductsInSubcategory(subcategory.id);
                    const isEditing = editingSubcategory?.id === subcategory.id;
                    
                    return (
                      <Card
                        key={subcategory.id}
                        draggable={!isEditing}
                        onDragStart={(e) => !isEditing && handleSubcategoryDragStart(e, subcategory.id)}
                        onDragOver={(e) => !isEditing && handleSubcategoryDragOver(e, subcategory.id)}
                        onDragLeave={!isEditing ? handleSubcategoryDragLeave : undefined}
                        onDrop={(e) => !isEditing && handleSubcategoryDrop(e, subcategory.id)}
                        className={`transition-colors ${
                          draggedSubcategory === subcategory.id ? "opacity-50 scale-105" : ""
                        } ${
                          dragOverSubcategory === subcategory.id ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          {isEditing ? (
                            <div className="space-y-3">
                              <Input
                                value={editingSubcategory.name}
                                onChange={(e) =>
                                  setEditingSubcategory({ ...editingSubcategory, name: e.target.value })
                                }
                                placeholder="Subcategory name"
                              />
                              <Textarea
                                value={editingSubcategory.description}
                                onChange={(e) =>
                                  setEditingSubcategory({ ...editingSubcategory, description: e.target.value })
                                }
                                placeholder="Description"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleEditSubcategory}>
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => setEditingSubcategory(null)}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-medium">{subcategory.name}</h5>
                                    <Badge variant="secondary">{productCount} products</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {subcategory.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="flex flex-col gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveSubcategoryUp(subcategory.id);
                                    }}
                                    disabled={selectedCategory!.subcategories.findIndex(s => s.id === subcategory.id) === 0}
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveSubcategoryDown(subcategory.id);
                                    }}
                                    disabled={selectedCategory!.subcategories.findIndex(s => s.id === subcategory.id) === selectedCategory!.subcategories.length - 1}
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </Button>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setEditingSubcategory({ ...subcategory })}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{subcategory.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteSubcategory(subcategory.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a category to view its subcategories</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
