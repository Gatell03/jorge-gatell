from PIL import Image
import sys

def main():
    try:
        img = Image.open('public/frame_00000.png').convert('RGBA')
        alpha = img.split()[-1]
        bbox = alpha.getbbox()
        
        if bbox:
            c = img.crop(bbox)
            w, h = c.size
            
            # To make the icon look as big as possible (like the Gemini star),
            # we make the square canvas match the width (since it's taller than it is wide).
            # This will clip a little bit of the top and bottom, but it maximizes the size in the tab.
            ns = w
            
            s = Image.new('RGBA', (ns, ns), (0, 0, 0, 0))
            # Center it. The y coordinate will be negative, meaning it clips equally at top/bottom
            s.paste(c, ((ns - w) // 2, (ns - h) // 2))
            s.save('public/favicon.png')
            print('Success: saved tighter favicon as public/favicon.png')
        else:
            print('Empty')
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
