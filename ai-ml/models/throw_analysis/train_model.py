"""
Träna ML-modell för att analysera kastteknik i pétanque
Använder TensorFlow/Keras för bildklassificering och pose estimation
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
import cv2
from pathlib import Path

class ThrowAnalysisModel:
    def __init__(self, input_shape=(224, 224, 3), num_classes=3):
        """
        Initialisera modellen
        
        Args:
            input_shape: Bildstorlek (height, width, channels)
            num_classes: Antal tekniker (pointing, shooting, rolling)
        """
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.model = None
        
    def build_model(self):
        """
        Bygg CNN-modell för kastteknikklassificering
        """
        # Base model med transfer learning (MobileNetV2)
        base_model = keras.applications.MobileNetV2(
            input_shape=self.input_shape,
            include_top=False,
            weights='imagenet'
        )
        
        # Frys base model layers
        base_model.trainable = False
        
        # Bygg custom top layers
        inputs = keras.Input(shape=self.input_shape)
        x = base_model(inputs, training=False)
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.Dropout(0.2)(x)
        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(0.2)(x)
        
        # Output layers
        technique_output = layers.Dense(self.num_classes, activation='softmax', name='technique')(x)
        angle_output = layers.Dense(1, activation='linear', name='angle')(x)
        speed_output = layers.Dense(1, activation='linear', name='speed')(x)
        
        self.model = keras.Model(
            inputs=inputs,
            outputs=[technique_output, angle_output, speed_output]
        )
        
        return self.model
    
    def compile_model(self):
        """
        Kompilera modellen med lämpliga loss functions och metrics
        """
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss={
                'technique': 'categorical_crossentropy',
                'angle': 'mse',
                'speed': 'mse'
            },
            loss_weights={
                'technique': 1.0,
                'angle': 0.5,
                'speed': 0.5
            },
            metrics={
                'technique': ['accuracy'],
                'angle': ['mae'],
                'speed': ['mae']
            }
        )
    
    def train(self, train_dataset, val_dataset, epochs=50):
        """
        Träna modellen
        
        Args:
            train_dataset: Träningsdata
            val_dataset: Valideringsdata
            epochs: Antal träningsepoker
        """
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7
            ),
            keras.callbacks.ModelCheckpoint(
                'models/best_throw_model.h5',
                monitor='val_loss',
                save_best_only=True
            ),
            keras.callbacks.TensorBoard(
                log_dir='logs',
                histogram_freq=1
            )
        ]
        
        history = self.model.fit(
            train_dataset,
            validation_data=val_dataset,
            epochs=epochs,
            callbacks=callbacks
        )
        
        return history
    
    def predict(self, image):
        """
        Förutsäg kastteknik från bild
        
        Args:
            image: Input-bild (numpy array)
            
        Returns:
            Dict med predictions
        """
        # Preprocessa bild
        processed_image = self.preprocess_image(image)
        
        # Predict
        technique_pred, angle_pred, speed_pred = self.model.predict(
            np.expand_dims(processed_image, axis=0)
        )
        
        # Konvertera till läsbart format
        technique_classes = ['pointing', 'shooting', 'rolling']
        technique_idx = np.argmax(technique_pred[0])
        
        return {
            'technique': technique_classes[technique_idx],
            'technique_confidence': float(technique_pred[0][technique_idx]),
            'angle': float(angle_pred[0][0]),
            'speed': float(speed_pred[0][0])
        }
    
    def preprocess_image(self, image):
        """
        Preprocessa bild för modellen
        """
        # Resize
        image = cv2.resize(image, (self.input_shape[0], self.input_shape[1]))
        
        # Normalisera
        image = image.astype('float32') / 255.0
        
        # MobileNetV2 preprocessing
        image = keras.applications.mobilenet_v2.preprocess_input(image)
        
        return image
    
    def save_model(self, path):
        """
        Spara modellen
        """
        self.model.save(path)
        print(f"Model saved to {path}")
    
    def load_model(self, path):
        """
        Ladda sparad modell
        """
        self.model = keras.models.load_model(path)
        print(f"Model loaded from {path}")


def create_dataset(data_dir, batch_size=32):
    """
    Skapa dataset från bilder
    
    Args:
        data_dir: Katalog med träningsbilder
        batch_size: Batch size
        
    Returns:
        tf.data.Dataset
    """
    # Ladda bilder och labels
    # Struktur: data_dir/technique/image.jpg
    
    dataset = tf.keras.preprocessing.image_dataset_from_directory(
        data_dir,
        labels='inferred',
        label_mode='categorical',
        batch_size=batch_size,
        image_size=(224, 224),
        shuffle=True,
        seed=42
    )
    
    # Data augmentation
    data_augmentation = keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
        layers.RandomContrast(0.1),
    ])
    
    # Applicera augmentation
    dataset = dataset.map(
        lambda x, y: (data_augmentation(x, training=True), y),
        num_parallel_calls=tf.data.AUTOTUNE
    )
    
    # Optimera performance
    dataset = dataset.prefetch(buffer_size=tf.data.AUTOTUNE)
    
    return dataset


def main():
    """
    Huvudfunktion för att träna modellen
    """
    print("🎯 Starting Throw Analysis Model Training")
    
    # Skapa modell
    model = ThrowAnalysisModel()
    model.build_model()
    model.compile_model()
    
    print(model.model.summary())
    
    # Ladda data
    train_dataset = create_dataset('data/train', batch_size=32)
    val_dataset = create_dataset('data/validation', batch_size=32)
    
    # Träna
    print("🚀 Training started...")
    history = model.train(train_dataset, val_dataset, epochs=50)
    
    # Spara modell
    model.save_model('models/throw_analysis_model.h5')
    
    print("✅ Training completed!")
    
    return model, history


if __name__ == '__main__':
    model, history = main()
