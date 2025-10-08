# TICKETr Logo & Branding Guide

## Logo Component

The `Logo` component is a reusable, animated branding element used throughout the application.

### Features

✨ **Animated Gradients**
- Smooth gradient animations on hover
- Continuous subtle color shifting
- Scale effect on hover for interactivity

🎨 **Color Scheme**
- **TICKETr**: Pink → Purple → Deep Purple gradient
- **ai.**: Orange → Orange-Red → Red gradient (orange dominant)
- **consultancy**: Red → Pink → Purple gradient (complementary to orange)

📱 **Responsive Design**
- Three sizes: `sm`, `md`, `lg`
- Automatically adjusts spacing and font sizes
- Icon can be hidden on small screens

### Usage

```tsx
import Logo from '@/components/Logo';

// Default usage (medium size with icon)
<Logo />

// Small size without icon
<Logo size="sm" showIcon={false} />

// Large size with custom class
<Logo size="lg" className="my-custom-class" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showIcon` | `boolean` | `true` | Show/hide the ticket icon |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant of the logo |
| `className` | `string` | `''` | Additional CSS classes |

### Size Specifications

#### Small (`sm`)
- Icon: 6×6 (24px)
- TICKETr: text-base (16px)
- ai.: text-sm (14px)
- consultancy: text-xs (12px)

#### Medium (`md`)
- Icon: 8×8 (32px)
- TICKETr: text-lg (18px)
- ai.: text-base (16px)
- consultancy: text-sm (14px)

#### Large (`lg`)
- Icon: 12×12 (48px)
- TICKETr: text-2xl (24px)
- ai.: text-xl (20px)
- consultancy: text-base (16px)

## Animation Details

### Gradient Shift Animation
```css
@keyframes gradient-shift {
  0%, 100% {
    background-position: left center;
  }
  50% {
    background-position: right center;
  }
}
```
- Duration: 3 seconds
- Timing: ease
- Infinite loop
- Applied to icon background

### Gradient Rotate Animation
```css
@keyframes gradient-rotate {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
```
- Duration: 4 seconds
- Timing: ease
- Infinite loop
- Applied to text gradients

### Hover Effects
- **Icon**: Scale 1.1x, enhanced shadow
- **Text**: Darker gradient colors
- **Container**: Smooth transition (300ms)

## Branding Colors

### TICKETr Brand
- **Primary**: `from-pink-500 via-purple-500 to-purple-600`
- **Hover**: `from-pink-600 via-purple-600 to-purple-700`

### ai. consultancy Brand
- **ai. (Orange)**: `from-orange-500 via-orange-600 to-red-500`
- **ai. Hover**: `from-orange-600 via-red-500 to-red-600`
- **consultancy (Complementary)**: `from-red-500 via-pink-500 to-purple-500`
- **consultancy Hover**: `from-red-600 via-pink-600 to-purple-600`

## Implementation

### Header
```tsx
<Logo size="md" className="flex-shrink-0" />
```
- Located in left corner
- Sticky positioning
- Always visible on scroll

### Footer
```tsx
<Logo size="md" showIcon={true} />
```
- Larger, more prominent display
- Shows full branding with tagline
- Animated gradient in copyright text

### Copyright Text
```tsx
© 2025 
<span className="font-semibold bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent">
  ai.
</span> 
<span className="font-medium bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
  consultancy
</span>
```

## Best Practices

### Do's ✅
- Use the Logo component for all branding
- Keep the gradient colors consistent
- Use appropriate size for context
- Maintain hover effects for interactivity

### Don'ts ❌
- Don't modify gradient colors without updating all instances
- Don't use static colors for the logo
- Don't remove animations unless necessary for performance
- Don't scale the logo beyond the provided sizes

## Accessibility

- Logo is wrapped in a `<Link>` for navigation
- Semantic HTML structure
- Proper contrast ratios for text
- Hover states for keyboard navigation
- Focus visible states (via group classes)

## Performance

- CSS animations (hardware accelerated)
- No JavaScript animations
- Minimal repaints/reflows
- Optimized gradient calculations

## Browser Support

✅ All modern browsers
✅ Chrome/Edge 90+
✅ Firefox 88+
✅ Safari 14+
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Examples

### Landing Page
```tsx
<Logo size="lg" />
```

### Navigation Header
```tsx
<Logo size="md" />
```

### Mobile Menu
```tsx
<Logo size="sm" showIcon={false} />
```

### Email Signatures (Static)
Use exported SVG or PNG of the logo at medium size

---

**Last Updated**: October 7, 2025  
**Version**: 1.0.0  
**Maintained by**: ai. consultancy

