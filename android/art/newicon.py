#!/usr/bin/env python3
"""App icon from the owner's artwork (icon-source.png, 1254² with black rounded-corner outside).
- adaptive icon (Android 8+): the art fills 76 of the 108 dp layer (the launcher mask shows the middle ~72 dp, so ~95 % of
  the art is visible); the rest of the layer is the art blown up and blurred so parallax / odd masks never show an edge.
- legacy icon (Android 7): the art with rounded corners, 48 dp.
- Play Store icon: 512² square (Play rounds the corners itself).
usage: python3 newicon.py   (run from android/art)"""
from PIL import Image, ImageDraw, ImageFilter
import os
src = Image.open('icon-source.png').convert('RGB')
w, h = src.size
INSET = 70   # the source's rounded corner (r≈215 px) is fully outside this square
art = src.crop((INSET, INSET, w - INSET, h - INSET))
R = '../app/src/main/res/'
D = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}

def layer(px):
    big = art.resize((px, px), Image.LANCZOS).filter(ImageFilter.GaussianBlur(px / 30))
    a = int(round(px * 76 / 108))
    big.paste(art.resize((a, a), Image.LANCZOS), ((px - a) // 2, (px - a) // 2))
    return big

for n, k in D.items():
    os.makedirs(R + 'mipmap-' + n, exist_ok=True)
    layer(int(108 * k)).save(R + 'mipmap-%s/ic_launcher_background.png' % n)
    Image.new('RGBA', (int(108 * k),) * 2, (0, 0, 0, 0)).save(R + 'mipmap-%s/ic_launcher_foreground.png' % n)
    for f in ['ic_launcher_monochrome.png']:
        p = R + 'mipmap-%s/%s' % (n, f)
        if os.path.exists(p): os.remove(p)
    # legacy: rounded square with a small margin
    S = int(48 * k); m = int(round(2 * k)); inner = S - 2 * m
    big = art.resize((inner * 4, inner * 4), Image.LANCZOS).convert('RGBA')
    mask = Image.new('L', big.size, 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, big.width - 1, big.height - 1), radius=int(big.width * .2), fill=255)
    big.putalpha(mask); big = big.resize((inner, inner), Image.LANCZOS)
    out = Image.new('RGBA', (S, S), (0, 0, 0, 0)); out.paste(big, (m, m), big); out.save(R + 'mipmap-%s/ic_launcher.png' % n)
art.resize((512, 512), Image.LANCZOS).save('store_icon_512.png')
# previews: what launchers show (circle, squircle-ish rounded square), 72/108 of the layer
L = layer(432); v = int(432 * 72 / 108); o = (432 - v) // 2; vis = L.crop((o, o, o + v, o + v)).resize((288, 288), Image.LANCZOS).convert('RGBA')
prev = Image.new('RGB', (288 * 3 + 40, 288), (235, 235, 240))
for i, shape in enumerate(['circle', 'round', 'square']):
    mk = Image.new('L', (288, 288), 0); d = ImageDraw.Draw(mk)
    if shape == 'circle': d.ellipse((0, 0, 287, 287), fill=255)
    elif shape == 'round': d.rounded_rectangle((0, 0, 287, 287), radius=90, fill=255)
    else: d.rounded_rectangle((0, 0, 287, 287), radius=30, fill=255)
    prev.paste(vis, (i * 308, 0), mk)
prev.save('preview.png')
print('icons written')
