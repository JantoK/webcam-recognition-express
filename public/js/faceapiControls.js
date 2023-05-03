const SSD_MOBILENETV1 = 'ssd_mobilenetv1'
const TINY_FACE_DETECTOR = 'tiny_face_detector'

function isFaceDetectionModelLoaded() {
    return !!getCurrentFaceDetectionNet().params
}
function getCurrentFaceDetectionNet() {
    if (selectedFaceDetector === SSD_MOBILENETV1) {
      return faceapi.nets.ssdMobilenetv1
    }
    if (selectedFaceDetector === TINY_FACE_DETECTOR) {
      return faceapi.nets.tinyFaceDetector
    }
}

async function setFaceDetector (detectorName) { 
    selectedFaceDetector = detectorName
    // SSD_MOBILENETV1 or TINY_FACE_DETECTOR
    if (!isFaceDetectionModelLoaded()) {
        await getCurrentFaceDetectionNet().load('/')
    }
}

// ssd_mobilenetv1 options
let minConfidence = 0.5

// tiny_face_detector options
let inputSize = 512
let scoreThreshold = 0.5

function getFaceDetectorOptions() {
  return selectedFaceDetector === SSD_MOBILENETV1
    ? new faceapi.SsdMobilenetv1Options({ minConfidence })
    : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
}