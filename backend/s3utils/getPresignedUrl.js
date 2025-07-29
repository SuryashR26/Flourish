
const AWS = require('aws-sdk');
const { duplicatePhoto } = require('./duplicateProfilePhoto');

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
});

const getPresignedUrl = async (userId, filename, filetype) => {
    try {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedImageTypes.includes(filetype)) {
            throw new Error('Only image uploads are allowed.');
        }

        // Delete existing photos
        await duplicatePhoto(userId);

        const key = `profile-uploads/${userId}-${filename}`;
        console.log("About to call getSignedUrlPromise");
        const url = await s3.getSignedUrlPromise('putObject', {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Expires: 60,
            ContentType: filetype,
            ACL: 'public-read',
        });
        console.log("Presigned URL generated:", url);

        return { url, key };
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        throw error;
    }
};

module.exports = { getPresignedUrl };

