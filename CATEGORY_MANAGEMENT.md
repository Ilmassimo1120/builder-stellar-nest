# Category Management System

## Overview
The Category Management System allows Global Admin and Admin users to create, edit, and organize product categories and subcategories within the ChargeSource platform.

## Accessing Category Management

1. **Login** as a Global Admin or Admin user
2. Navigate to **Admin Catalogue** (`/admin/catalogue`)
3. Click the **"Manage Categories"** button

## Features

### Categories
- **Add Categories**: Create new top-level product categories
- **Edit Categories**: Update category names and descriptions
- **Delete Categories**: Remove categories (only if no products are assigned)
- **View Product Count**: See how many products are in each category

### Subcategories
- **Add Subcategories**: Create subcategories within any category
- **Edit Subcategories**: Update subcategory details
- **Delete Subcategories**: Remove subcategories (only if no products are assigned)
- **Organize Products**: Help organize products into specific subcategories

## How to Use

### Adding a New Category
1. Click **"Add Category"** button
2. Enter **Category Name** (e.g., "Solar Equipment")
3. Add **Description** (e.g., "Solar panels and related equipment")
4. Click **"Add Category"**

### Adding Subcategories
1. **Select a category** from the left panel
2. Click **"Add Subcategory"** button  
3. Enter **Subcategory Name** (e.g., "Solar Panels")
4. Add **Description** (e.g., "Monocrystalline and polycrystalline solar panels")
5. Click **"Add Subcategory"**

### Editing Categories/Subcategories
1. Click the **Edit** button (pencil icon) next to any category or subcategory
2. Update the **name** and/or **description**
3. Click **"Save Changes"**

### Deleting Categories/Subcategories
1. Click the **Delete** button (trash icon)
2. Confirm the deletion in the dialog
3. **Note**: You cannot delete categories/subcategories that contain products

## Integration with Products

### Automatic Integration
- New categories and subcategories are **immediately available** in the product management interface
- When adding or editing products, you can select from your custom categories
- The product catalog automatically updates to show the new organization

### Product Assignment
1. Go to **"Manage Products"** 
2. When adding/editing a product:
   - Select **Category** from dropdown (shows your custom categories)
   - Select **Subcategory** from dropdown (shows subcategories for selected category)
3. Save the product

### Category Usage
- The **Categories Overview** section shows how many products are in each category
- Categories with products cannot be deleted (protection against data loss)
- Empty categories can be safely removed

## Best Practices

### Naming Categories
- Use **clear, descriptive names** (e.g., "EV Chargers" not "Chargers")
- Keep names **concise** but specific
- Use **consistent naming conventions**

### Organizing Subcategories
- Group related products logically
- Examples:
  - **EV Chargers** → AC Residential, AC Commercial, DC Fast, Ultra-Fast
  - **Accessories** → Cables, Connectors, Mounting Hardware, Safety Equipment
  - **Services** → Installation, Maintenance, Consulting

### Managing Products
- **Assign appropriate categories** when adding products
- **Review category assignments** regularly
- **Move products** to new categories as your catalog grows

## Technical Details

### Data Storage
- Categories are stored in **localStorage** (and will sync to Supabase when connected)
- Changes are **immediately reflected** across the platform
- **Automatic backup** when cloud connection is available

### Permissions
- **Global Admin**: Full access to all category management features
- **Admin**: Full access to all category management features  
- **Other roles**: Cannot access category management

### Validation
- **Unique names**: Category and subcategory names must be unique
- **Required fields**: Category name is required
- **Product protection**: Cannot delete categories/subcategories with assigned products

## Troubleshooting

### Cannot Delete Category
**Issue**: "Cannot delete category: X products are assigned to this category"
**Solution**: 
1. Go to Product Management
2. Move all products from this category to other categories
3. Try deleting the category again

### Changes Not Showing
**Issue**: New categories not appearing in product forms
**Solution**:
1. Refresh the page
2. Close and reopen the product management dialog
3. Categories should automatically update

### Missing Categories
**Issue**: Categories disappeared after browser refresh
**Solution**:
1. Categories are stored locally - check if localStorage is enabled
2. If using cloud mode, categories will sync automatically
3. Contact support if data is lost

## Support

For additional help with category management:
- Check the **Knowledge Base** in the dashboard
- Contact **ChargeSource Support**
- Review the **Admin Documentation**

---

**Remember**: Good category organization makes product management easier and improves the user experience when browsing the catalog!
