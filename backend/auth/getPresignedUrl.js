const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
});

exports.getPresignedUrl = async (req, res) => {
    try {
        const { filename, filetype } = req.body;

        console.log('Presigned request received:', { filename, filetype });

        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedImageTypes.includes(filetype)) {
            return res.status(400).json({ error: 'Only image uploads are allowed.' });
        }

        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `profile-uploads/${Date.now()}-${filename}`,
            Expires: 60,
            ContentType: filetype,
        };

        const url = await s3.getSignedUrlPromise('putObject', params);

        res.json({
            url,
            key: params.Key,
        });
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        res.status(500).json({ error: 'Failed to generate presigned URL' });
    }
};
