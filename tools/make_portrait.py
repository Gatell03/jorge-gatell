"""Retrato para About: recorte 4:5 + revelado cálido tipo copia en papel.

Uso: python tools/make_portrait.py  (original en assets-src/retrato_original.jpg)
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "retrato_original.jpg"
OUT = ROOT / "public" / "retrato.webp"

im = Image.open(SRC).convert("RGB")
w, h = im.size  # 853 x 1280
# Recorte 4:5 centrado en la cara, con aire por encima del pelo
cw = w
ch = int(cw * 5 / 4)
cx = w // 2
top = int(h * 0.15)
im = im.crop((cx - cw // 2, top, cx + cw // 2, top + ch))
im = im.resize((800, 1000), Image.LANCZOS)

# Revelado: algo menos de saturación, contraste suave y tono cálido
im = ImageEnhance.Color(im).enhance(0.82)
im = ImageEnhance.Contrast(im).enhance(0.94)
a = np.asarray(im, dtype=np.float32) / 255
a = 0.04 + a * 0.93                           # negros levantados
a *= np.array([1.03, 1.0, 0.9])               # calidez
paper = np.array([0.965, 0.945, 0.9])         # el blanco de la pared tira a papel
a = a * paper + (1 - paper) * 0.0
rng = np.random.default_rng(3)
a += rng.normal(0, 0.018, a.shape[:2])[..., None]  # grano de película
im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))
im.save(OUT, "WEBP", quality=84, method=6)
print(OUT.name, OUT.stat().st_size // 1024, "KB")
