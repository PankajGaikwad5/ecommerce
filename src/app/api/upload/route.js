import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable the default parser.
  },
};

export async function POST(req) {
  try {
    // Use the native FormData API
    const formData = await req.formData();
    // Get all files with field name "file". (Your file input should have name="file".)
    const files = formData.getAll('file');

    // Define the upload directory in the public folder
    const uploadFolder = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadFolder, { recursive: true });

    let uploadedFiles = [];

    // Loop over the File objects from FormData
    for (const file of files) {
      // file is a File (or Blob) from the Web API.
      // Convert it to a Buffer.
      const buffer = Buffer.from(await file.arrayBuffer());

      // Create a unique filename using a timestamp and the original file name.
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadFolder, fileName);

      // Save the file to the local filesystem.
      await fs.writeFile(filePath, buffer);

      // Build a URL to access the file. (Assuming your public folder is served as the root.)
      const fileUrl = `/uploads/${fileName}`;
      uploadedFiles.push(fileUrl);
    }

    return new Response(JSON.stringify({ uploadedFiles }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response('Error uploading files', { status: 500 });
  }
}
