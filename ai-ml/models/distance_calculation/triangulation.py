"""
Triangulering för avståndsberäkning i pétanque-appen

Grundprincip - Triangulering:
    cameraPosition → Object1 → Object2
             ↑          ↑         ↑
          Kameran   Boulen   Cochonnet

Tekniker som används:
- ARKit (iOS) / ARCore (Android)
- Stereo Vision (med två kameror)
- LiDAR (på nyare iPhone/iPad)
"""

import numpy as np
import cv2
from typing import Tuple, Dict, List, Optional


class Triangulator:
    """
    Klass för att beräkna avstånd mellan objekt med triangulering
    """
    
    def __init__(self, camera_matrix: np.ndarray = None, dist_coeffs: np.ndarray = None):
        """
        Initialisera triangulator
        
        Args:
            camera_matrix: Kameramatris (3x3)
            dist_coeffs: Distorsionskoefficienter
        """
        self.camera_matrix = camera_matrix
        self.dist_coeffs = dist_coeffs
        
        # Standard kameraparametrar (approximation)
        if camera_matrix is None:
            self.camera_matrix = np.array([
                [1000, 0, 960],   # fx, 0, cx
                [0, 1000, 540],   # 0, fy, cy
                [0, 0, 1]         # 0, 0, 1
            ], dtype=np.float32)
        
        if dist_coeffs is None:
            self.dist_coeffs = np.zeros((5, 1), dtype=np.float32)
    
    def calculate_distance_2d(
        self,
        point1: Tuple[float, float],
        point2: Tuple[float, float],
        reference_size: float,
        pixel_size: float
    ) -> float:
        """
        Beräkna verkligt avstånd från 2D-punkter
        
        Args:
            point1: (x, y) koordinater för första punkten
            point2: (x, y) koordinater för andra punkten
            reference_size: Känd storlek i verkligheten (meter)
            pixel_size: Storlek i pixlar
            
        Returns:
            Avstånd i meter
        """
        # Beräkna pixelavstånd
        dx = point2[0] - point1[0]
        dy = point2[1] - point1[1]
        pixel_distance = np.sqrt(dx**2 + dy**2)
        
        # Skala baserat på referensobjekt
        scale = reference_size / pixel_size
        real_distance = pixel_distance * scale
        
        return real_distance
    
    def calculate_distance_3d(
        self,
        point1_2d: Tuple[float, float],
        point2_2d: Tuple[float, float],
        depth1: float,
        depth2: float
    ) -> float:
        """
        Beräkna 3D-avstånd med djupinformation
        
        Args:
            point1_2d: 2D-koordinater för punkt 1
            point2_2d: 2D-koordinater för punkt 2
            depth1: Djup till punkt 1 (från kamera)
            depth2: Djup till punkt 2 (från kamera)
            
        Returns:
            3D-avstånd mellan punkterna
        """
        # Konvertera 2D till 3D med djupinformation
        point1_3d = self.pixel_to_3d(point1_2d, depth1)
        point2_3d = self.pixel_to_3d(point2_2d, depth2)
        
        # Beräkna euklidiskt avstånd
        distance = np.linalg.norm(point1_3d - point2_3d)
        
        return distance
    
    def pixel_to_3d(
        self,
        pixel_coords: Tuple[float, float],
        depth: float
    ) -> np.ndarray:
        """
        Konvertera pixelkoordinater till 3D-koordinater
        
        Args:
            pixel_coords: (x, y) pixelkoordinater
            depth: Djup i meter
            
        Returns:
            3D-koordinater [X, Y, Z]
        """
        x, y = pixel_coords
        
        # Hämta kameraparametrar
        fx = self.camera_matrix[0, 0]
        fy = self.camera_matrix[1, 1]
        cx = self.camera_matrix[0, 2]
        cy = self.camera_matrix[1, 2]
        
        # Konvertera till 3D
        X = (x - cx) * depth / fx
        Y = (y - cy) * depth / fy
        Z = depth
        
        return np.array([X, Y, Z])
    
    def triangulate_stereo(
        self,
        point_left: Tuple[float, float],
        point_right: Tuple[float, float],
        baseline: float,
        focal_length: float
    ) -> Tuple[float, float, float]:
        """
        Triangulering med stereo vision
        
        Args:
            point_left: Punkt i vänster bild
            point_right: Punkt i höger bild
            baseline: Avstånd mellan kameror (meter)
            focal_length: Brännvidd (pixlar)
            
        Returns:
            (X, Y, Z) 3D-koordinater
        """
        # Beräkna disparitet
        disparity = abs(point_left[0] - point_right[0])
        
        if disparity == 0:
            return (0, 0, 0)
        
        # Beräkna djup
        Z = (baseline * focal_length) / disparity
        
        # Beräkna X och Y
        X = (point_left[0] - self.camera_matrix[0, 2]) * Z / focal_length
        Y = (point_left[1] - self.camera_matrix[1, 2]) * Z / focal_length
        
        return (X, Y, Z)
    
    def calculate_distances_from_detections(
        self,
        boules: List[Dict],
        cochonnet: Dict,
        use_reference_size: bool = True
    ) -> List[Dict]:
        """
        Beräkna avstånd från detekterade objekt
        
        Args:
            boules: Lista med detekterade boular
            cochonnet: Detekterad cochonnet
            use_reference_size: Använd känd storlek för skalning
            
        Returns:
            Lista med avstånd för varje boule
        """
        if not cochonnet:
            return []
        
        distances = []
        
        # Kända storleker
        BOULE_DIAMETER = 0.0755  # 75.5mm i meter
        COCHONNET_DIAMETER = 0.03  # 30mm i meter
        
        cochonnet_center = cochonnet['center']
        cochonnet_radius_px = cochonnet['radius']
        
        for boule in boules:
            boule_center = boule['center']
            boule_radius_px = boule['radius']
            
            if use_reference_size:
                # Använd cochonnet som referens för skalning
                distance = self.calculate_distance_2d(
                    cochonnet_center,
                    boule_center,
                    COCHONNET_DIAMETER,
                    cochonnet_radius_px * 2
                )
            else:
                # Enkel pixelbaserad beräkning
                dx = boule_center[0] - cochonnet_center[0]
                dy = boule_center[1] - cochonnet_center[1]
                pixel_distance = np.sqrt(dx**2 + dy**2)
                
                # Approximation (behöver kalibrering)
                distance = pixel_distance * 0.001
            
            distances.append({
                'bouleId': boule['id'],
                'distance': distance,
                'unit': 'meters',
                'confidence': min(boule['confidence'], cochonnet['confidence'])
            })
        
        # Sortera efter avstånd
        distances.sort(key=lambda x: x['distance'])
        
        return distances
    
    def calibrate_camera(
        self,
        calibration_images: List[np.ndarray],
        pattern_size: Tuple[int, int] = (9, 6),
        square_size: float = 0.025
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Kalibrera kamera med checkerboard-pattern
        
        Args:
            calibration_images: Lista med kalibreringsbilder
            pattern_size: Antal hörn i checkerboard (width, height)
            square_size: Storlek på rutor i meter
            
        Returns:
            (camera_matrix, dist_coeffs)
        """
        # Förbered objektpunkter
        objp = np.zeros((pattern_size[0] * pattern_size[1], 3), np.float32)
        objp[:, :2] = np.mgrid[0:pattern_size[0], 0:pattern_size[1]].T.reshape(-1, 2)
        objp *= square_size
        
        # Arrayer för att lagra punkter
        objpoints = []  # 3D-punkter i verkligheten
        imgpoints = []  # 2D-punkter i bild
        
        for img in calibration_images:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Hitta checkerboard-hörn
            ret, corners = cv2.findChessboardCorners(gray, pattern_size, None)
            
            if ret:
                objpoints.append(objp)
                
                # Förfina hörn
                criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
                corners2 = cv2.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
                imgpoints.append(corners2)
        
        # Kalibrera
        ret, camera_matrix, dist_coeffs, rvecs, tvecs = cv2.calibrateCamera(
            objpoints,
            imgpoints,
            gray.shape[::-1],
            None,
            None
        )
        
        self.camera_matrix = camera_matrix
        self.dist_coeffs = dist_coeffs
        
        return camera_matrix, dist_coeffs
    
    def undistort_image(self, image: np.ndarray) -> np.ndarray:
        """
        Korrigera bilddistorsion
        
        Args:
            image: Input-bild
            
        Returns:
            Korrigerad bild
        """
        h, w = image.shape[:2]
        new_camera_matrix, roi = cv2.getOptimalNewCameraMatrix(
            self.camera_matrix,
            self.dist_coeffs,
            (w, h),
            1,
            (w, h)
        )
        
        # Undistort
        undistorted = cv2.undistort(
            image,
            self.camera_matrix,
            self.dist_coeffs,
            None,
            new_camera_matrix
        )
        
        # Crop
        x, y, w, h = roi
        undistorted = undistorted[y:y+h, x:x+w]
        
        return undistorted


def example_usage():
    """
    Exempel på hur man använder Triangulator
    """
    # Skapa triangulator
    triangulator = Triangulator()
    
    # Exempel: Detekterade objekt
    boules = [
        {
            'id': 1,
            'center': (950, 550),
            'radius': 35,
            'confidence': 0.92
        },
        {
            'id': 2,
            'center': (980, 530),
            'radius': 35,
            'confidence': 0.89
        }
    ]
    
    cochonnet = {
        'center': (960, 540),
        'radius': 15,
        'confidence': 0.95
    }
    
    # Beräkna avstånd
    distances = triangulator.calculate_distances_from_detections(
        boules,
        cochonnet,
        use_reference_size=True
    )
    
    # Visa resultat
    print("Avstånd från cochonnet:")
    for d in distances:
        print(f"  Boule {d['bouleId']}: {d['distance']:.3f}m (confidence: {d['confidence']:.2f})")


if __name__ == '__main__':
    example_usage()
