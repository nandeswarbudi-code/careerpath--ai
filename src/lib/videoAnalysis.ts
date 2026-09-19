import { FaceLandmarker, FilesetResolver, type FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export interface VideoBehaviorMetrics {
  samples: number;
  faceVisiblePercent: number;
  centeredPercent: number;
  lookingForwardPercent: number;
  steadyPercent: number;
  status: 'measured' | 'unavailable';
}

const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const WASM_URLS = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm',
  'https://unpkg.com/@mediapipe/tasks-vision@1.0.1/wasm',
];

export class VideoBehaviorAnalyzer {
  private landmarker: FaceLandmarker | null = null;
  private samples = 0;
  private visible = 0;
  private centered = 0;
  private lookingForward = 0;
  private steady = 0;
  private trackedSamples = 0;
  private lastVideoTime = -1;
  private previousFaceCenter: { x: number; y: number } | null = null;
  private smoothedFaceCenter: { x: number; y: number } | null = null;

  async initialize(): Promise<void> {
    let vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>> | null = null;
    let lastError: unknown = null;
    for (const wasmUrl of WASM_URLS) {
      try {
        vision = await FilesetResolver.forVisionTasks(wasmUrl);
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!vision) throw lastError instanceof Error ? lastError : new Error('MediaPipe runtime could not be loaded.');
    const options = { runningMode: 'VIDEO' as const, numFaces: 1 };
    try {
      this.landmarker = await FaceLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' }, ...options });
    } catch {
      this.landmarker = await FaceLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' }, ...options });
    }
  }

  analyze(video: HTMLVideoElement): void {
    if (!this.landmarker || video.readyState < 2 || video.currentTime === this.lastVideoTime) return;
    this.lastVideoTime = video.currentTime;
    const result: FaceLandmarkerResult = this.landmarker.detectForVideo(video, performance.now());
    this.samples += 1;
    const face = result.faceLandmarks[0];
    if (!face) {
      this.previousFaceCenter = null;
      this.smoothedFaceCenter = null;
      return;
    }
    this.visible += 1;

    const nose = face[1];
    const leftEye = face[33];
    const rightEye = face[263];
    if (!nose || !leftEye || !rightEye) return;

    const bounds = face.reduce((box, landmark) => ({
      minX: Math.min(box.minX, landmark.x),
      maxX: Math.max(box.maxX, landmark.x),
      minY: Math.min(box.minY, landmark.y),
      maxY: Math.max(box.maxY, landmark.y),
    }), { minX: 1, maxX: 0, minY: 1, maxY: 0 });
    const faceWidth = Math.max(bounds.maxX - bounds.minX, 0.01);
    const faceHeight = Math.max(bounds.maxY - bounds.minY, 0.01);
    const faceCenter = {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
    };
    const eyeCenter = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 };
    const eyeWidth = Math.max(Math.abs(rightEye.x - leftEye.x), 0.01);
    const noseOffsetX = Math.abs(nose.x - eyeCenter.x) / eyeWidth;
    const noseOffsetY = Math.abs(nose.y - eyeCenter.y) / eyeWidth;
    const withinFrame = faceCenter.x > 0.3 && faceCenter.x < 0.7
      && faceCenter.y > 0.28 && faceCenter.y < 0.72;
    const usableSize = faceWidth > 0.12 && faceWidth < 0.8 && faceHeight > 0.12;

    this.trackedSamples += 1;
    if (withinFrame && usableSize) this.centered += 1;
    if (noseOffsetX < 0.42 && noseOffsetY < 0.9) this.lookingForward += 1;
    const smoothing = 0.35;
    const smoothedCenter = this.smoothedFaceCenter
      ? {
          x: this.smoothedFaceCenter.x + (faceCenter.x - this.smoothedFaceCenter.x) * smoothing,
          y: this.smoothedFaceCenter.y + (faceCenter.y - this.smoothedFaceCenter.y) * smoothing,
        }
      : faceCenter;
    if (this.previousFaceCenter && this.smoothedFaceCenter) {
      const movement = Math.hypot(
        (smoothedCenter.x - this.previousFaceCenter.x) / faceWidth,
        (smoothedCenter.y - this.previousFaceCenter.y) / faceHeight,
      );
      if (movement < 0.18) this.steady += 1;
    }
    this.previousFaceCenter = smoothedCenter;
    this.smoothedFaceCenter = smoothedCenter;
  }

  metrics(): VideoBehaviorMetrics {
    const sampleDenominator = Math.max(this.samples, 1);
    const trackedDenominator = Math.max(this.trackedSamples, 1);
    return {
      samples: this.samples,
      faceVisiblePercent: Math.round((this.visible / sampleDenominator) * 100),
      centeredPercent: Math.round((this.centered / trackedDenominator) * 100),
      lookingForwardPercent: Math.round((this.lookingForward / trackedDenominator) * 100),
      steadyPercent: Math.round((this.steady / Math.max(this.trackedSamples - 1, 1)) * 100),
      status: this.landmarker && this.samples > 0 ? 'measured' : 'unavailable',
    };
  }

  close(): void {
    this.landmarker?.close();
    this.landmarker = null;
    this.previousFaceCenter = null;
    this.smoothedFaceCenter = null;
  }
}
