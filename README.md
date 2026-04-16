# 🩺 MultiDiseases AI Diagnostic Platform

An advanced, comprehensive Medical AI Web Application capable of diagnosing multiple serious illnesses using deep learning Convolutional Neural Networks (CNN) and clinical feature assessments.

## 🚀 Features

* **Pneumonia Detection**: Analyzes chest X-Rays via CNN to detect pneumatic opacities.
* **Brain Tumor Detection**: Evaluates MRI scans for tumor masses.
* **Skin Cancer Classification**: Dermoscopic image analysis for 5 types of lesions (Melanoma, BCC, Nevus, etc.).
* **Heart Disease Risk**: Clinical numerical assessment based on patient vitals.
* **Diabetes Prediction**: Advanced metabolic feature analysis.
* **Grad-CAM Integration**: Visual Explainability AI! Maps exactly *where* the AI model is looking on the X-ray/MRI by rendering a dynamic color heatmap.
* **Secure Google Authentication**: Protected user sessions powered by Firebase.

## 🏗️ Architecture

1. **Frontend**: React.js / Vite using Tailwind CSS for premium, responsive UI/glassmorphism design.
2. **Gateway Server**: Node.js / Express.js serving as a CORS-friendly proxy and routing gateway.
3. **ML Inference Backend**: Python / FastAPI running highly optimized TensorFlow `keras` (.h5) and `scikit-learn` (.pkl) models.

## 🛠️ Setup Instructions

### 1. Python ML Service
```bash
cd server/ml-service
pip install -r requirements.txt # Ensure tensorflow, opencv-python, fastapi, uvicorn are installed
uvicorn main:app --port 8000
```

### 2. Node.js Gateway Proxy
```bash
cd server
npm install
node server.js
```

### 3. React Frontend
```bash
cd multidisease-ai
npm install
npm run dev
```

## ✨ Highlights
* **Eager Layer Execution**: Robust GradCAM extraction overriding Keras 3 sequential graph limitations.
* **Dynamic Results Panel**: Beautiful clinical summary printouts dynamically fetched.

---
*Built for the future of accessible AI medical diagnosis.*
