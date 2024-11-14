const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Routes = require('./routes/router');
const { createProxyMiddleware } = require('http-proxy-middleware'); 
const path = require("path");
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const archiver = require('archiver');



const app = express();
// const port = process.env.PORT || 443;
const port = process.env.PORT || 3800;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




// app.post('/redirectToAuth', (req, res) => {
//   const { returnUrl, encodeUrl } = req.body;
//   console.log(returnUrl, encodeUrl);
//   if (returnUrl && encodeUrl) {
//     res.json({ redirectUrl: returnUrl });
//     res.redirect(`https://auth.kslmedia.in/index.php?return=${encodeUrl}`);

//   } else {
//     res.status(400).json({ error: 'No returnUrl or encodeUrl provided' });
//   }
// });





app.post('/user', (req, res) => {
  try {
    // Access the request body
    const formData = req.body;
    const formDataJSON = JSON.stringify(formData);
    console.log(formData);

    if (formData !== null) {
      // const redirectURL = `https://printmaster.hindutamil.in/user?formData=${encodeURIComponent(formDataJSON)}`;


      const redirectURL = `http://192.168.90.104:3000/user?formData=${encodeURIComponent(formDataJSON)}`;
      return res.redirect(redirectURL);
    }
   
    console.log(formDataJSON);

    res.json({ message: 'Form data received successfully', formData: formDataJSON });
  } catch (error) {
    console.error('Error handling POST request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Set up Multer for handling image uploads
const upload = multer({ dest: 'uploads/' });





app.post('/convert', upload.array('images'), async (req, res) => {
  try {
    const format = req.query.format || 'jpeg'; // Desired format (jpeg or png)
    const convertedDir = path.join(__dirname, 'converted');

    // Ensure the "converted" directory exists
    if (!fs.existsSync(convertedDir)) {
      fs.mkdirSync(convertedDir);
    }

    // Convert all uploaded images
    const convertedFiles = await Promise.all(
      req.files.map(async (file) => {
        const outputFilePath = path.join(convertedDir, `${Date.now()}_${file.originalname}.${format}`);
        await sharp(file.path)
          .toFormat(format)
          .toFile(outputFilePath);

        return outputFilePath;
      })
    );

   // Format the current date and time for the zip file name
   const currentDateTime = new Date().toISOString().replace(/:/g, '-'); 
   const zipFileName = `converted_images_${currentDateTime}.zip`;
   const zipFilePath = path.join(__dirname, zipFileName);

   const output = fs.createWriteStream(zipFilePath);
   const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      // Send the zip file after it is fully created
      res.download(zipFilePath, (err) => {
        if (err) {
          console.error('Error sending the zip file:', err);
          res.status(500).send('Error sending the converted images.');
        } else {
          // Clean up temporary files
          [...req.files, ...convertedFiles, zipFilePath].forEach((file) => {
            fs.unlink(file.path || file, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Error deleting file:', unlinkErr);
              }
            });
          });
        }
      });
    });

    archive.on('error', (err) => {
      console.error('Error creating zip file:', err);
      res.status(500).send('Error creating zip file.');
    });

    archive.pipe(output);

    // Add each converted file to the zip
    convertedFiles.forEach((file) => {
      archive.file(file, { name: path.basename(file) });
    });

    await archive.finalize();
  } catch (error) {
    console.error('Error occurred while converting the images:', error);
    res.status(500).send('An error occurred while converting the images.');
  }
});



// Routes
app.use('/api', Routes);



app.get('/testing',(req,res)=>{
  res.send('welcome to my page')
})


app.use(express.static(path.join(__dirname, "/public")));


app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "public/index.html"));
});



// Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
