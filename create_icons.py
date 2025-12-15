#!/usr/bin/env python3
"""
Create icons for Dependency Confusion Hunter extension
Author: OFJAAAH
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    """Create icon with specified size"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background circle
    margin = size // 10
    draw.ellipse([margin, margin, size-margin, size-margin],
                 fill=(255, 68, 68, 255))

    # Inner circle
    inner_margin = size // 4
    draw.ellipse([inner_margin, inner_margin, size-inner_margin, size-inner_margin],
                 fill=(30, 30, 46, 255))

    # Draw target symbol
    center = size // 2

    # Outer ring
    ring_thickness = max(2, size // 32)
    ring_radius = size // 3
    draw.ellipse([center-ring_radius, center-ring_radius,
                  center+ring_radius, center+ring_radius],
                 outline=(255, 68, 68, 255), width=ring_thickness)

    # Inner ring
    small_ring_radius = size // 6
    draw.ellipse([center-small_ring_radius, center-small_ring_radius,
                  center+small_ring_radius, center+small_ring_radius],
                 outline=(255, 68, 68, 255), width=ring_thickness)

    # Center dot
    dot_radius = size // 12
    draw.ellipse([center-dot_radius, center-dot_radius,
                  center+dot_radius, center+dot_radius],
                 fill=(255, 68, 68, 255))

    # Crosshair
    line_length = size // 2.5
    line_thickness = max(2, size // 32)
    # Horizontal
    draw.line([center-line_length, center, center+line_length, center],
              fill=(255, 68, 68, 255), width=line_thickness)
    # Vertical
    draw.line([center, center-line_length, center, center+line_length],
              fill=(255, 68, 68, 255), width=line_thickness)

    return img

def main():
    """Create all icon sizes"""
    icons_dir = '/root/PENTEST/confussedExtension/icons'
    os.makedirs(icons_dir, exist_ok=True)

    sizes = [16, 48, 128]

    for size in sizes:
        icon = create_icon(size)
        icon.save(f'{icons_dir}/icon{size}.png', 'PNG')
        print(f'Created icon{size}.png')

    print('All icons created successfully!')

if __name__ == '__main__':
    main()
