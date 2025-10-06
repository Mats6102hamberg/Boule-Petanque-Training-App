"""
Machine Learning-modell för att identifiera objekt (boular och cochonnet)

Grundprincip:
1. Bildförbehandling
2. Objektdetektering med ML-modell
3. Filtrera boular vs cochonnet
"""

import cv2
import numpy as np
import tensorflow as tf
from typing import Tuple, List, Dict, Optional


def detect_objects(image: np.ndarray) -> Tuple[List[Dict], Optional[Dict]]:
    """
    Machine Learning-modell för att identifiera objekt
    
    Args:
        image: Input-bild (numpy array)
        
    Returns:
        tuple: (boules, cochonnet)
    """
    # 1. Bildförbehandling
    processed_image = preprocess(image)
    
    # 2. Objektdetektering med ML-modell
    objects = ml_model.detect(processed_image)
    
    # 3. Filtrera boular vs cochonnet
    boules = filter_boules(objects)
    cochonnet = find_cochonnet(objects)
    
    return boules, cochonnet


def preprocess(image: np.ndarray) -> np.ndarray:
    """
    Bildförbehandling för bättre objektdetektering
    
    Steg:
    1. Resize till modellens input-storlek
    2. Normalisera pixelvärden
    3. Förbättra kontrast (CLAHE)
    4. Reducera brus
    
    Args:
        image: Input-bild (BGR format)
        
    Returns:
        Förbehandlad bild
    """
    # 1. Resize
    target_size = (640, 640)
    resized = cv2.resize(image, target_size, interpolation=cv2.INTER_AREA)
    
    # 2. Konvertera till LAB färgrymd för bättre kontrastjustering
    lab = cv2.cvtColor(resized, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    # 3. Applicera CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    
    # 4. Merge tillbaka
    enhanced_lab = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
    
    # 5. Reducera brus med bilateral filter
    denoised = cv2.bilateralFilter(enhanced, 9, 75, 75)
    
    # 6. Normalisera för ML-modell
    normalized = denoised.astype('float32') / 255.0
    
    return normalized


class MLModel:
    """
    Wrapper för ML-modell (YOLO, SSD, eller custom model)
    """
    
    def __init__(self, model_path: str = None):
        """
        Initialisera ML-modellen
        
        Args:
            model_path: Sökväg till tränad modell
        """
        self.model = None
        self.input_size = (640, 640)
        self.confidence_threshold = 0.5
        self.nms_threshold = 0.4
        
        if model_path:
            self.load_model(model_path)
    
    def load_model(self, model_path: str):
        """
        Ladda tränad modell
        """
        try:
            self.model = tf.saved_model.load(model_path)
            print(f"✅ Model loaded from {model_path}")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            # Fallback till färgbaserad detektering
            self.model = None
    
    def detect(self, image: np.ndarray) -> List[Dict]:
        """
        Detektera objekt i bild
        
        Args:
            image: Preprocessad bild
            
        Returns:
            Lista med detekterade objekt
        """
        if self.model is None:
            # Fallback: använd färgbaserad detektering
            return self._color_based_detection(image)
        
        # Förbered input
        input_tensor = tf.expand_dims(image, 0)
        
        # Kör inference
        detections = self.model(input_tensor)
        
        # Postprocessa resultat
        objects = self._postprocess_detections(detections, image.shape)
        
        return objects
    
    def _postprocess_detections(
        self,
        detections: Dict,
        image_shape: Tuple
    ) -> List[Dict]:
        """
        Postprocessa detektionsresultat
        """
        objects = []
        
        boxes = detections['detection_boxes'][0].numpy()
        scores = detections['detection_scores'][0].numpy()
        classes = detections['detection_classes'][0].numpy()
        
        height, width = image_shape[:2]
        
        for i in range(len(scores)):
            if scores[i] < self.confidence_threshold:
                continue
            
            # Konvertera box-koordinater
            ymin, xmin, ymax, xmax = boxes[i]
            
            x = int(xmin * width)
            y = int(ymin * height)
            w = int((xmax - xmin) * width)
            h = int((ymax - ymin) * height)
            
            # Beräkna centrum och radie
            center_x = x + w // 2
            center_y = y + h // 2
            radius = max(w, h) // 2
            
            obj = {
                'center': (center_x, center_y),
                'radius': radius,
                'box': {'x': x, 'y': y, 'width': w, 'height': h},
                'confidence': float(scores[i]),
                'class': int(classes[i]),
                'class_name': self._get_class_name(int(classes[i]))
            }
            
            objects.append(obj)
        
        return objects
    
    def _color_based_detection(self, image: np.ndarray) -> List[Dict]:
        """
        Färgbaserad objektdetektering (backup)
        """
        # Konvertera tillbaka från normalized
        image_uint8 = (image * 255).astype(np.uint8)
        
        # Konvertera till HSV
        hsv = cv2.cvtColor(image_uint8, cv2.COLOR_BGR2HSV)
        
        # Definiera färgintervall för metalliska boular
        lower_metal = np.array([0, 0, 150])
        upper_metal = np.array([180, 50, 255])
        
        # Definiera färgintervall för röd cochonnet
        lower_red1 = np.array([0, 100, 100])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 100, 100])
        upper_red2 = np.array([180, 255, 255])
        
        # Skapa masker
        mask_metal = cv2.inRange(hsv, lower_metal, upper_metal)
        mask_red = cv2.inRange(hsv, lower_red1, upper_red1) | \
                   cv2.inRange(hsv, lower_red2, upper_red2)
        
        # Hitta konturer
        objects = []
        
        # Detektera boular (metall)
        contours_metal, _ = cv2.findContours(
            mask_metal,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )
        
        for i, contour in enumerate(contours_metal):
            area = cv2.contourArea(contour)
            if area < 100:  # För små objekt
                continue
            
            # Beräkna cirkuläritet
            perimeter = cv2.arcLength(contour, True)
            if perimeter == 0:
                continue
            circularity = 4 * np.pi * area / (perimeter * perimeter)
            
            if circularity > 0.7:  # Cirkulära objekt
                (x, y), radius = cv2.minEnclosingCircle(contour)
                
                objects.append({
                    'center': (int(x), int(y)),
                    'radius': int(radius),
                    'confidence': circularity,
                    'class': 1,  # Boule
                    'class_name': 'boule'
                })
        
        # Detektera cochonnet (röd)
        contours_red, _ = cv2.findContours(
            mask_red,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )
        
        for contour in contours_red:
            area = cv2.contourArea(contour)
            if area < 50 or area > 500:  # Cochonnet är mindre
                continue
            
            perimeter = cv2.arcLength(contour, True)
            if perimeter == 0:
                continue
            circularity = 4 * np.pi * area / (perimeter * perimeter)
            
            if circularity > 0.7:
                (x, y), radius = cv2.minEnclosingCircle(contour)
                
                objects.append({
                    'center': (int(x), int(y)),
                    'radius': int(radius),
                    'confidence': circularity,
                    'class': 2,  # Cochonnet
                    'class_name': 'cochonnet'
                })
        
        return objects
    
    def _get_class_name(self, class_id: int) -> str:
        """
        Konvertera class ID till namn
        """
        class_names = {
            1: 'boule',
            2: 'cochonnet'
        }
        return class_names.get(class_id, 'unknown')


