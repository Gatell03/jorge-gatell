from PIL import Image
import numpy as np

def make_sepia(image_path, output_path):
    # Open the image and ensure it's in RGB mode
    img = Image.open(image_path).convert('RGB')
    
    # Convert image to numpy array
    img_data = np.array(img, dtype=np.float32)
    
    # Sepia matrix (stronger brownish effect)
    # The standard matrix is:
    # R = (R * .393) + (G *.769) + (B * .189)
    # G = (R * .349) + (G *.686) + (B * .168)
    # B = (R * .272) + (G *.534) + (B * .131)
    
    # Since the user asked for "more sepia, more brownish", let's increase the red and green a bit, and decrease the blue
    sepia_matrix = np.array([
        [0.45, 0.82, 0.22],
        [0.39, 0.73, 0.19],
        [0.28, 0.55, 0.15]
    ])
    
    # Apply matrix multiplication
    sepia_data = img_data.dot(sepia_matrix.T)
    
    # Clip values to 0-255
    sepia_data = np.clip(sepia_data, 0, 255).astype(np.uint8)
    
    # Create new image from array
    sepia_img = Image.fromarray(sepia_data)
    
    # Blend with the original image somewhat if needed, or just save it
    # But since it already had some sepia, we can blend it with an overlay of a brown color for more effect.
    
    # Let's add a brown tint overlay
    brown_tint = Image.new('RGB', img.size, (112, 66, 20)) # Dark brown
    # Blend sepia and brown tint using multiply or blend
    final_img = Image.blend(sepia_img, brown_tint, alpha=0.15)
    
    # Save the image
    final_img.save(output_path)
    print(f"Saved {output_path}")

make_sepia('public/ltspice.png', 'public/ltspice.png')
make_sepia('public/Simulador de circuitos.png', 'public/Simulador de circuitos.png')

