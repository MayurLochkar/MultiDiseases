import tensorflow as tf
import numpy as np
from PIL import Image

# Load model
model = tf.keras.models.load_model("../models/skin_model.h5")

classes = ["akiec","bcc","bkl","mel","nv"]

# 👉 yahan apni test image ka path do
img_path = r"C:\Users\lochk\Downloads\skin C\processed_images_dataset\processed_images\ISIC_0032290.jpg"   # <-- CHANGE THIS

img = Image.open(img_path).convert("RGB")
img = img.resize((224,224))

img = np.array(img)/255.0
img = np.expand_dims(img, axis=0)

pred = model.predict(img)[0]

print("Probabilities:", pred)
print("Predicted:", classes[np.argmax(pred)])