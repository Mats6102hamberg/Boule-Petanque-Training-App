"""
Bildbehandlingsverktyg för pétanque-appen
"""

import cv2
import numpy as np
from typing import Tuple, List

def enhance_image(image: np.ndarray) -> np.ndarray:
    """
    Förbättra bildkvalitet för bättre objektdetektering
    """
    # Konvertera till LAB färgrymd
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    
    # Separera kanaler
    l, a, b = cv2.split(lab)
    
    # Applicera CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    
    # Merge tillbaka
    enhanced_lab = cv2.merge([l, a, b])
    
    # Konvertera tillbaka till BGR
    enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
    
    return enhanced


def remove_noise(image: np.ndarray) -> np.ndarray:
    """
    Ta bort brus från bild
    """
    # Bilateral filter - bevarar kanter medan brus tas bort
    denoised = cv2.bilateralFilter(image, 9, 75, 75)
    
    return denoised


def detect_ground_plane(image: np.ndarray) -> np.ndarray:
    """
    Detektera markytan (gravel/sand) för bättre objektsegmentering
    """
    # Konvertera till gråskala
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Detektera kanter
    edges = cv2.Canny(gray, 50, 150)
    
    # Hitta linjer (markytans gränser)
    lines = cv2.HoughLinesP(
        edges,
        rho=1,
        theta=np.pi/180,
        threshold=100,
        minLineLength=100,
        maxLineGap=10
    )
    
    # Skapa mask för markytan
    mask = np.zeros_like(gray)
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            cv2.line(mask, (x1, y1), (x2, y2), 255, 2)
    
    return mask


def calculate_perspective_transform(
    image: np.ndarray,
    src_points: np.ndarray
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Beräkna perspektivtransform för att korrigera kameravinkel
    
    Args:
        image: Input-bild
        src_points: 4 punkter som definierar perspektivet
        
    Returns:
        Tuple av (transformerad bild, transform-matris)
    """
    height, width = image.shape[:2]
    
    # Definiera destination points (rektangel ovanifrån)
    dst_points = np.float32([
        [0, 0],
        [width, 0],
        [width, height],
        [0, height]
    ])
    
    # Beräkna transform-matris
    M = cv2.getPerspectiveTransform(src_points, dst_points)
    
    # Applicera transform
    warped = cv2.warpPerspective(image, M, (width, height))
    
    return warped, M


def extract_roi(
    image: np.ndarray,
    center: Tuple[int, int],
    size: Tuple[int, int]
) -> np.ndarray:
    """
    Extrahera Region of Interest (ROI) från bild
    """
    x, y = center
    w, h = size
    
    x1 = max(0, x - w // 2)
    y1 = max(0, y - h // 2)
    x2 = min(image.shape[1], x + w // 2)
    y2 = min(image.shape[0], y + h // 2)
    
    roi = image[y1:y2, x1:x2]
    
    return roi


def segment_objects(image: np.ndarray) -> np.ndarray:
    """
    Segmentera objekt från bakgrund
    """
    # Konvertera till gråskala
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Applicera Gaussian blur
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Threshold
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Morfologiska operationer
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    opened = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)
    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel, iterations=2)
    
    return closed


def calculate_shadow_removal(image: np.ndarray) -> np.ndarray:
    """
    Ta bort skuggor från bild
    """
    # Konvertera till HSV
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Separera kanaler
    h, s, v = cv2.split(hsv)
    
    # Detektera skuggor (låg V-värde)
    _, shadow_mask = cv2.threshold(v, 100, 255, cv2.THRESH_BINARY_INV)
    
    # Dilate mask
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    shadow_mask = cv2.dilate(shadow_mask, kernel, iterations=2)
    
    # Inpaint skuggområden
    result = cv2.inpaint(image, shadow_mask, 3, cv2.INPAINT_TELEA)
    
    return result


def resize_with_aspect_ratio(
    image: np.ndarray,
    target_size: Tuple[int, int],
    pad: bool = True
) -> np.ndarray:
    """
    Resize bild med bibehållen aspect ratio
    """
    target_width, target_height = target_size
    height, width = image.shape[:2]
    
    # Beräkna scale factor
    scale = min(target_width / width, target_height / height)
    
    # Nya dimensioner
    new_width = int(width * scale)
    new_height = int(height * scale)
    
    # Resize
    resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
    
    if pad:
        # Lägg till padding för att nå target size
        top = (target_height - new_height) // 2
        bottom = target_height - new_height - top
        left = (target_width - new_width) // 2
        right = target_width - new_width - left
        
        padded = cv2.copyMakeBorder(
            resized,
            top, bottom, left, right,
            cv2.BORDER_CONSTANT,
            value=[0, 0, 0]
        )
        
        return padded
    
    return resized


def extract_color_features(image: np.ndarray, mask: np.ndarray = None) -> dict:
    """
    Extrahera färgfeatures från bild
    """
    if mask is not None:
        image = cv2.bitwise_and(image, image, mask=mask)
    
    # Beräkna färghistogram
    hist_b = cv2.calcHist([image], [0], mask, [32], [0, 256])
    hist_g = cv2.calcHist([image], [1], mask, [32], [0, 256])
    hist_r = cv2.calcHist([image], [2], mask, [32], [0, 256])
    
    # Normalisera
    hist_b = cv2.normalize(hist_b, hist_b).flatten()
    hist_g = cv2.normalize(hist_g, hist_g).flatten()
    hist_r = cv2.normalize(hist_r, hist_r).flatten()
    
    # Beräkna genomsnittsfärg
    mean_color = cv2.mean(image, mask=mask)[:3]
    
    return {
        'histogram_b': hist_b,
        'histogram_g': hist_g,
        'histogram_r': hist_r,
        'mean_color': mean_color
    }
