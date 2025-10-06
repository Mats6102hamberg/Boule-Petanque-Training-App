# Tech Stack - Boule Pétanque Training App

## 📱 Frontend Stack

### Core Technologies
- **React Native** 0.72 - Cross-platform mobilutveckling
- **Expo** SDK 49 - Development platform och build tools

### Camera & Vision
- **react-native-vision-camera** ^3.6.0
  - High-performance kameraintegration
  - Frame processor för realtidsanalys
  - Support för ARKit/ARCore
  
- **react-native-mlkit-odt** (Object Detection)
  - ML Kit Object Detection & Tracking
  - On-device inference
  - Optimerad för mobila enheter

### AR & 3D
- **ARKit** (iOS) - Native modules
  - Djupdata och plane detection
  - World tracking
  - LiDAR-support (iPhone 12 Pro+)
  
- **ARCore** (Android) - Native modules
  - Djupdata och plane detection
  - Environmental understanding
  - Motion tracking

### ML & AI
- **Custom TensorFlow Lite modell**
  - On-device inference
  - Optimerad för mobil
  - Låg latens
  
- **Förtränad modell: COCO SSD MobileNet**
  - Objektdetektering
  - Finjusterad med boule-bilder
  - Real-time performance

### State Management
- **Redux Toolkit** - Global state management
- **React Navigation** - Navigation system

### Storage
- **AsyncStorage** - Lokal datalagring
- **MMKV** (optional) - Snabbare alternativ

---

## 🖥️ Backend Stack

### Core Technologies
- **Node.js** 18+
- **Express** 4.18.2

### Database
- **MongoDB** 6.0 - NoSQL-databas
- **Redis** 4.6.10 - Caching och realtidsbearbetning

### ML & AI Integration
- **Firebase ML Kit**
  - Cloud-baserad ML
  - AutoML Vision
  - Custom model hosting
  
- **Cloud Functions för avancerad analys**
  - Serverless compute
  - Automatisk skalning
  - Event-driven

### File Storage
- **Cloudinary** - Image/video hosting och CDN
- **AWS S3** (optional) - Objektlagring

### Real-time
- **Socket.io** - WebSocket-kommunikation

---

## 🤖 AI/ML Stack

### Core ML Frameworks
- **PyTorch** 2.0+ - Deep learning framework
- **TensorFlow** 2.14.0 - ML framework
- **Keras** 2.14.0 - High-level API

### Computer Vision
- **OpenCV** 4.8.1 - Image processing
- **opencv-contrib-python** - Advanced algorithms

### Model Training & Deployment
- **AWS SageMaker**
  - Managed ML platform
  - Training jobs
  - Model hosting
  - Automatic scaling
  
- **Google AI Platform** (alternative)
  - Vertex AI
  - AutoML
  - Model deployment

### Pre-trained Models
- **COCO SSD MobileNet**
  - Object detection
  - Finjusterad med boule-bilder
  
- **YOLO v8** (optional)
  - Real-time detection
  - Higher accuracy

### Data Processing
- **NumPy** 1.24.3 - Numerical computing
- **SciPy** 1.11.4 - Scientific computing
- **Pandas** 2.1.3 - Data manipulation

---

## 🏗️ Infrastructure & DevOps

### Cloud Providers
- **AWS**
  - EC2 för compute
  - S3 för storage
  - SageMaker för ML
  - CloudFront för CDN
  
- **Google Cloud Platform** (alternative)
  - Compute Engine
  - Cloud Storage
  - AI Platform

### CDN för modell-distribution
- **CloudFront** (AWS)
  - Global distribution
  - Low latency
  - Automatic scaling
  
- **Cloudflare** (alternative)
  - Edge computing
  - DDoS protection

### Edge Computing för snabb analys
- **AWS Lambda@Edge**
  - Serverless compute at edge
  - Low latency
  
- **Cloudflare Workers**
  - JavaScript at edge
  - Global deployment

### Containerization
- **Docker** 24.0+
- **Docker Compose** - Multi-container orchestration

### CI/CD
- **GitHub Actions** - Automated testing och deployment
- **Expo EAS** - Build service för frontend

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile App (React Native)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Vision Camera│  │  ML Kit ODT  │  │  TF Lite     │  │
│  │              │  │              │  │  Model       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                           │                               │
└───────────────────────────┼───────────────────────────────┘
                            │
                    REST API / WebSocket
                            │
┌───────────────────────────┼───────────────────────────────┐
│                    Backend (Node.js/Express)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   MongoDB    │  │    Redis     │  │  Firebase    │  │
│  │              │  │   (Cache)    │  │   ML Kit     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                           │                               │
└───────────────────────────┼───────────────────────────────┘
                            │
                    Cloud Functions
                            │
┌───────────────────────────┼───────────────────────────────┐
│                    AI/ML Services (Python)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PyTorch/TF  │  │   OpenCV     │  │  SageMaker   │  │
│  │   Training   │  │  Processing  │  │  Deployment  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
            ┌───────┴──────┐  ┌────┴─────┐
            │  CDN/Edge    │  │   S3     │
            │  Computing   │  │ Storage  │
            └──────────────┘  └──────────┘
```

---

## 🔧 Development Tools

### Code Quality
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **TypeScript** (optional) - Type checking

### Testing
- **Jest** - Unit testing
- **React Native Testing Library** - Component testing
- **Detox** (optional) - E2E testing

### Documentation
- **JSDoc** - Code documentation
- **Swagger/OpenAPI** - API documentation

---

## 📦 Installation Commands

### Frontend
```bash
cd frontend
npm install
```

### Backend
```bash
cd backend
npm install
```

### AI/ML
```bash
cd ai-ml
pip install -r requirements.txt
```

---

## 🚀 Performance Optimizations

### Frontend
- On-device ML inference (TensorFlow Lite)
- Frame skipping för bättre performance
- Lazy loading av komponenter
- Image optimization med Cloudinary

### Backend
- Redis caching för API responses
- Database indexing
- Connection pooling
- Rate limiting

### AI/ML
- Model quantization för mindre storlek
- ONNX Runtime för snabbare inference
- Batch processing
- Edge computing för låg latens

---

## 🔐 Security

### Frontend
- Secure storage för tokens
- Certificate pinning
- Code obfuscation

### Backend
- JWT authentication
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection (Helmet)

### Infrastructure
- HTTPS everywhere
- DDoS protection (Cloudflare)
- Regular security audits
- Encrypted backups
