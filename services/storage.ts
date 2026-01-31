import { supabase } from './supabase';

export const storageService = {
    uploadFile: async (file: File, bucket = 'marketplace-uploads', folder = 'orders') => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (error) {
                throw error;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (err) {
            console.error('Upload Error:', err);
            throw err;
        }
    }
};
