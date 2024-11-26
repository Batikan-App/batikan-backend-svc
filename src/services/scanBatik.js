const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');
const { Firestore } = require('@google-cloud/firestore');

async function scanBatik(model, image) {
    const db = new Firestore();

    try {
        const tensor = tf.node
            .decodeJpeg(image) // Decode the image (JPEG, JPG, PNG Format)
            .resizeNearestNeighbor([224, 224]) // Resize to the model's expected input size
            .expandDims(0) // Batch dimension
            .toFloat()
            .div(tf.scalar(255.0)); // Normalize pixel values

        // Perform prediction
        const prediction = model.predict(tensor);
        const scores = Array.from(await prediction.data()); // Extract scores as an array
        const maxScoreIndex = scores.indexOf(Math.max(...scores)); // Get index of the highest score

        // Map the index to a class label
        const labels = ["Insang", "Kawung", "Mega Mendung", "Parang", "Sidoluhur", "Truntum", "Tumpal"];
        const predictedLabel = labels[maxScoreIndex];
        const confidence = (scores[maxScoreIndex] * 100).toFixed(2); // Confidence as percentage

        const batikId = await db.collection('batik').where('name', '==', predictedLabel).get();

        return {
            id: batikId.docs[0].id,
            confidence: `${confidence}%`,
        };
    } catch (error) {
        throw new InputError('Scan Batik Failed.')
    }
}

module.exports = scanBatik;
