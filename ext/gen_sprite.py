"""
Genera el sprite sheet de Pack-Man (caja de cartón 8-bits)
Sprite sheet: 3 frames horizontales (boca cerrada, medio, abierta) x 4 direcciones (right, down, left, up)
Tamaño de cada frame: 32x32 píxeles
Salida: app/src/main/assets/www/img/packman.png
"""
import struct
import zlib
import os

# ---------- helpers PNG ----------
def png_chunk(tag, data):
    chunk = tag + data
    return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xFFFFFFFF)

def write_png(filename, width, height, pixels):
    """pixels: lista de (r,g,b,a) con len == width*height"""
    def raw_rows():
        rows = []
        for y in range(height):
            row = b'\x00'  # filtro None
            for x in range(width):
                r,g,b,a = pixels[y*width+x]
                row += bytes([r,g,b,a])
            rows.append(row)
        return b''.join(rows)

    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = png_chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
    # color type 6 = RGBA  -> pero struct.pack con 5 bytes: bit depth, colortype, compress, filter, interlace
    ihdr_data = struct.pack('>II', width, height) + bytes([8, 6, 0, 0, 0])
    ihdr = png_chunk(b'IHDR', ihdr_data)
    raw = raw_rows()
    compressed = zlib.compress(raw, 9)
    idat = png_chunk(b'IDAT', compressed)
    iend = png_chunk(b'IEND', b'')
    with open(filename, 'wb') as f:
        f.write(sig + ihdr + idat + iend)

# ---------- colores ----------
TRANSPARENT   = (  0,   0,   0,   0)
BOX_MAIN      = (200, 135,  58, 255)   # marrón principal
BOX_LIGHT     = (222, 165,  90, 255)   # marrón claro (panel superior)
BOX_DARK      = (107,  58,  16, 255)   # marrón oscuro (sombras)
BOX_SHADOW    = ( 80,  40,   8, 255)   # sombra profunda
TAPE_YELLOW   = (240, 224, 128, 255)   # cinta adhesiva
TAPE_DARK     = (200, 185,  80, 255)   # líneas de la cinta
FOLD_LINE     = (139,  94,  32, 255)   # líneas de pliegue
MOUTH_DARK    = ( 40,  20,   0, 255)   # interior boca
OUTLINE       = ( 50,  25,   5, 255)   # contorno exterior

N = 32  # tamaño de cada frame

