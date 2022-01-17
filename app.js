const express = require("express");
const app = express();
const JSZip = require("jszip");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: "application/*+json" }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

/*************** File Uploader****************/

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, `public/temp`));
  },
  filename: (req, file, cb) => {
    cb(null, req.body.FileName);
  },
});
const Upload = multer({ storage: Storage });

app.post("/Upload", Upload.single("file"), (req, res) => {
  res.status(200).json("File has been Uploaded");
});

/*************** ****************/

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/success/:fileName", (req, res) => {
  res.sendFile(path.join(__dirname, `public/temp/${req.params.fileName}.zip`));
  setTimeout(() => {
    fs.readdir(path.join(__dirname, `public/temp/`), (err, files) => {
      if (err) console.log(err);
      else {
        for (const file of files) {
          fs.unlink(
            path.join(path.join(__dirname, `public/temp/`), file),
            (err) => {
              if (err) console.log(error);
            }
          );
        }
      }
    });
  }, 2000);
});

app.get("/error", (req, res) => {
  res.render("error");
});

app.post("/compress", (req, res) => {
  var zip = new JSZip();
  zip.file(
    "FileCompressor.txt",
    "These Files are compressed using File Compressor"
  );
  fs.readdir(path.join(__dirname, `public/temp`), (err, files) => {
    if (err) {
      console.log(err);
    } else {
      for (const file of files) {
        zip.file(
          file,
          fs.readFileSync(path.join(__dirname, `public/temp/${file}`), "utf8")
        );
      }
    }
  });
  zip.generateAsync({ type: "nodebuffer" }).then(function (content) {
    fs.writeFile("./public/temp/example.zip", content, (error) => {
      if (error) {
        return res.json({
          status: "Error",
          error: error,
        });
      } else {
        return res.json({
          status: "Success",
          file: "example.zip",
        });
      }
    });
  });
});

app.listen("80", () => {
  console.log("Running");
});