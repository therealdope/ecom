import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

function extractPublicIdFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;

        const uploadIndex = pathname.indexOf('/upload/');
        if (uploadIndex === -1) return null;

        let publicIdWithVersion = pathname.substring(uploadIndex + 8);

        publicIdWithVersion = publicIdWithVersion.replace(/^v\d+\//, '');

        const lastDotIndex = publicIdWithVersion.lastIndexOf('.');
        if (lastDotIndex !== -1) {
            return publicIdWithVersion.substring(0, lastDotIndex);
        }

        return publicIdWithVersion;
    } catch {
        return null;
    }
}

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const oldImageUrl = searchParams.get('oldImageUrl');

        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'products';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Upload new image first
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream({ folder, resource_type: 'auto' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                )
                .end(buffer);
        });

        // Delete old image
        if (oldImageUrl) {
            const publicId = extractPublicIdFromUrl(oldImageUrl);
            console.log('Attempting to delete old image with publicId:', publicId);

            if (publicId) {
                try {
                    const deleteResult = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
                    console.log('Delete result:', deleteResult);
                } catch (delError) {
                    console.warn('Failed to delete old image:', delError.message);
                }
            } else {
                console.warn('Could not extract public ID from old image URL');
            }
        }

        return NextResponse.json({
            secure_url: uploadResult.secure_url,
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}