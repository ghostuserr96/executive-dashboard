let modelsLoaded = false;

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/cddh/face-api.js@master/weights';
const BACKUP_MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/';

/**
 * Dynamically injects face-api.js script tag into document if not present
 */
export async function loadFaceApiScript() {
  if (window.faceapi) {
    return window.faceapi;
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById('face-api-script');
    if (existingScript) {
      if (window.faceapi) {
        resolve(window.faceapi);
      } else {
        existingScript.addEventListener('load', () => resolve(window.faceapi));
        existingScript.addEventListener('error', () => reject(new Error('Failed to load face-api script')));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'face-api-script';
    script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.js';
    script.async = true;
    script.onload = () => {
      console.log('[FaceAPI] Library loaded successfully from CDN');
      resolve(window.faceapi);
    };
    script.onerror = (err) => {
      console.error('[FaceAPI] CDN load error:', err);
      reject(new Error('Failed to load face-api script library'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Loads face-api.js neural network models (SSD Mobilenet, Landmark68, FaceRecognition)
 */
export async function loadModels() {
  const faceapi = await loadFaceApiScript();

  if (!modelsLoaded) {
    try {
      console.log('[FaceAPI] Loading face detection & recognition neural network models...');
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      modelsLoaded = true;
      console.log('[FaceAPI] Neural network models loaded successfully!');
    } catch (err) {
      console.warn('[FaceAPI] Primary model CDN notice:', err.message, '- attempting backup models CDN');
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(BACKUP_MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(BACKUP_MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(BACKUP_MODEL_URL)
        ]);
        modelsLoaded = true;
      } catch (backupErr) {
        console.error('[FaceAPI] Backup models load failed:', backupErr);
        throw new Error('Could not load face-api neural network models');
      }
    }
  }

  return faceapi;
}

/**
 * Extract 128D face descriptor vector from an HTML Image, Canvas, or Video element
 * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} inputElement 
 */
export async function extractFaceDescriptor(inputElement) {
  const faceapi = await loadModels();
  if (!faceapi) throw new Error('face-api library not ready');

  // Try SSD Mobilenet with lower confidence threshold for cropped avatar support
  let detection = await faceapi
    .detectSingleFace(inputElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.15 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    console.warn('[FaceAPI] Single face detection returned null on input element');
    return null;
  }

  return {
    descriptor: detection.descriptor,
    landmarks: detection.landmarks,
    detection: detection.detection
  };
}

/**
 * Load an image from a URL and extract its 128D face descriptor vector
 * Handles external CORS URLs using faceapi.fetchImage and Base64 Data URLs cleanly
 * @param {string} imageUrl 
 */
export async function extractFaceDescriptorFromUrl(imageUrl) {
  if (!imageUrl) return null;

  const faceapi = await loadModels();
  if (!faceapi) return null;

  try {
    let imgElement = null;

    if (imageUrl.startsWith('data:image/')) {
      // Base64 Data URL
      imgElement = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(new Error('Base64 image load error'));
        img.src = imageUrl;
      });
    } else {
      // External Image URL (Cloudinary, Unsplash, etc.)
      try {
        imgElement = await faceapi.fetchImage(imageUrl);
      } catch (fetchErr) {
        console.warn('[FaceAPI] fetchImage notice:', fetchErr.message, 'falling back to Image element load');
        imgElement = await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(new Error('Image CORS load error'));
          img.src = imageUrl;
        });
      }
    }

    if (!imgElement) return null;

    return await extractFaceDescriptor(imgElement);
  } catch (err) {
    console.warn('[FaceAPI] Reference image descriptor extraction notice:', err.message);
    return null;
  }
}

/**
 * Calculates Euclidean distance and similarity match score between two 128D face descriptors
 * Distance < 0.6 indicates a verified match in face-api.js!
 * @param {Float32Array} descriptor1 
 * @param {Float32Array} descriptor2 
 */
export function calculateMatchScore(descriptor1, descriptor2) {
  if (!window.faceapi || !descriptor1 || !descriptor2) {
    return { isMatch: false, score: 0, distance: 1.0 };
  }

  const distance = window.faceapi.euclideanDistance(descriptor1, descriptor2);
  // Flexible threshold (distance < 0.65) for webcam & mobile screen photo matching
  const isMatch = distance < 0.65;
  const similarityScore = Math.max(0, Math.min(100, Math.round((1 - distance / 1.5) * 100)));

  return {
    isMatch,
    score: similarityScore,
    distance: parseFloat(distance.toFixed(4))
  };
}

export const faceApiService = {
  loadModels,
  extractFaceDescriptor,
  extractFaceDescriptorFromUrl,
  calculateMatchScore
};
