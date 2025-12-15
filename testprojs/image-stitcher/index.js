const express = require('express');
const sharp = require('sharp');
const app = express();
const PORT = 4000;

// Middleware to parse JSON bodies (needed to receive the array of Base64 strings)
app.use(express.json({ limit: '50mb' })); 

app.post('/stitch', async (req, res) => {
    // Expecting req.body.slices to be an array of Base64 strings
    const base64Slices = req.body.slices;

    if (!Array.isArray(base64Slices) || base64Slices.length === 0) {
        return res.status(400).send({ error: 'Input must be an array of image slices (Base64 strings).' });
    }

    try {
        // 1. Convert Base64 strings to Buffers
        const buffers = base64Slices.map(base64 => Buffer.from(base64, 'base64'));

        // 2. Get metadata (width and height) for all slices
        const metadataPromises = buffers.map(buffer => sharp(buffer).metadata());
        const metadataArray = await Promise.all(metadataPromises);

        // All slices must have the same width for vertical stitching
        const finalWidth = metadataArray[0].width;
        let totalHeight = 0;
        
        // Calculate total canvas height
        for (const meta of metadataArray) {
            if (meta.width !== finalWidth) {
                // This is a safety check based on your Puppeteer output
                throw new Error('All image slices must have the same width for vertical stitching.');
            }
            totalHeight += meta.height;
        }

        // 3. Prepare images for composite (x: 0, y: cumulative height)
        let currentY = 0;
        const compositeImages = [];

        for (let i = 0; i < buffers.length; i++) {
            compositeImages.push({
                input: buffers[i],
                top: currentY,
                left: 0
            });
            currentY += metadataArray[i].height;
        }

        // 4. Create the final stitched canvas and composite the slices
        const stitchedBuffer = await sharp({
            create: {
                width: finalWidth,
                height: totalHeight,
                channels: 4, // Use 4 channels (RGBA) for PNG transparency support
                background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
            }
        })
        .composite(compositeImages)
        .png() // Convert the final image to PNG format
        .toBuffer();

        // 5. Send the stitched image back as binary data
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename="stitched_image.png"');
        res.send(stitchedBuffer);

    } catch (error) {
        console.error('Stitching error:', error.message);
        res.status(500).send({ error: `Image stitching failed: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`Image Stitcher API listening on port ${PORT}`);
});