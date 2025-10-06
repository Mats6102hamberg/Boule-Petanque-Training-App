"""
Throw Analyzer - Analysera kastteknik från video

Analyserar:
- Release angle (kastvinkel)
- Velocity (hastighet)
- Spin (rotation)
- Accuracy score (noggrannhet)
"""

import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional


class ThrowAnalyzer:
    """
    Huvudklass för att analysera kastteknik från video
    """
    
    def __init__(self):
        self.fps = 30
        self.frame_skip = 1
        
    def analyze_throw(self, video_path: str) -> Dict:
        """
        Analysera ett kast från video
        
        Args:
            video_path: Sökväg till video
            
        Returns:
            Dict med analysresultat
        """
        # 1. Extrahera nyckelrutor
        frames = self.extract_frames(video_path)
        
        if not frames:
            raise ValueError("Kunde inte extrahera frames från video")
        
        # 2. Spåra boulens bana
        trajectory = self.track_trajectory(frames)
        
        # 3. Analysera teknik
        analysis = {
            'release_angle': self.calculate_angle(trajectory),
            'velocity': self.calculate_velocity(trajectory),
            'spin': self.detect_spin(frames),
            'accuracy_score': self.calculate_accuracy(trajectory),
            'technique': self.classify_technique(trajectory),
            'feedback': self.generate_feedback(trajectory)
        }
        
        return analysis
    
    def extract_frames(self, video_path: str) -> List[np.ndarray]:
        """
        Extrahera nyckelrutor från video
        
        Args:
            video_path: Sökväg till video
            
        Returns:
            Lista med frames
        """
        frames = []
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print(f"❌ Kunde inte öppna video: {video_path}")
            return frames
        
        self.fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Spara varje N:e frame
            if frame_count % self.frame_skip == 0:
                frames.append(frame)
            
            frame_count += 1
        
        cap.release()
        print(f"✅ Extraherade {len(frames)} frames från video")
        
        return frames
    
    def track_trajectory(self, frames: List[np.ndarray]) -> List[Dict]:
        """
        Spåra boulens bana genom frames
        
        Args:
            frames: Lista med frames
            
        Returns:
            Lista med positioner och tidsstämplar
        """
        trajectory = []
        
        for i, frame in enumerate(frames):
            # Detektera boule i frame
            position = self.detect_boule_position(frame)
            
            if position:
                trajectory.append({
                    'frame': i,
                    'time': i / self.fps,
                    'position': position,
                    'x': position[0],
                    'y': position[1]
                })
        
        return trajectory
    
    def detect_boule_position(self, frame: np.ndarray) -> Optional[Tuple[int, int]]:
        """
        Detektera boulens position i en frame
        
        Args:
            frame: Input frame
            
        Returns:
            (x, y) position eller None
        """
        # Konvertera till gråskala
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Använd Hough Circle Transform för att hitta cirkulära objekt
        circles = cv2.HoughCircles(
            gray,
            cv2.HOUGH_GRADIENT,
            dp=1,
            minDist=50,
            param1=50,
            param2=30,
            minRadius=20,
            maxRadius=100
        )
        
        if circles is not None:
            circles = np.uint16(np.around(circles))
            # Ta första cirkeln (antar att det är boulen)
            x, y, r = circles[0][0]
            return (int(x), int(y))
        
        return None
    
    def calculate_angle(self, trajectory: List[Dict]) -> float:
        """
        Beräkna release angle (kastvinkel)
        
        Args:
            trajectory: Boulens bana
            
        Returns:
            Vinkel i grader
        """
        if len(trajectory) < 3:
            return 0.0
        
        # Ta första 3 punkterna för att beräkna initial vinkel
        p1 = trajectory[0]
        p2 = trajectory[1]
        p3 = trajectory[2]
        
        # Beräkna vinkel från horisontell linje
        dx = p3['x'] - p1['x']
        dy = p3['y'] - p1['y']
        
        angle = np.degrees(np.arctan2(dy, dx))
        
        # Konvertera till absolut vinkel (0-90 grader)
        angle = abs(angle)
        
        return angle
    
    def calculate_velocity(self, trajectory: List[Dict]) -> float:
        """
        Beräkna kastets hastighet
        
        Args:
            trajectory: Boulens bana
            
        Returns:
            Hastighet i m/s
        """
        if len(trajectory) < 2:
            return 0.0
        
        velocities = []
        
        for i in range(len(trajectory) - 1):
            p1 = trajectory[i]
            p2 = trajectory[i + 1]
            
            # Beräkna avstånd i pixlar
            dx = p2['x'] - p1['x']
            dy = p2['y'] - p1['y']
            distance_px = np.sqrt(dx**2 + dy**2)
            
            # Tid mellan frames
            dt = p2['time'] - p1['time']
            
            if dt > 0:
                # Hastighet i pixlar/sekund
                velocity_px = distance_px / dt
                
                # Konvertera till m/s (approximation, behöver kalibrering)
                # Antag att 100 pixlar ≈ 1 meter
                velocity_ms = velocity_px / 100.0
                velocities.append(velocity_ms)
        
        # Returnera medelhastighet
        return np.mean(velocities) if velocities else 0.0
    
    def detect_spin(self, frames: List[np.ndarray]) -> str:
        """
        Detektera rotation på boulen
        
        Args:
            frames: Lista med frames
            
        Returns:
            Typ av spin: 'backspin', 'topspin', 'sidespin', 'none'
        """
        # Detta är en förenklad implementation
        # I produktion skulle man använda optical flow eller feature tracking
        
        if len(frames) < 5:
            return 'none'
        
        # Analysera rörelse mellan frames
        # För nu returnerar vi en placeholder
        spin_types = ['backspin', 'topspin', 'sidespin', 'none']
        
        # TODO: Implementera faktisk spin-detektering
        # Använd optical flow för att spåra rotationsmönster
        
        return 'backspin'  # Placeholder
    
    def calculate_accuracy(self, trajectory: List[Dict]) -> float:
        """
        Beräkna accuracy score (0-100)
        
        Args:
            trajectory: Boulens bana
            
        Returns:
            Accuracy score
        """
        if not trajectory:
            return 0.0
        
        # Analysera hur rak banan är
        if len(trajectory) < 3:
            return 50.0
        
        # Beräkna avvikelse från ideal rak linje
        start = trajectory[0]
        end = trajectory[-1]
        
        # Ideal linje
        ideal_line = np.array([end['x'] - start['x'], end['y'] - start['y']])
        ideal_length = np.linalg.norm(ideal_line)
        
        if ideal_length == 0:
            return 50.0
        
        # Beräkna avvikelse för varje punkt
        deviations = []
        for point in trajectory[1:-1]:
            # Vektor från start till punkt
            point_vec = np.array([point['x'] - start['x'], point['y'] - start['y']])
            
            # Projektion på ideal linje
            projection = np.dot(point_vec, ideal_line) / ideal_length
            
            # Avstånd från ideal linje
            deviation = np.linalg.norm(point_vec - projection * ideal_line / ideal_length)
            deviations.append(deviation)
        
        # Konvertera till score (mindre avvikelse = högre score)
        avg_deviation = np.mean(deviations) if deviations else 0
        accuracy = max(0, 100 - avg_deviation)
        
        return min(100, accuracy)
    
    def classify_technique(self, trajectory: List[Dict]) -> str:
        """
        Klassificera kastteknik
        
        Args:
            trajectory: Boulens bana
            
        Returns:
            Teknik: 'pointing', 'shooting', 'rolling'
        """
        if not trajectory:
            return 'unknown'
        
        # Analysera hastighet och vinkel
        velocity = self.calculate_velocity(trajectory)
        angle = self.calculate_angle(trajectory)
        
        # Klassificera baserat på parametrar
        if velocity < 3.0 and angle < 30:
            return 'pointing'
        elif velocity > 6.0 and angle > 25:
            return 'shooting'
        elif velocity < 5.0 and angle < 20:
            return 'rolling'
        else:
            return 'mixed'
    
    def generate_feedback(self, trajectory: List[Dict]) -> List[str]:
        """
        Generera feedback baserat på analys
        
        Args:
            trajectory: Boulens bana
            
        Returns:
            Lista med feedback-meddelanden
        """
        feedback = []
        
        angle = self.calculate_angle(trajectory)
        velocity = self.calculate_velocity(trajectory)
        accuracy = self.calculate_accuracy(trajectory)
        
        # Feedback om vinkel
        if angle < 15:
            feedback.append("💡 Kastvinkeln är för låg. Försök höja armen något.")
        elif angle > 40:
            feedback.append("💡 Kastvinkeln är för hög. Sänk armen för bättre kontroll.")
        else:
            feedback.append("✅ Bra kastvinkel!")
        
        # Feedback om hastighet
        if velocity < 2.0:
            feedback.append("💡 Öka hastigheten något för längre kast.")
        elif velocity > 8.0:
            feedback.append("💡 Kasta lite mjukare för bättre precision.")
        else:
            feedback.append("✅ Bra kasthastighet!")
        
        # Feedback om noggrannhet
        if accuracy < 60:
            feedback.append("💡 Fokusera på att hålla en rak bana.")
        elif accuracy > 85:
            feedback.append("✅ Utmärkt precision!")
        
        return feedback


