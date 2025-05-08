import { ZoomMtg } from '@zoom/meetingsdk';
import { storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface RecordingOptions {
  sessionId: string;
  userId: string;
  onRecordingStart?: () => void;
  onRecordingStop?: (url: string) => void;
  onError?: (error: string) => void;
}

export class CallRecorder {
  private options: RecordingOptions;
  private isRecording: boolean = false;
  private recordingStartTime: Date | null = null;

  constructor(options: RecordingOptions) {
    this.options = options;
  }

  async startRecording(): Promise<void> {
    try {
      // Request recording permission from Zoom
      await ZoomMtg.startRecording({
        success: async (success: any) => {
          console.log('Recording started successfully:', success);
          this.isRecording = true;
          this.recordingStartTime = new Date();
          this.options.onRecordingStart?.();
        },
        error: (error: any) => {
          console.error('Failed to start recording:', error);
          this.options.onError?.('Failed to start recording');
        },
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      this.options.onError?.('Failed to start recording');
    }
  }

  async stopRecording(): Promise<void> {
    try {
      // Stop recording and get the recording file
      await ZoomMtg.stopRecording({
        success: async (success: any) => {
          console.log('Recording stopped successfully:', success);
          this.isRecording = false;

          // Upload recording to Firebase Storage
          const recordingUrl = await this.uploadRecording(success.recordingFile);

          // Save recording metadata to database
          await this.saveRecordingMetadata(recordingUrl);

          this.options.onRecordingStop?.(recordingUrl);
        },
        error: (error: any) => {
          console.error('Failed to stop recording:', error);
          this.options.onError?.('Failed to stop recording');
        },
      });
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.options.onError?.('Failed to stop recording');
    }
  }

  private async uploadRecording(file: Blob): Promise<string> {
    try {
      // Create a unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `recordings/${this.options.sessionId}/${timestamp}.mp4`;
      const storageRef = ref(storage, filename);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw new Error('Failed to upload recording');
    }
  }

  private async saveRecordingMetadata(recordingUrl: string): Promise<void> {
    try {
      // Save recording metadata to your database
      await fetch('/api/recordings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.options.sessionId,
          userId: this.options.userId,
          url: recordingUrl,
          startTime: this.recordingStartTime,
          duration: this.getRecordingDuration(),
        }),
      });
    } catch (error) {
      console.error('Error saving recording metadata:', error);
      throw new Error('Failed to save recording metadata');
    }
  }

  private getRecordingDuration(): number {
    if (!this.recordingStartTime) return 0;
    return Math.floor((new Date().getTime() - this.recordingStartTime.getTime()) / 1000);
  }

  isRecordingActive(): boolean {
    return this.isRecording;
  }
}
