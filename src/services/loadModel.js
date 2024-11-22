const tf = require('@tensorflow/tfjs-node');

async function loadModel() {
    model = tf.loadGraphModel(process.env.MODEL_URL);
    return model;
}

module.exports = loadModel;
