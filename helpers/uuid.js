// Define a type alias for UUID strings
//export type UUID = string;

// Import the v4 function from the uuid package
import { v4 as uuidv4 } from 'uuid';

// Define the generateUUID function
export function generateUUID() {
  // Generate a UUID
  const uuid = uuidv4();

  // Remove dashes from the UUID
  const Uuid = uuid.replace(/-/g, '');

  return Uuid;
}
