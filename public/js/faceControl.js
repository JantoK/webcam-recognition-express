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

function setFaceDetector (detectorName) { 
    selectedFaceDetector = detectorName
    // SSD_MOBILENETV1 or TINY_FACE_DETECTOR
    if (!isFaceDetectionModelLoaded()) {
        await getCurrentFaceDetectionNet().load('/')
    }
}