import * as FileSystem from 'expo-file-system/legacy'
import { decode } from 'base64-arraybuffer'
import { supabase } from '../lib/supabase'

/**
 * Upload foto profil ke Supabase Storage bucket 'avatars',
 * lalu update kolom avatar_url di tabel profiles.
 * Path foto: {userId}/avatar.jpg (upsert, jadi selalu menimpa foto lama)
 */
export async function uploadAvatar(userId, imageSource, options = {}) {
  try {
    let fileData

    if (options.base64 || options.isBase64) {
      fileData = decode(imageSource)
    } else if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
      const base64 = imageSource.split(',')[1]
      fileData = decode(base64)
    } else {
      const base64 = await FileSystem.readAsStringAsync(imageSource, {
        encoding: FileSystem.EncodingType.Base64,
      })
      // Decode base64 langsung ke ArrayBuffer (TANPA fetch/Blob).
      // fetch(dataURI).blob() tidak reliable di React Native untuk file
      // berukuran besar dan sering gagal dengan "Network request failed".
      fileData = decode(base64)
    }

    const filePath = `${userId}/avatar.jpg`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileData, { contentType: 'image/jpeg', upsert: true })

    if (uploadError) return { data: null, error: uploadError }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
    // Tambahkan timestamp supaya cache gambar di HP tidak nyangkut ke foto lama
    const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`

    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}