def train_on_different_surfaces():
    """
    Träna ML-modellen på olika underlag
    
    Lösning - Träna ML-modellen på olika underlag för bättre generalisering
    """
    training_data = [
        "gräs_1", "gräs_2", "gräs_3",
        "grus_1", "grus_2", "grus_3", 
        "sand_1", "sand_2", "asfalt_1"
    ]
    
    print("🎯 Tränar modell på olika underlag:")
    for surface in training_data:
        print(f"  - {surface}")
    
    # Ladda träningsdata för varje underlag
    all_data = []
    for surface in training_data:
        # Ladda data för detta underlag
        data = load_surface_data(surface)
        all_data.extend(data)
    
    # Träna modell på all data
    model = train_model(all_data)
    
    return model


def load_surface_data(surface_name: str) -> List:
    """
    Ladda träningsdata för ett specifikt underlag
    """
    # Placeholder - implementera faktisk datainläsning
    print(f"📂 Laddar data för {surface_name}")
    return []


def train_model(data: List) -> object:
    """
    Träna ML-modell på data
    """
    # Placeholder - implementera faktisk modellträning
    print(f"🚀 Tränar modell på {len(data)} exempel")
    return None


def main():
    """
    Test-funktion
    """
    print("🎯 Testing Throw Analyzer")
    
    analyzer = ThrowAnalyzer()
    
    # Test med exempel-video
    video_path = "test_videos/throw_example.mp4"
    
    try:
        analysis = analyzer.analyze_throw(video_path)
        
        print("\n📊 Analysresultat:")
        print(f"  Release Angle: {analysis['release_angle']:.1f}°")
        print(f"  Velocity: {analysis['velocity']:.2f} m/s")
        print(f"  Spin: {analysis['spin']}")
        print(f"  Accuracy Score: {analysis['accuracy_score']:.1f}/100")
        print(f"  Technique: {analysis['technique']}")
        
        print("\n💬 Feedback:")
        for fb in analysis['feedback']:
            print(f"  {fb}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Skapa en test-video eller använd befintlig video")


if __name__ == '__main__':
    main()
