import numpy as np
from skimage import exposure
from PIL import Image

def match_image_color(source_path, reference_path, output_path):
    # Read the images
    src = np.array(Image.open(source_path).convert('RGB'))
    ref = np.array(Image.open(reference_path).convert('RGB'))
    
    # Match histograms
    matched = exposure.match_histograms(src, ref, channel_axis=-1)
    
    # Save the result
    matched_img = Image.fromarray(matched.astype(np.uint8))
    matched_img.save(output_path)
    print(f"Matched {source_path} to {reference_path} and saved as {output_path}")

try:
    # Use APIREST.png as the reference color tone
    reference = 'public/APIREST.png'
    match_image_color('public/ltspice.png', reference, 'public/ltspice.png')
    match_image_color('public/Simulador de circuitos.png', reference, 'public/Simulador de circuitos.png')
except Exception as e:
    print(f"Error: {e}")