# Global model instance
ml_model = MLModel()


def filter_boules(objects: List[Dict]) -> List[Dict]:
    """
    Filtrera ut boular från detekterade objekt
    
    Kriterier:
    - Storlek: 60-90mm diameter
    - Form: Cirkulär (circularity > 0.8)
    - Färg: Metallisk/silver
    
    Args:
        objects: Lista med detekterade objekt
        
    Returns:
        Lista med boular
    """
    boules = []
    
    for i, obj in enumerate(objects):
        # Kontrollera class
        if obj.get('class_name') == 'boule' or obj.get('class') == 1:
            obj['id'] = i + 1
            boules.append(obj)
    
    return boules


def find_cochonnet(objects: List[Dict]) -> Optional[Dict]:
    """
    Hitta cochonnet (liten röd boll)
    
    Kriterier:
    - Storlek: 20-40mm diameter
    - Färg: Röd/orange
    
    Args:
        objects: Lista med detekterade objekt
        
    Returns:
        Cochonnet eller None
    """
    for obj in objects:
        # Kontrollera class
        if obj.get('class_name') == 'cochonnet' or obj.get('class') == 2:
            return obj
    
    return None


def is_metallic_color(color: Tuple[int, int, int]) -> bool:
    """
    Kontrollera om färg är metallisk/silver
    """
    # HSV-värden för metalliska färger
    # Låg saturation, hög value
    hsv = cv2.cvtColor(np.uint8([[color]]), cv2.COLOR_BGR2HSV)[0][0]
    h, s, v = hsv
    
    return s < 50 and v > 150


def is_red_color(color: Tuple[int, int, int]) -> bool:
    """
    Kontrollera om färg är röd
    """
    hsv = cv2.cvtColor(np.uint8([[color]]), cv2.COLOR_BGR2HSV)[0][0]
    h, s, v = hsv
    
    # Röd är antingen 0-10 eller 170-180 i Hue
    return (h < 10 or h > 170) and s > 100 and v > 100


def visualize_detections(
    image: np.ndarray,
    boules: List[Dict],
    cochonnet: Optional[Dict]
) -> np.ndarray:
    """
    Visualisera detektioner på bild
    
    Args:
        image: Input-bild
        boules: Detekterade boular
        cochonnet: Detekterad cochonnet
        
    Returns:
        Bild med visualiserade detektioner
    """
    output = image.copy()
    
    # Rita boular
    for boule in boules:
        center = boule['center']
        radius = boule['radius']
        
        # Rita cirkel
        cv2.circle(output, center, radius, (0, 255, 0), 2)
        
        # Rita ID
        text = f"B{boule.get('id', '?')}"
        cv2.putText(
            output,
            text,
            (center[0] - 20, center[1] - radius - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )
        
        # Rita confidence
        conf_text = f"{boule['confidence']:.2f}"
        cv2.putText(
            output,
            conf_text,
            (center[0] - 20, center[1] + radius + 20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.4,
            (0, 255, 0),
            1
        )
    
    # Rita cochonnet
    if cochonnet:
        center = cochonnet['center']
        radius = cochonnet['radius']
        
        cv2.circle(output, center, radius, (0, 0, 255), 2)
        cv2.putText(
            output,
            "Cochonnet",
            (center[0] - 30, center[1] - radius - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 0, 255),
            2
        )
    
    return output


def main():
    """
    Test-funktion
    """
    print("🎯 Testing Object Detection")
    
    # Ladda testbild
    image = cv2.imread('test_images/petanque_game.jpg')
    
    if image is None:
        print("❌ Could not load test image")
        print("Creating synthetic test image...")
        # Skapa syntetisk testbild
        image = np.ones((1080, 1920, 3), dtype=np.uint8) * 100
    
    # Detektera objekt
    boules, cochonnet = detect_objects(image)
    
    print(f"✅ Found {len(boules)} boules")
    print(f"✅ Found cochonnet: {cochonnet is not None}")
    
    # Visualisera
    output = visualize_detections(image, boules, cochonnet)
    
    # Spara resultat
    cv2.imwrite('output/object_detection_result.jpg', output)
    print("✅ Results saved to output/object_detection_result.jpg")


if __name__ == '__main__':
    main()
