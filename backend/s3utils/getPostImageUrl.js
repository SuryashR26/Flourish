
const AWS = require('aws-sdk');


const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
});

const getPostImageUrl = async (userId, postId, filename, filetype) => {
    try {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedImageTypes.includes(filetype)) {
            throw new Error('Only image uploads are allowed.');
        }

        const key = `post-uploads/${userId}/${postId}-${filename}`;

        const url = await s3.getSignedUrlPromise('putObject', {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Expires: 60,
            ContentType: filetype,
        });

        return { url, key };
    } catch (error) {
        console.error('Error generating post image presigned URL:', error);
        throw error;
    }
};

module.exports = { getPostImageUrl };

