// src/aws-config.js
import { RekognitionClient } from "@aws-sdk/client-rekognition";



const rekognitionClient = new RekognitionClient({
  region: import.meta.env.VITE_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_KEY,
  },
});

export default rekognitionClient;