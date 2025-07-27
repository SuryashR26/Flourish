const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

const duplicatePhoto = async (user_id) => {
    try {
        const listedObjects = await s3
            .listObjectsV2({
                Bucket: BUCKET_NAME,
                Prefix: `profile-uploads/${user_id}`, // removed space
            })
            .promise();

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            console.log('No files found for this user.');
            return;
        }

        const deleteParams = {
            Bucket: BUCKET_NAME,
            Delete: {
                Objects: listedObjects.Contents.map(obj => ({ Key: obj.Key })),
            },
        };

        const deleteResult = await s3.deleteObjects(deleteParams).promise();

        console.log('Deleted:', deleteResult.Deleted);
    } catch (err) {
        console.error('Error deleting user photos from S3:', err);
    }
};

module.exports = { duplicatePhoto };