def make_box_frame(mouth_open, direction):
    """
    mouth_open: 0 = cerrado, 1 = medio, 2 = abierto
    direction:  0=right, 1=down, 2=left, 3=up
    Devuelve lista de (r,g,b,a) de N×N píxeles
    """
    px = [TRANSPARENT] * (N * N)

    def set_px(x, y, color):
        if 0 <= x < N and 0 <= y < N:
            px[y * N + x] = color

    def fill_rect(x0, y0, x1, y1, color):
        for yy in range(y0, y1+1):
            for xx in range(x0, x1+1):
                set_px(xx, yy, color)

    # --- cuerpo principal (30×30, centrado, con 1px de margen) ---
    B = 1   # borde exterior (offset del cuerpo)
    S = N   # tamaño del frame

    # Cuerpo base
    fill_rect(B, B, S-B-1, S-B-1, BOX_MAIN)

    # Panel superior más claro (borde superior ~8px)
    fill_rect(B, B, S-B-1, B+7, BOX_LIGHT)

    # Líneas de pliegue (cruz central)
    mid_x = N // 2
    mid_y = N // 2
    for y in range(B, S-B):
        set_px(mid_x, y, FOLD_LINE)
    for x in range(B, S-B):
        set_px(x, mid_y, FOLD_LINE)

    # Cinta adhesiva en la parte superior (tape: 3px de alto, centrada)
    tape_y0 = B + 2
    tape_y1 = B + 4
    tape_x0 = B + 5
    tape_x1 = S - B - 6
    fill_rect(tape_x0, tape_y0, tape_x1, tape_y1, TAPE_YELLOW)
    # Líneas de textura de la cinta
    for x in range(tape_x0, tape_x1+1, 3):
        set_px(x, tape_y0, TAPE_DARK)
        set_px(x, tape_y1, TAPE_DARK)

    # Sombra inferior
    fill_rect(B, S-B-3, S-B-1, S-B-1, BOX_DARK)
    # Sombra derecha
    fill_rect(S-B-3, B, S-B-1, S-B-1, BOX_DARK)

    # --- Boca (mordida / apertura) ---
    # mouth_sizes: (ancho, alto) de la mordida para cada estado
    mouth_sizes = [(0, 0), (6, 6), (10, 10)]
    mw, mh = mouth_sizes[mouth_open]

    if mw > 0:
        # La boca siempre se dibuja primero en dirección RIGHT (lado derecho)
        # luego rotamos el frame completo según la dirección
        # boca: corte rectangular en el centro del lado derecho
        cx = N // 2
        cy = N // 2
        # Lado derecho: x = S-B-1, boca centrada en Y
        mouth_x0 = S - B - mw
        mouth_x1 = S - B - 1
        mouth_y0 = cy - mh // 2
        mouth_y1 = cy + mh // 2 - 1
        for y in range(mouth_y0, mouth_y1+1):
            for x in range(mouth_x0, mouth_x1+1):
                set_px(x, y, TRANSPARENT)
        # Interior oscuro (1px adentro de la abertura)
        for y in range(mouth_y0+1, mouth_y1):
            for x in range(mouth_x0, mouth_x0+3):
                if px[y*N+x] != TRANSPARENT:
                    set_px(x, y, MOUTH_DARK)

    # Contorno exterior (borde 1px)
    for x in range(B, S-B):
        for y in range(B, S-B):
            # píxel del borde del cuerpo sólido → pintar outline
            if px[y*N+x] != TRANSPARENT:
                # revisar si algún vecino es transparente
                for dx,dy in [(-1,0),(1,0),(0,-1),(0,1)]:
                    nx2,ny2 = x+dx, y+dy
                    if nx2 < 0 or ny2 < 0 or nx2 >= N or ny2 >= N or px[ny2*N+nx2] == TRANSPARENT:
                        set_px(x, y, OUTLINE)
                        break

    # --- Rotar el frame según la dirección ---
    # 0=right (sin rotación), 1=down (90° CW), 2=left (180°), 3=up (270° CW / 90° CCW)
    def rotate_cw(pixels, w, h):
        """Rota 90° en sentido horario"""
        out = [TRANSPARENT] * (w * h)
        for y in range(h):
            for x in range(w):
                out[x * h + (h - 1 - y)] = pixels[y * w + x]
        return out

    for _ in range(direction):
        px = rotate_cw(px, N, N)

    return px

# ---------- construir sprite sheet ----------
# 3 columnas (mouth: closed, half, open) x 4 filas (dir: right, down, left, up)
COLS = 3  # mouth states
ROWS = 4  # directions

sheet_w = N * COLS
sheet_h = N * ROWS
sheet = [TRANSPARENT] * (sheet_w * sheet_h)

for row in range(ROWS):        # direction
    for col in range(COLS):    # mouth state
        frame = make_box_frame(col, row)
        # pegar frame en la hoja
        ox = col * N
        oy = row * N
        for y in range(N):
            for x in range(N):
                sheet[(oy + y) * sheet_w + (ox + x)] = frame[y * N + x]

out_path = os.path.join(os.path.dirname(__file__), '..', 'app', 'src', 'main', 'assets', 'www', 'img', 'packman.png')
out_path = os.path.normpath(out_path)
write_png(out_path, sheet_w, sheet_h, sheet)
print(f'Sprite generado: {out_path}  ({sheet_w}x{sheet_h} px)')
