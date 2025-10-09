import multer from "multer";

// Configure multer to use memory storage. This is useful for temporarily
// holding the file buffer before uploading it to a cloud service like ImageKit.
const storage = multer.memoryStorage();

// Create the multer upload instance.
const upload = multer({ storage: storage });

export { upload };
