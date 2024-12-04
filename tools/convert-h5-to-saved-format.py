import tensorflow as tf
import argparse

def main():
    parser = argparse.ArgumentParser(description='Convert Keras model to Saved model format')
    parser.add_argument('keras_model_file', type=str, help='Path to the Keras model file (.h5)')
    parser.add_argument('output_dir', type=str, help='Output directory for the Saved model format')
    args = parser.parse_args()

    # Load the Keras model
    model = tf.keras.models.load_model(args.keras_model_file)

    # Convert and save the model in saved model format
    tf.saved_model.save(model, args.output_dir)

if __name__ == '__main__':
    main()
