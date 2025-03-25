import { Router } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorStorePromise } from "../../llm-config";




const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
});



export const uploadRouter = Router();

// Ensure the upload directory is set and exists
process.env.UPLOAD_DIR = process.env.UPLOAD_DIR ?? "uploads";
const uploadDir = process.env.UPLOAD_DIR;


if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

uploadRouter.post("/", async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No files were uploaded.');
    }

    // check if the file is a pdf
    if (req.files.file.mimetype !== 'application/pdf') {
        return res.status(400).send('Only pdf files are allowed.');
    }


    // Get the file from the request
    const file = req.files.file;

    // Generate a random file name
    const fileName = crypto.randomBytes(16).toString("hex") + "_" + file.name;
    const filePath = path.join(uploadDir, fileName);

    try {
        // Save the file to disk
        await fs.promises.writeFile(filePath, file.data);
    } catch (err) {
        return res.status(500).send(err.message);
    }

    // Load the vector store

    let vectorStore = await vectorStorePromise;

    const loader = new PDFLoader(filePath);
    const docs = await loader.load();


    // Split the documents into smaller chunks
    const splits = await textSplitter.splitDocuments(docs);


    // Add the documents to the vector store
    await vectorStore.addDocuments(splits);


    // delete file after processing

    await fs.promises.unlink(filePath);





    return res.json({ message: "File uploaded" });
});

