import { generateUploadButton } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/integrations/uploadthing/router";

// Generate a typed UploadButton connected to our Express route
export const UploadButton = generateUploadButton<OurFileRouter>({
  url: "/api/uploadthing",
});

export const { useUploadThing } = generateReactHelpers<OurFileRouter>({
  url: "/api/uploadthing",
});
