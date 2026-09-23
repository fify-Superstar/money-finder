#!/usr/bin/env python3
"""Stamp legal EXIF on the 3D emblem before it is copied into production public folders."""

from pathlib import Path
import sys

try:
    from PIL import Image
    from PIL.PngImagePlugin import PngInfo
except ImportError:
    Image = None
    PngInfo = None

ROOT = Path(__file__).resolve().parents[1]
BRANDING_DIR = ROOT / "public" / "assets" / "branding"
PRODUCTION_EMBLEM = BRANDING_DIR / "image_eT-ENo.png"
FAVICON = ROOT / "public" / "favicon.ico"
SOURCE_CANDIDATES = [
    Path("/Users/wafaa/.cursor/projects/Users-wafaa-Desktop-obsidian-traffic-py/assets/ChatGPT_Image_Sep_20__2026__01_37_50_PM-1af265be-8d70-4dda-b92e-4b24539c3ff3.jpg"),
    Path("/Users/wafaa/Desktop/ChatGPT Image Sep 20, 2026, 01_37_50 PM.png"),
    PRODUCTION_EMBLEM,
]

COPYRIGHT = "© 2026 Money Finder. All Rights Reserved."
SOURCE_URL = "https://moneyfinderapp.com"
REGION = "Melbourne, Victoria, Australia"

# EXIF tags: Copyright, ImageDescription (source URL), XPSubject (region, UTF-16LE)
EXIF_COPYRIGHT = 0x8298
EXIF_IMAGE_DESCRIPTION = 0x010E
EXIF_ARTIST = 0x013B
EXIF_SOFTWARE = 0x0131
EXIF_USER_COMMENT = 0x9286
EXIF_XP_SUBJECT = 0x9C9F
EXIF_XP_COMMENT = 0x9C9C


def utf16le(value: str) -> bytes:
    return value.encode("utf-16le") + b"\x00\x00"


def build_exif():
    exif = Image.Exif()
    # 0x8298 is ASCII/latin-1; keep the official copyright mark via latin-1 0xA9.
    exif[EXIF_COPYRIGHT] = COPYRIGHT.encode("latin-1")
    exif[EXIF_IMAGE_DESCRIPTION] = SOURCE_URL
    exif[EXIF_ARTIST] = "Money Finder"
    exif[EXIF_SOFTWARE] = "Money Finder brand deploy"
    exif[EXIF_USER_COMMENT] = b"UNICODE\x00" + utf16le(f"{COPYRIGHT} | {SOURCE_URL} | {REGION}")
    exif[EXIF_XP_SUBJECT] = utf16le(REGION)
    exif[EXIF_XP_COMMENT] = utf16le(REGION)
    return exif


def build_pnginfo():
    info = PngInfo()
    info.add_text("Copyright", COPYRIGHT)
    info.add_text("Source", SOURCE_URL)
    info.add_text("SourceURL", SOURCE_URL)
    info.add_text("Region", REGION)
    info.add_text("Location", REGION)
    return info


def resolve_source() -> Path:
    for candidate in SOURCE_CANDIDATES:
        if candidate.is_file():
            return candidate
    raise SystemExit("Missing 3D emblem source image.")


def crop_circular_emblem(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = list(rgba.getdata())
    cleaned = []
    for r, g, b, a in pixels:
        if r > 248 and g > 248 and b > 248:
            cleaned.append((r, g, b, 0))
        else:
            cleaned.append((r, g, b, a))
    rgba.putdata(cleaned)
    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)
    width, height = rgba.size
    side = max(width, height)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(rgba, ((side - width) // 2, (side - height) // 2), rgba)
    web = square.copy()
    web.thumbnail((512, 512), Image.Resampling.LANCZOS)
    return web


def write_favicon(emblem: Image.Image) -> None:
    icon = emblem.copy()
    icon.thumbnail((16, 16), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    canvas.paste(icon, ((16 - icon.size[0]) // 2, (16 - icon.size[1]) // 2), icon)
    canvas.save(FAVICON, format="ICO", sizes=[(16, 16)])


def stamp_emblem(path: Path) -> None:
    source = resolve_source()
    image = Image.open(source)
    image.load()
    emblem = crop_circular_emblem(image)
    BRANDING_DIR.mkdir(parents=True, exist_ok=True)
    emblem.save(
        path,
        format="PNG",
        optimize=True,
        exif=build_exif(),
        pnginfo=build_pnginfo(),
    )
    write_favicon(emblem)
    print(f"Source: {source}")
    print(f"Favicon: {FAVICON}")


def _decode_exif_text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, bytes):
        if value.startswith(b"UNICODE\x00"):
            return value[8:].decode("utf-16le").rstrip("\x00")
        if b"\x00" in value:
            return value.decode("utf-16le").rstrip("\x00")
        for encoding in ("utf-8", "latin-1"):
            try:
                return value.decode(encoding).rstrip("\x00")
            except UnicodeDecodeError:
                continue
        return value.decode("latin-1", errors="replace").rstrip("\x00")
    text = str(value)
    if "\x00" in text:
        return text.encode("latin-1").decode("utf-16le").rstrip("\x00")
    return text


def verify(path: Path) -> None:
    image = Image.open(path)
    exif = image.getexif()
    copyright_value = _decode_exif_text(exif.get(EXIF_COPYRIGHT))
    source_value = _decode_exif_text(exif.get(EXIF_IMAGE_DESCRIPTION))
    region_value = _decode_exif_text(exif.get(EXIF_XP_SUBJECT))
    png_text = getattr(image, "text", {}) or {}

    missing = []
    if copyright_value != COPYRIGHT or png_text.get("Copyright") != COPYRIGHT:
        missing.append("Copyright")
    if source_value != SOURCE_URL or png_text.get("SourceURL") != SOURCE_URL:
        missing.append("Source URL")
    if region_value != REGION or png_text.get("Region") != REGION:
        missing.append("Region")
    if missing:
        raise SystemExit(
            "EXIF stamp failed for: "
            + ", ".join(missing)
            + f" (exif copyright={copyright_value!r}, source={source_value!r}, region={region_value!r})"
        )

    print(f"Stamped {path}")
    print(f"Copyright: {copyright_value}")
    print(f"Source URL: {source_value}")
    print(f"Region: {region_value}")


if __name__ == "__main__":
    BRANDING_DIR.mkdir(parents=True, exist_ok=True)
    if Image is None:
        if PRODUCTION_EMBLEM.is_file():
            print(f"Pillow not installed; using existing emblem {PRODUCTION_EMBLEM}")
            sys.exit(0)
        raise SystemExit("Pillow is required to generate the brand emblem.")
    stamp_emblem(PRODUCTION_EMBLEM)
    verify(PRODUCTION_EMBLEM)
