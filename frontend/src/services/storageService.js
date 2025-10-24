// 📦 Storage Service - Firebase Storage
import { storage } from '../config/firebase';
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';

// 📸 Ladda upp bild
export const uploadImage = async (file, userId, folder = 'images') => {
  try {
    const timestamp = Date.now();
    const fileName = `${folder}/${userId}/${timestamp}.jpg`;
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('✅ Image uploaded:', downloadURL);
    return { success: true, url: downloadURL, path: fileName };
  } catch (error) {
    console.error('❌ Upload image error:', error.message);
    return { success: false, error: error.message };
  }
};

// 🎥 Ladda upp video med progress
export const uploadVideo = async (file, userId, onProgress) => {
  try {
    const timestamp = Date.now();
    const fileName = `videos/${userId}/${timestamp}.mp4`;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload progress:', progress + '%');
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          // Error
          console.error('❌ Upload video error:', error.message);
          reject({ success: false, error: error.message });
        },
        async () => {
          // Complete
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('✅ Video uploaded:', downloadURL);
          resolve({ success: true, url: downloadURL, path: fileName });
        }
      );
    });
  } catch (error) {
    console.error('❌ Upload video error:', error.message);
    return { success: false, error: error.message };
  }
};

// 📁 Ladda upp fil (generisk)
export const uploadFile = async (file, userId, folder, onProgress) => {
  try {
    const timestamp = Date.now();
    const extension = file.name ? file.name.split('.').pop() : 'bin';
    const fileName = `${folder}/${userId}/${timestamp}.${extension}`;
    const storageRef = ref(storage, fileName);

    if (onProgress) {
      // Med progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => reject({ success: false, error: error.message }),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ success: true, url: downloadURL, path: fileName });
          }
        );
      });
    } else {
      // Utan progress tracking
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { success: true, url: downloadURL, path: fileName };
    }
  } catch (error) {
    console.error('❌ Upload file error:', error.message);
    return { success: false, error: error.message };
  }
};

// 🗑️ Ta bort fil
export const deleteFile = async (filePath) => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    console.log('✅ File deleted:', filePath);
    return { success: true };
  } catch (error) {
    console.error('❌ Delete file error:', error.message);
    return { success: false, error: error.message };
  }
};

// 📋 Lista alla filer i en folder
export const listFiles = async (userId, folder = 'images') => {
  try {
    const folderPath = `${folder}/${userId}`;
    const storageRef = ref(storage, folderPath);
    const result = await listAll(storageRef);

    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url
        };
      })
    );

    console.log('✅ Files listed:', files.length);
    return { success: true, data: files };
  } catch (error) {
    console.error('❌ List files error:', error.message);
    return { success: false, error: error.message };
  }
};

// 📸 Ladda upp profilbild
export const uploadProfileImage = async (file, userId) => {
  return uploadImage(file, userId, 'profiles');
};

// 🎥 Ladda upp träningsvideo
export const uploadTrainingVideo = async (file, userId, onProgress) => {
  return uploadVideo(file, userId, onProgress);
};

export default {
  uploadImage,
  uploadVideo,
  uploadFile,
  deleteFile,
  listFiles,
  uploadProfileImage,
  uploadTrainingVideo
};
