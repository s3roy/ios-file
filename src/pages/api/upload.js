import fs from "fs";
import path from "path";
import { globSync } from "glob";
import AdmZip from "adm-zip";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

const directoryPath = path.join(process.cwd(), "uploads");

const processFiles = (zip, originalName, newName, matchCase) => {
  console.log("Processing files...");
  const zipEntries = zip.getEntries();
  const regexFlags = matchCase ? "g" : "gi";

  zipEntries.forEach((entry) => {
    console.log("Entry name:", entry.entryName);
    if (entry.entryName.match(new RegExp(originalName, regexFlags))) {
      const newEntryName = entry.entryName.replace(
        new RegExp(originalName, regexFlags),
        newName
      );
      console.log(`Renaming ${entry.entryName} to ${newEntryName}`);
      entry.entryName = newEntryName;
    }
    const content = entry.getData().toString("utf8");
    const updatedContent = content
      .replace(
        new RegExp(`import\\s+${originalName}`, regexFlags),
        `import ${newName}`
      )
      .replace(new RegExp(originalName, regexFlags), newName);
    entry.setData(Buffer.from(updatedContent, "utf8"));
  });

  return zip;
};

export default async (req, res) => {
  console.log("Parsing form...");
  const form = formidable({
    uploadDir: directoryPath,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      res.status(500).json({ error: "Error parsing form" });
      return;
    }

    console.log("Fields:", fields);
    console.log("Files:", files);

    const originalName = fields.originalName[0];
    const newName = fields.newName[0];
    const matchCase = fields.matchCase[0] === "true";

    try {
      // Access the correct filepath
      const filePath = files.file[0].filepath;
      console.log("File path:", filePath);

      const zip = new AdmZip(filePath);
      const processedZip = processFiles(zip, originalName, newName, matchCase);

      const outputPath = path.join(directoryPath, "output.zip");
      processedZip.writeZip(outputPath);
      console.log("Processed zip written to:", outputPath);

      res.setHeader("Content-Disposition", `attachment; filename=output.zip`);
      res.setHeader("Content-Type", "application/zip");
      res.send(fs.readFileSync(outputPath));
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({ error: "Error processing file" });
    }
  });
};
