"""
gen_ghost_sprite.py
Genera ghost.png: fantasmas-buzon (mailbox) 8-bit para Infinite Pack-Man

Layout: 3 cols x 6 rows, cada frame 32x32 px => 96x192 px total
Cols:
  0 = frame1 (bandera abajo)
  1 = frame2 (bandera arriba)
  2 = comido (sobre volando)
Rows:
  0 = rojo
  1 = naranja
  2 = cyan
  3 = rosa
  4 = asustado azul (power pellet activo)
  5 = asustado blanco (parpadeo al expirar)
"""
from PIL import Image, ImageDraw

FRAME = 32
COLS = 3
ROWS = 6

BODY_COLORS = [
    (220,  50,  50, 255),
    (255, 155,  50, 255),
    (  0, 200, 220, 255),
    (255, 140, 200, 255),
    ( 60,  80, 200, 255),
    (210, 215, 230, 255),
]

DARK  = (30,  20,  10, 255)
WHITE = (255, 255, 255, 255)
SLOT  = (20,  10,   5, 255)
FLAG_RED  = (200,  40,  40, 255)
FLAG_GRAY = (140, 140, 140, 255)
TRANS = (0, 0, 0, 0)


def lighten(c, amt=40):
    return tuple(min(255, v + amt) for v in c[:3]) + (255,)


def darken(c, amt=40):
    return tuple(max(0, v - amt) for v in c[:3]) + (255,)


def draw_mailbox(img, ox, oy, body_color, flag_up=False):
    """Dibuja un buzon de correo 8-bit en el frame con origen (ox, oy)."""
    d = ImageDraw.Draw(img)

    # --- cuerpo del buzon ---
    bx = ox + 5    # left
    by = oy + 6    # top
    bw = 20        # width
    bh = 15        # height

    shadow = darken(body_color, 50)
    lid    = lighten(body_color, 35)

    # cuerpo principal
    d.rectangle([bx, by, bx + bw - 1, by + bh - 1], fill=body_color)
    # tapa (franja superior, mas clara)
    d.rectangle([bx, by, bx + bw - 1, by + 3], fill=lid)
    # borde oscuro
    d.rectangle([bx, by, bx + bw - 1, by + bh - 1], outline=DARK, width=1)

    # ranura para cartas (parte inferior del cuerpo)
    sx = bx + 4
    sy = by + bh - 4
    d.rectangle([sx, sy, sx + 11, sy + 2], fill=SLOT)
    d.rectangle([sx, sy, sx + 11, sy + 2], outline=DARK, width=1)

    # remaches en esquinas superiores
    d.point((bx + 2, by + 2), fill=DARK)
    d.point((bx + bw - 3, by + 2), fill=DARK)

    # brillo (esquina top-left)
    d.point((bx + 2, by + 5), fill=lighten(body_color, 70))
    d.point((bx + 3, by + 5), fill=lighten(body_color, 70))

    # ojos (2 rectangulitos en la parte superior del cuerpo)
    eye_y = by + 5
    scared = (body_color == BODY_COLORS[4] or body_color == BODY_COLORS[5])
    if scared:
        # ojos tipo "X" preocupados
        d.point((bx + 6,  eye_y),     fill=DARK)
        d.point((bx + 7,  eye_y + 1), fill=DARK)
        d.point((bx + 7,  eye_y),     fill=DARK)
        d.point((bx + 6,  eye_y + 1), fill=DARK)
        d.point((bx + 13, eye_y),     fill=DARK)
        d.point((bx + 14, eye_y + 1), fill=DARK)
        d.point((bx + 14, eye_y),     fill=DARK)
        d.point((bx + 13, eye_y + 1), fill=DARK)
    else:
        d.rectangle([bx + 5,  eye_y, bx + 7,  eye_y + 2], fill=DARK)
        d.rectangle([bx + 12, eye_y, bx + 14, eye_y + 2], fill=DARK)

    # --- bandera ---
    fx = bx + bw      # x del poste de la bandera
    pole_top = by + 2 if flag_up else by + bh - 5
    pole_bot = by + bh - 1
    d.line([fx, pole_top, fx, pole_bot], fill=DARK, width=1)
    if flag_up:
        fc = FLAG_RED
        d.rectangle([fx + 1, pole_top, fx + 5, pole_top + 4], fill=fc)
        d.rectangle([fx + 1, pole_top, fx + 5, pole_top + 4], outline=DARK, width=1)
    else:
        d.rectangle([fx + 1, pole_bot - 2, fx + 5, pole_bot], fill=FLAG_GRAY)
        d.rectangle([fx + 1, pole_bot - 2, fx + 5, pole_bot], outline=DARK, width=1)

    # --- poste / soporte inferior ---
    px = ox + FRAME // 2 - 2
    d.rectangle([px, by + bh, px + 3, oy + FRAME - 2], fill=shadow)
    d.rectangle([px, by + bh, px + 3, oy + FRAME - 2], outline=DARK, width=1)


def draw_eaten(img, ox, oy):
    """Dibuja un sobre volando (estado 'comido')."""
    d = ImageDraw.Draw(img)
    ec = (240, 228, 170, 255)
    ex, ey = ox + 5, oy + 9
    ew, eh = 22, 14

    # cuerpo del sobre
    d.rectangle([ex, ey, ex + ew, ey + eh], fill=ec)
    d.rectangle([ex, ey, ex + ew, ey + eh], outline=DARK, width=1)

    # solapa del sobre (triangulo en la parte superior)
    for i in range(ew // 2 + 1):
        d.point((ex + i,           ey + i // 2), fill=DARK)
        d.point((ex + ew - i,      ey + i // 2), fill=DARK)

    # lineas del sobre
    d.line([ex + 3, ey + 7,  ex + ew - 3, ey + 7],  fill=DARK, width=1)
    d.line([ex + 3, ey + 10, ex + ew - 5, ey + 10], fill=DARK, width=1)

    # sello (cuadradito superior derecha)
    d.rectangle([ex + ew - 6, ey + 2, ex + ew - 2, ey + 6], fill=(200, 50, 50, 255))
    d.rectangle([ex + ew - 6, ey + 2, ex + ew - 2, ey + 6], outline=DARK, width=1)


# ── Generar imagen ──────────────────────────────────────────────────────────
img = Image.new('RGBA', (FRAME * COLS, FRAME * ROWS), TRANS)

for row in range(ROWS):
    body_color = BODY_COLORS[row]
    for col in range(COLS):
        ox = col * FRAME
        oy = row * FRAME
        if col == 2:
            draw_eaten(img, ox, oy)
        else:
            draw_mailbox(img, ox, oy, body_color, flag_up=(col == 1))

out_path = 'app/src/main/assets/www/img/ghost.png'
img.save(out_path)
print(f"ghost.png guardado: {FRAME * COLS}x{FRAME * ROWS}px -> {out_path}")
