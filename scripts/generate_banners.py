#!/usr/bin/env python3
"""Generate retro/vintage banners for Recycle Renegades."""

import random
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# --- Palette ---
DARK_NAVY = (10, 22, 40)
DEEP_BLUE = (26, 58, 74)
OCEAN_BLUE = (44, 95, 124)
MUTED_TEAL = (60, 130, 140)
SANDY_BEIGE = (212, 165, 116)
CREAM = (245, 230, 211)
CORAL_RED = (196, 99, 79)
WARM_WHITE = (240, 228, 210)
GOLD = (255, 213, 79)

FONT_PATH = "C:\\Windows\\Fonts\\georgia.ttf"
FONT_PATH_BOLD = "C:\\Windows\\Fonts\\georgiab.ttf"

def make_gradient(w, h, top_color, bottom_color):
    img = Image.new("RGB", (w, h))
    for y in range(h):
        t = y / h
        r = int(top_color[0] * (1 - t) + bottom_color[0] * t)
        g = int(top_color[1] * (1 - t) + bottom_color[1] * t)
        b = int(top_color[2] * (1 - t) + bottom_color[2] * t)
        for x in range(w):
            img.putpixel((x, y), (r, g, b))
    return img

def draw_wave(draw, y_base, w, amplitude, wavelength, color, thickness=3):
    points = []
    for x in range(0, w + 4, 2):
        y = y_base + int(amplitude * math.sin(2 * math.pi * x / wavelength))
        points.append((x, y))
    for i in range(len(points) - 1):
        draw.line([points[i], points[i + 1]], fill=color, width=thickness)

def draw_wave_filled(draw, y_base, w, h, amplitude, wavelength, color):
    points = []
    for x in range(0, w + 4, 2):
        y = y_base + int(amplitude * math.sin(2 * math.pi * x / wavelength))
        points.append((x, y))
    bottom_points = [(w, h), (0, h)]
    draw.polygon(points + bottom_points, fill=color)

