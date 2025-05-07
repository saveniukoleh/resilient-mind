import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/config/firebase';

export const uploadProfilePicture = async (file: File, userId: string): Promise<string> => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `profile-pictures/${userId}/${timestamp}-${file.name}`;
    const storageRef = ref(storage, filename);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

export const deleteProfilePicture = async (userId: string, filename: string): Promise<void> => {
  try {
    const storageRef = ref(storage, `profile-pictures/${userId}/${filename}`);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    throw error;
  }
};
