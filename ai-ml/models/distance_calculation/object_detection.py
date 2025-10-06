"""
Objektdetektering för boular och cochonnet
Använder YOLO eller SSD för realtidsdetektering
"""

import cv2
import numpy as np
import tensorflow as tf
from typing import List, Dict, Tuple

class BouleDetector:
    def __init__(self, model_path=None):
        """
        Initialisera objektdetektorn
        
        Args:
            model_path: Sökväg till tränad modell
        """
        self.model = None
        self.confidence_threshold = 0.5
        self.nms_threshold = 0.4
        
        if model_path:
            self.load_model(model_path)
    
    def load_model(self, model_path):
        """
        Ladda tränad objektdetekteringsmodell
        """
        try:
            self.model = tf.saved_model.load(model_path)
            print(f"✅ Model loaded from {model_path}")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
    
    def detect(self, image: np.ndarray) -> Dict:
        """
        Detektera boular och cochonnet i bild
        
        Args:
            image: Input-bild (BGR format)
            
        Returns:
            Dict med detekterade objekt
        """
        # Preprocessa bild
        input_tensor = self.preprocess_image(image)
        
        # Kör detektering
        detections = self.model(input_tensor)
        
        # Postprocessa resultat
        boules, cochonnet = self.postprocess_detections(
            detections,
            image.shape
        )
        
        return {
            'boules': boules,
            'cochonnet': cochonnet,
            'image_shape': image.shape
        }
    
    def preprocess_image(self, image: np.ndarray) -> tf.Tensor:
        """
        Preprocessa bild för modellen
        """
        # Konvertera BGR till RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Resize till modellens input-storlek
        image_resized = cv2.resize(image_rgb, (640, 640))
        
        # Normalisera
        image_normalized = image_resized.astype(np.float32) / 255.0
        
        # Lägg till batch dimension
        input_tensor = tf.expand_dims(image_normalized, 0)
        
        return input_tensor
    
    def postprocess_detections(
        self,
        detections: Dict,
        original_shape: Tuple
    ) -> Tuple[List[Dict], Dict]:
        """
        Postprocessa detektionsresultat
        
        Returns:
            Tuple av (boules, cochonnet)
        """
        boules = []
        cochonnet = None
        
        # Extrahera detektioner
        boxes = detections['detection_boxes'][0].numpy()
        scores = detections['detection_scores'][0].numpy()
        classes = detections['detection_classes'][0].numpy()
        
        height, width = original_shape[:2]
        
        for i in range(len(scores)):
            if scores[i] < self.confidence_threshold:
                continue
            
            # Konvertera box-koordinater
            ymin, xmin, ymax, xmax = boxes[i]
            box = {
                'x': int(xmin * width),
                'y': int(ymin * height),
                'width': int((xmax - xmin) * width),
                'height': int((ymax - ymin) * height)
            }
            
            # Beräkna centrum och radie
            center_x = box['x'] + box['width'] // 2
            center_y = box['y'] + box['height'] // 2
            radius = max(box['width'], box['height']) // 2
            
            obj = {
                'box': box,
                'center': (center_x, center_y),
                'radius': radius,
                'confidence': float(scores[i])
            }
            
            # Klassificera som boule eller cochonnet
            if classes[i] == 1:  # Boule
                obj['id'] = len(boules) + 1
                obj['team'] = self.classify_team(obj)
                boules.append(obj)
            elif classes[i] == 2:  # Cochonnet
                cochonnet = obj
        
        return boules, cochonnet
    
    def classify_team(self, boule: Dict) -> str:
        """
        Klassificera vilket lag boulen tillhör baserat på färg
        """
        # I produktion: analysera färg i bounding box
        # För nu: alternera mellan lag
        return 'A' if boule['id'] % 2 == 1 else 'B'
    
    def detect_with_color(self, image: np.ndarray) -> Dict:
        """
        Detektera objekt med färgbaserad metod (backup)
        Använder HSV-färgrymd för att hitta boular
        """
        # Konvertera till HSV
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Definiera färgintervall för silver/metall boular
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
        boules = self.find_circles(mask_metal, min_radius=30, max_radius=50)
        cochonnet_list = self.find_circles(mask_red, min_radius=10, max_radius=20)
        
        cochonnet = cochonnet_list[0] if cochonnet_list else None
        
        return {
            'boules': boules,
            'cochonnet': cochonnet,
            'method': 'color_detection'
        }
    
    def find_circles(
        self,
        mask: np.ndarray,
        min_radius: int,
        max_radius: int
    ) -> List[Dict]:
        """
        Hitta cirkulära objekt i mask
        """
        # Använd Hough Circle Transform
        circles = cv2.HoughCircles(
            mask,
            cv2.HOUGH_GRADIENT,
            dp=1,
            minDist=50,
            param1=50,
            param2=30,
            minRadius=min_radius,
            maxRadius=max_radius
        )
        
        objects = []
        if circles is not None:
            circles = np.uint16(np.around(circles))
            for i, (x, y, r) in enumerate(circles[0, :]):
                objects.append({
                    'id': i + 1,
                    'center': (int(x), int(y)),
                    'radius': int(r),
                    'confidence': 1.0
                })
        
        return objects
    
    def visualize_detections(
        self,
        image: np.ndarray,
        detections: Dict
    ) -> np.ndarray:
        """
        Rita detektioner på bilden
        """
        output = image.copy()
        
        # Rita boular
        for boule in detections['boules']:
            center = boule['center']
            radius = boule['radius']
            
            # Rita cirkel
            cv2.circle(output, center, radius, (0, 255, 0), 2)
            
            # Rita ID och lag
            text = f"B{boule['id']} ({boule.get('team', '?')})"
            cv2.putText(
                output,
                text,
                (center[0] - 20, center[1] - radius - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                2
            )
        
        # Rita cochonnet
        if detections['cochonnet']:
            cochonnet = detections['cochonnet']
            center = cochonnet['center']
            radius = cochonnet['radius']
            
            cv2.circle(output, center, radius, (0, 0, 255), 2)
            cv2.putText(
                output,
                "Cochonnet",
                (center[0] - 30, center[1] - radius - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 255),
                2
            )
        
        return output


def main():
    """
    Test-funktion
    """
    print("🎯 Testing Boule Detector")
    
    # Skapa detektor
    detector = BouleDetector()
    
    # Ladda testbild
    image = cv2.imread('test_images/petanque_game.jpg')
    
    if image is None:
        print("❌ Could not load test image")
        return
    
    # Detektera objekt
    detections = detector.detect_with_color(image)
    
    print(f"✅ Found {len(detections['boules'])} boules")
    print(f"✅ Found cochonnet: {detections['cochonnet'] is not None}")
    
    # Visualisera
    output = detector.visualize_detections(image, detections)
    
    # Spara resultat
    cv2.imwrite('output/detections.jpg', output)
    print("✅ Results saved to output/detections.jpg")


if __name__ == '__main__':
    main()