def draw_fish(draw, cx, cy, size, color, direction=1):
    s = size
    # Body ellipse
    draw.ellipse([cx - s, cy - s // 2, cx + s, cy + s // 2], fill=color)
    # Tail triangle
    tail_x = cx - s * direction
    draw.polygon([
        (tail_x, cy),
        (tail_x - s * 0.7 * direction, cy - s * 0.6),
        (tail_x - s * 0.7 * direction, cy + s * 0.6),
    ], fill=color)
    # Eye
    eye_x = cx + s * 0.5 * direction
    eye_y = cy - s * 0.15
    draw.ellipse([eye_x - 3, eye_y - 3, eye_x + 3, eye_y + 3], fill=CREAM)
    draw.ellipse([eye_x - 1, eye_y - 1, eye_x + 1, eye_y + 1], fill=DARK_NAVY)

def draw_coral(draw, cx, cy, height, color):
    # Simple branching coral
    trunk_w = max(3, height // 8)
    draw.rectangle([cx - trunk_w, cy - height, cx + trunk_w, cy], fill=color)
    # Branches
    for i in range(3):
        by = cy - height * (0.3 + i * 0.25)
        bw = height * 0.3
        direction = 1 if i % 2 == 0 else -1
        draw.line([(cx, by), (cx + bw * direction, by - height * 0.15)], fill=color, width=max(2, trunk_w - 1))
        draw.ellipse([
            cx + bw * direction - 4, by - height * 0.15 - 4,
            cx + bw * direction + 4, by - height * 0.15 + 4
        ], fill=color)

def draw_starfish(draw, cx, cy, size, color):
    points = []
    for i in range(5):
        angle = math.radians(-90 + i * 72)
        points.append((cx + size * math.cos(angle), cy + size * math.sin(angle)))
        angle2 = math.radians(-90 + i * 72 + 36)
        points.append((cx + size * 0.4 * math.cos(angle2), cy + size * 0.4 * math.sin(angle2)))
    draw.polygon(points, fill=color)

def add_grain(img, intensity=15):
    w, h = img.size
    pixels = img.load()
    random.seed(42)
    for _ in range(w * h // 4):
        x = random.randint(0, w - 1)
        y = random.randint(0, h - 1)
        r, g, b = pixels[x, y]
        noise = random.randint(-intensity, intensity)
        pixels[x, y] = (
            max(0, min(255, r + noise)),
            max(0, min(255, g + noise)),
            max(0, min(255, b + noise)),
        )
    return img

def add_halftone_overlay(img, spacing=8, dot_max=2, color=(255, 255, 255)):
    w, h = img.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for y in range(0, h, spacing):
        for x in range(0, w, spacing):
            # Vary dot size based on position for subtle texture
            phase = math.sin(x * 0.02) * math.cos(y * 0.02)
            r = max(1, int(dot_max * (0.5 + 0.5 * phase)))
            alpha = 15
            draw.ellipse([x - r, y - r, x + r, y + r], fill=(*color, alpha))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))
    return img

def draw_recycling_symbol(draw, cx, cy, size, color, thickness=3):
    """Draw a simple triangular recycling arrows symbol."""
    s = size
    # Triangle vertices
    top = (cx, cy - s)
    bl = (cx - s * 0.866, cy + s * 0.5)
    br = (cx + s * 0.866, cy + s * 0.5)
    # Three arrows along edges
    edges = [(top, bl), (bl, br), (br, top)]
    for (x1, y1), (x2, y2) in edges:
        draw.line([(x1, y1), (x2, y2)], fill=color, width=thickness)

def create_hero_banner():
    """1920x600 website hero banner."""
    w, h = 1920, 600
    img = make_gradient(w, h, DEEP_BLUE, DARK_NAVY)
    draw = ImageDraw.Draw(img)

    # Deep ocean waves (background layers)
    draw_wave_filled(draw, h - 200, w, h, 30, 400, (20, 50, 70))
    draw_wave_filled(draw, h - 160, w, h, 25, 350, (26, 60, 80))
    draw_wave_filled(draw, h - 120, w, h, 20, 300, (32, 70, 95))
    draw_wave_filled(draw, h - 80, w, h, 15, 250, OCEAN_BLUE)

    # Wave lines
    draw_wave(draw, h - 180, w, 20, 350, MUTED_TEAL, 2)
    draw_wave(draw, h - 140, w, 15, 300, (80, 150, 160), 2)
    draw_wave(draw, h - 100, w, 12, 250, (100, 170, 180), 2)

    # Coral silhouettes at bottom
    coral_colors = [(160, 70, 60), (180, 80, 70), (140, 60, 55)]
    for i, cx in enumerate(range(100, w, 350)):
        color = coral_colors[i % len(coral_colors)]
        draw_coral(draw, cx, h - 30, random.randint(40, 80), color)

    # Fish swimming across
    fish_data = [
        (300, 180, 25, OCEAN_BLUE, 1),
        (500, 220, 18, MUTED_TEAL, 1),
        (750, 150, 30, CORAL_RED, -1),
        (1100, 200, 22, SANDY_BEIGE, 1),
        (1400, 170, 28, OCEAN_BLUE, -1),
        (1600, 230, 16, MUTED_TEAL, -1),
    ]
    for fx, fy, fs, fc, fd in fish_data:
        draw_fish(draw, fx, fy, fs, fc, fd)

    # Starfish
    draw_starfish(draw, 1650, h - 60, 15, CORAL_RED)

    # Bubbles
    for bx, by, br in [(200, 120, 6), (220, 90, 4), (450, 100, 5), (800, 80, 7), (1300, 110, 5)]:
        draw.ellipse([bx - br, by - br, bx + br, by + br], outline=(120, 180, 200), width=1)

    # Recycling symbol (subtle, top-right area)
    draw_recycling_symbol(draw, w - 120, 80, 35, (60, 120, 140), 3)

    # Grain texture
    img = add_grain(img, 12)
    img = add_halftone_overlay(img, 10, 2)

    # --- Typography ---
    draw = ImageDraw.Draw(img)

    # Title: "RECYCLE RENEGADES"
    try:
        font_title = ImageFont.truetype(FONT_PATH_BOLD, 72)
        font_sub = ImageFont.truetype(FONT_PATH, 28)
        font_cta = ImageFont.truetype(FONT_PATH_BOLD, 22)
        font_small = ImageFont.truetype(FONT_PATH, 16)
    except OSError:
        font_title = ImageFont.load_default()
        font_sub = font_title
        font_cta = font_title
        font_small = font_title

    title = "RECYCLE RENEGADES"
    # Shadow
    draw.text((w // 2 + 3, 163), title, fill=DARK_NAVY, font=font_title, anchor="mm")
    # Main
    draw.text((w // 2, 160), title, fill=CREAM, font=font_title, anchor="mm")

    # Subtitle
    subtitle = "Collect  ·  Rescue  ·  Restore"
    draw.text((w // 2, 220), subtitle, fill=SANDY_BEIGE, font=font_sub, anchor="mm")

    # Tagline
    tagline = "An ocean conservation game with real-world impact"
    draw.text((w // 2, 265), tagline, fill=(180, 200, 210), font=font_small, anchor="mm")

    # CTA button
    cta_text = "DIVE IN"
    cta_w, cta_h = 180, 48
    cta_x = w // 2 - cta_w // 2
    cta_y = 310
    # Button background
    draw.rounded_rectangle([cta_x, cta_y, cta_x + cta_w, cta_y + cta_h], radius=6, fill=CORAL_RED)
    draw.rounded_rectangle([cta_x + 2, cta_y + 2, cta_x + cta_w - 2, cta_y + cta_h - 2], radius=5, outline=CREAM, width=1)
    draw.text((w // 2, cta_y + cta_h // 2), cta_text, fill=CREAM, font=font_cta, anchor="mm")

    # Decorative corner badges
    # Top-left corner accent
    draw.line([(40, 40), (40, 80)], fill=SANDY_BEIGE, width=2)
    draw.line([(40, 40), (80, 40)], fill=SANDY_BEIGE, width=2)
    # Bottom-right corner accent
    draw.line([(w - 40, h - 40), (w - 40, h - 80)], fill=SANDY_BEIGE, width=2)
    draw.line([(w - 40, h - 40), (w - 80, h - 40)], fill=SANDY_BEIGE, width=2)

    img.save("public/assets/banners/hero-1920x600.png", "PNG")
    print(f"Saved: public/assets/banners/hero-1920x600.png ({w}x{h})")

def create_instagram_post():
    """1080x1080 Instagram post banner."""
    w, h = 1080, 1080
    img = make_gradient(w, h, DEEP_BLUE, DARK_NAVY)
    draw = ImageDraw.Draw(img)

    # Ocean waves (deeper, more dramatic)
    draw_wave_filled(draw, h - 320, w, h, 40, 300, (20, 50, 70))
    draw_wave_filled(draw, h - 260, w, h, 35, 260, (26, 60, 80))
    draw_wave_filled(draw, h - 200, w, h, 28, 220, OCEAN_BLUE)
    draw_wave_filled(draw, h - 140, w, h, 20, 180, (50, 110, 130))

    # Wave lines
    draw_wave(draw, h - 280, w, 25, 280, MUTED_TEAL, 3)
    draw_wave(draw, h - 220, w, 18, 240, (80, 150, 160), 2)
    draw_wave(draw, h - 160, w, 14, 200, (100, 170, 180), 2)

    # Coral
    coral_positions = [(80, h - 60), (250, h - 50), (500, h - 70), (750, h - 55), (950, h - 65)]
    coral_colors = [(160, 70, 60), (180, 80, 70), (140, 60, 55), (170, 75, 65), (150, 65, 58)]
    for (cx, cy), cc in zip(coral_positions, coral_colors):
        draw_coral(draw, cx, cy, random.randint(50, 90), cc)

    # Fish
    fish_data = [
        (180, 300, 28, OCEAN_BLUE, 1),
        (400, 350, 20, MUTED_TEAL, -1),
        (650, 280, 35, CORAL_RED, 1),
        (850, 320, 24, SANDY_BEIGE, -1),
        (350, 450, 16, OCEAN_BLUE, 1),
        (700, 420, 22, MUTED_TEAL, -1),
    ]
    for fx, fy, fs, fc, fd in fish_data:
        draw_fish(draw, fx, fy, fs, fc, fd)

    # Starfish
    draw_starfish(draw, 200, h - 90, 18, CORAL_RED)
    draw_starfish(draw, 880, h - 80, 14, GOLD)

    # Bubbles
    for bx, by, br in [(150, 200, 8), (180, 160, 5), (500, 180, 7), (800, 220, 6), (900, 170, 5)]:
        draw.ellipse([bx - br, by - br, bx + br, by + br], outline=(120, 180, 200), width=1)

    # Recycling symbol (centered, large)
    draw_recycling_symbol(draw, w // 2, 160, 50, (50, 110, 130), 3)

    # Grain + halftone
    img = add_grain(img, 12)
    img = add_halftone_overlay(img, 8, 2)

    draw = ImageDraw.Draw(img)

    # Typography
    try:
        font_title = ImageFont.truetype(FONT_PATH_BOLD, 64)
        font_sub = ImageFont.truetype(FONT_PATH, 24)
        font_cta = ImageFont.truetype(FONT_PATH_BOLD, 20)
        font_small = ImageFont.truetype(FONT_PATH, 15)
    except OSError:
        font_title = ImageFont.load_default()
        font_sub = font_title
        font_cta = font_title
        font_small = font_title

    # Title
    title = "RECYCLE"
    title2 = "RENEGADES"
    draw.text((w // 2 + 3, 243), title, fill=DARK_NAVY, font=font_title, anchor="mm")
    draw.text((w // 2, 240), title, fill=CREAM, font=font_title, anchor="mm")
    draw.text((w // 2 + 3, 313), title2, fill=DARK_NAVY, font=font_title, anchor="mm")
    draw.text((w // 2, 310), title2, fill=GOLD, font=font_title, anchor="mm")

    # Subtitle
    subtitle = "Ocean Conservation Game"
    draw.text((w // 2, 370), subtitle, fill=SANDY_BEIGE, font=font_sub, anchor="mm")

    # Tagline
    tagline = "Collect plastic · Rescue marine life · Restore reefs"
    draw.text((w // 2, 410), tagline, fill=(180, 200, 210), font=font_small, anchor="mm")

    # CTA
    cta_text = "PLAY NOW"
    cta_w, cta_h = 200, 48
    cta_x = w // 2 - cta_w // 2
    cta_y = 460
    draw.rounded_rectangle([cta_x, cta_y, cta_x + cta_w, cta_y + cta_h], radius=6, fill=CORAL_RED)
    draw.rounded_rectangle([cta_x + 2, cta_y + 2, cta_x + cta_w - 2, cta_y + cta_h - 2], radius=5, outline=CREAM, width=1)
    draw.text((w // 2, cta_y + cta_h // 2), cta_text, fill=CREAM, font=font_cta, anchor="mm")

    # Corner accents
    draw.line([(40, 40), (40, 80)], fill=SANDY_BEIGE, width=2)
    draw.line([(40, 40), (80, 40)], fill=SANDY_BEIGE, width=2)
    draw.line([(w - 40, h - 40), (w - 40, h - 80)], fill=SANDY_BEIGE, width=2)
    draw.line([(w - 40, h - 40), (w - 80, h - 40)], fill=SANDY_BEIGE, width=2)

    img.save("public/assets/banners/instagram-1080x1080.png", "PNG")
    print(f"Saved: public/assets/banners/instagram-1080x1080.png ({w}x{h})")

if __name__ == "__main__":
    create_hero_banner()
    create_instagram_post()
    print("Done!")
