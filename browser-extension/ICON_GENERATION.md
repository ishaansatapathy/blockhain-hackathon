# TrustVault SafePay Icon Generation

The extension requires icons in PNG format at three sizes:
- 16x16 pixels (toolbar icon on small screens)
- 48x48 pixels (extension management page)  
- 128x128 pixels (Chrome Web Store)

## Quick Icon Creation

### Option 1: Using Online Tools
1. Visit [Photopea.com](https://www.photopea.com) or [Canva.com](https://www.canva.com)
2. Create a new image at each size (16x16, 48x48, 128x128)
3. Design with:
   - **Orange gradient background** (#ff9933 to #e85d04)
   - **Shield icon/symbol** in the center
   - **White or light color** for contrast
4. Export as PNG
5. Save to `images/` folder:
   - `icon-16.png`
   - `icon-48.png`
   - `icon-128.png`

### Option 2: Using ImageMagick (Windows)
```powershell
# Install ImageMagick if not already installed
# Download from: https://imagemagick.org/script/download.php

# Create SVG template
# Save the SVG below to icon.svg
# Then convert each size:

magick convert -background none icon.svg -resize 16x16 icon-16.png
magick convert -background none icon.svg -resize 48x48 icon-48.png
magick convert -background none icon.svg -resize 128x128 icon-128.png
```

### Option 3: Using Python PIL (Recommended)
```python
from PIL import Image, ImageDraw

sizes = [(16, 16), (48, 48), (128, 128)]

for size in sizes:
    # Create image with orange gradient
    img = Image.new('RGB', size, color='#ff9933')
    
    # Draw shield outline
    draw = ImageDraw.Draw(img)
    padding = int(size[0] * 0.2)
    
    # Shield shape (simplified)
    points = [
        (padding, padding),  # top-left
        (size[0]-padding, padding),  # top-right
        (size[0]-padding, size[1]*0.6),  # right middle
        (size[0]//2, size[1]-padding),  # bottom point
        (padding, size[1]*0.6),  # left middle
    ]
    
    draw.polygon(points, fill='#e85d04', outline='#ffffff')
    draw.text((size[0]//2-2, size[1]//2-2), 'V', fill='white')
    
    img.save(f'images/icon-{size[0]}.png')
```

### Option 4: SVG Template
Save this as `icon.svg` and convert using any SVG to PNG tool:

```svg
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff9933;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e85d04;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="64" cy="64" r="64" fill="url(#grad)"/>
  
  <!-- Shield outline -->
  <path d="M 32 32 L 96 32 L 96 64 Q 64 96 64 96 Q 32 64 32 64 Z" 
        fill="none" stroke="white" stroke-width="3"/>
  
  <!-- Check mark inside shield -->
  <path d="M 48 64 L 60 76 L 80 52" 
        fill="none" stroke="white" stroke-width="4" 
        stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Text "V" for Vault -->
  <text x="64" y="70" font-family="Arial, sans-serif" font-size="32" 
        font-weight="bold" fill="white" text-anchor="middle">V</text>
</svg>
```

## After Icon Creation

1. Place all three PNG files in the `images/` directory
2. Run the extension in Chrome to verify icons display correctly
3. Check manifest.json has correct icon paths:
   ```json
   "icons": {
     "16": "images/icon-16.png",
     "48": "images/icon-48.png",
     "128": "images/icon-128.png"
   }
   ```

## Icon Design Guidelines

- **Color**: Orange gradient (#ff9933 → #e85d04) with white accents
- **Symbol**: Shield with checkmark (represents trust/security verification)
- **Style**: Flat design, clear at small sizes
- **Accessibility**: High contrast white on orange for visibility
- **Consistency**: Same design scaled to each size (no complex details that won't render at 16px)

## Testing Icons

1. Open Chrome Extension Management (`chrome://extensions/`)
2. Enable "Developer mode" (top right)
3. Load unpacked extension from this folder
4. Icons should appear in the toolbar and extension list
5. Verify all three sizes display correctly

## Icon Checklist
- [ ] icon-16.png created (16x16 pixels)
- [ ] icon-48.png created (48x48 pixels)
- [ ] icon-128.png created (128x128 pixels)
- [ ] All files in `images/` folder
- [ ] manifest.json references correct paths
- [ ] Extension loads without icon errors
- [ ] Icons display in toolbar and management page
