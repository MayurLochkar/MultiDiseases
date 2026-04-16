import tensorflow as tf
import numpy as np
import cv2

def make_gradcam_heatmap(img_array, model, last_conv_layer_name):
    # EAGER LAYER EXECUTION: Safely bypasses Keras 3 symbolic graph destruction
    with tf.GradientTape() as tape:
        x = img_array
        conv_output = None
        
        # Manually trace predictions block
        for layer in model.layers:
            x = layer(x)
            if layer.name == last_conv_layer_name:
                conv_output = x
                tape.watch(conv_output)
                
        predictions = x
        loss = predictions[:, tf.argmax(predictions[0])]
        
    # Get gradients
    grads = tape.gradient(loss, conv_output)
    
    # Average gradients spatially
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    
    # Weight the conviction outputs
    conv_outputs = conv_output[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    
    # Normalize 
    heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-10)
    return heatmap.numpy()


def overlay_heatmap(heatmap, image):
    heatmap = cv2.resize(heatmap, (image.shape[1], image.shape[0]))
    heatmap = np.uint8(255 * heatmap)

    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    superimposed = heatmap * 0.4 + image
    return superimposed