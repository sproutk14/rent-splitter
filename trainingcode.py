import tensorflow as tf
import numpy as np

# Synthetic training data: [area, bathroom, fair_rent]
X = np.array([
    [150, 1, 1200], [200, 1, 1600], [100, 0, 800],
    [180, 0, 1000], [220, 1, 1800]
], dtype=np.float32)

model = tf.keras.Sequential([
    tf.keras.layers.Dense(8, activation='relu', input_shape=(2,)),
    tf.keras.layers.Dense(1)
])

model.compile(optimizer='adam', loss='mse')
model.fit(X[:, :2], X[:, 2], epochs=100)

# Save for TensorFlow.js
tf.saved_model.save(model, 'saved_model')