# Adding Your Charge N Go Logo

## Quick Setup

To add your actual Charge N Go logo to the application:

1. **Add your logo file** to the `public/` directory:

   ```
   public/
   ├── logo-charge-n-go.png     # Your logo file
   ├── favicon.ico
   └── ...
   ```

2. **Update the Logo component** in `client/components/ui/logo.tsx`:

   **Replace this line:**

   ```tsx
   <PlugZap className={`${sizeClasses[size]} text-primary`} />
   ```

   **With this:**

   ```tsx
   <img
     src="/logo-charge-n-go.png"
     alt="Charge N Go"
     className={`${sizeClasses[size]} object-contain`}
   />
   ```

## Logo Requirements

- **Format**: PNG with transparent background (recommended)
- **Size**: Minimum 200x200px for best quality
- **Style**: Should work well on both light and dark backgrounds
- **File name**: `logo-charge-n-go.png` (or update the src path accordingly)

## Current Implementation

The logo component is now used consistently across:

- ✅ Homepage header and footer
- ✅ Dashboard header
- ✅ All placeholder pages
- ✅ Responsive sizing (sm, md, lg)

## Customization Options

You can customize the logo display by modifying the `Logo` component props:

- `size`: "sm" | "md" | "lg"
- `showText`: true/false (to show/hide "Charge N Go" text)
- `className`: Additional CSS classes

## Alternative: SVG Logo

For better scalability, you can also use an SVG:

```tsx
<img
  src="/logo-charge-n-go.svg"
  alt="Charge N Go"
  className={`${sizeClasses[size]} object-contain`}
/>
```
