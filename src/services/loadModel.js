const tf = require('@tensorflow/tfjs-node');

async function loadModel() {
    model = await tf.loadLayersModel('file:///home/kali/bangkit/classification_batik_model.h5');
    return model;
}

module.exports = loadModel;
