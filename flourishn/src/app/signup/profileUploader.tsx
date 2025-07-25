'use client'

import { useState } from 'react';
import { getPresignedUrl } from '@/api/apiClient';
import { FaPlus } from 'react-icons/fa';

export default function ProfileUploader() {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0];
        if (!selected) return;
        setFile(selected);

        try {
            const { url, key } = await getPresignedUrl(selected.name, selected.type);

            const uploadRes = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': selected.type },
                body: selected,
            });

            if (!uploadRes.ok) {
                throw new Error('Upload failed');
            }

            console.log('Uploaded to:', key);

        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };

    return (
        <div>
            <input
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/webp"
                style={{ display: 'none' }}
            />
            <label
                htmlFor="fileInput"
                style={{ cursor: 'pointer' }}
                title="Upload profile photo"
            >
                <FaPlus size={30} color="#0070f3" />
            </label>
            {file && <p>Selected file: {file.name}</p>}
        </div>
    );
}

