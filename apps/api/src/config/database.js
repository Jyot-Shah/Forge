import mongoose from "mongoose";
import { environment } from "./environment.js";

export async function connectDatabase() {
  await mongoose.connect(environment.MONGODB_URI, {
    serverSelectionTimeoutMS: 5_000,
  });
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
