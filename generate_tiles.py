#!/usr/bin/env python3
"""
Convert GeoTIFF elevation data to XYZ tiles for web mapping
"""

import os
import sys
from pathlib import Path

def check_dependencies():
    """Check if required packages are installed"""
    try:
        import rasterio
        import mercantile
        import PIL
        print("✓ All required packages are available")
        return True
    except ImportError as e:
        print(f"✗ Missing required package: {e}")
        print("Please install required packages:")
        print("pip install rasterio mercantile pillow")
        return False

def generate_tiles():
    """Generate tiles from the GeoTIFF file"""
    if not check_dependencies():
        return False
    
    import rasterio
    from rasterio.warp import transform_bounds, calculate_default_transform
    from rasterio.enums import Resampling
    import mercantile
    from PIL import Image
    import numpy as np
    
    # Input and output paths
    input_tif = Path("static/elevation/dem_35_transparency.tif")
    output_dir = Path("static/tiles/elevation")
    
    if not input_tif.exists():
        print(f"✗ Input file not found: {input_tif}")
        return False
    
    print(f"📁 Input: {input_tif}")
    print(f"📁 Output: {output_dir}")
    
    # Open the GeoTIFF
    with rasterio.open(input_tif) as src:
        print(f"📊 Source CRS: {src.crs}")
        print(f"📊 Source bounds: {src.bounds}")
        print(f"📊 Source size: {src.width}x{src.height}")
        
        # Transform bounds to Web Mercator (EPSG:3857)
        bounds = transform_bounds(src.crs, 'EPSG:4326', *src.bounds)
        print(f"📊 Geographic bounds: {bounds}")
        
        # Determine zoom levels (start with 10-15 for local area)
        min_zoom = 10
        max_zoom = 15
        
        for zoom in range(min_zoom, max_zoom + 1):
            print(f"🔄 Generating zoom level {zoom}...")
            
            # Get tiles that intersect our bounds
            tiles = list(mercantile.tiles(*bounds, [zoom]))
            
            for tile in tiles:
                # Create tile directory
                tile_dir = output_dir / str(zoom) / str(tile.x)
                tile_dir.mkdir(parents=True, exist_ok=True)
                
                # Generate tile image
                tile_path = tile_dir / f"{tile.y}.png"
                
                # Skip if tile already exists
                if tile_path.exists():
                    continue
                
                # Get tile bounds in source CRS
                tile_bounds = mercantile.bounds(tile)
                
                try:
                    # Read data for this tile
                    window = rasterio.windows.from_bounds(
                        *tile_bounds, transform=src.transform
                    )
                    
                    if window.width <= 0 or window.height <= 0:
                        continue
                    
                    data = src.read(1, window=window)
                    
                    if data.size == 0:
                        continue
                    
                    # Resize to 256x256 (standard tile size)
                    from PIL import Image
                    img = Image.fromarray(data).resize((256, 256), Image.Resampling.LANCZOS)
                    
                    # Convert to grayscale with transparency
                    img = img.convert('LA')  # Luminance + Alpha
                    
                    # Save tile
                    img.save(tile_path, 'PNG')
                    
                except Exception as e:
                    print(f"⚠️  Error generating tile {zoom}/{tile.x}/{tile.y}: {e}")
                    continue
            
            print(f"✓ Completed zoom level {zoom} ({len(tiles)} tiles)")
    
    print("🎉 Tile generation complete!")
    return True

if __name__ == "__main__":
    if generate_tiles():
        print("\n🌐 You can now update the JavaScript to use WebTileLayer:")
        print("URL template: 'static/tiles/elevation/{z}/{x}/{y}.png'")
    else:
        print("\n❌ Tile generation failed")
