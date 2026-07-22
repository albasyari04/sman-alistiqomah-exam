import { Alert, Platform } from 'react-native'

// React Native `Alert.alert()` TIDAK diimplementasikan di react-native-web
// (dikonfirmasi oleh tim react-native-web sendiri: "Alert isn't implemented at all").
// Artinya di build web, setiap pemanggilan Alert.alert(...) adalah NO-OP TOTAL:
// tidak ada dialog muncul, dan lebih parah lagi, tombol di dalamnya (termasuk
// tombol yang memicu aksi penting seperti "Simpan Sekarang") TIDAK PERNAH terpanggil.
//
// showAlert() adalah pengganti drop-in untuk Alert.alert() yang aman dipakai di
// semua platform: di Android/iOS tetap pakai Alert.alert asli (native, bagus),
// di web otomatis fallback ke window.alert / window.confirm milik browser.
//
// Cara pakai SAMA PERSIS seperti Alert.alert biasa:
//   showAlert('Judul', 'Pesan')
//   showAlert('Judul', 'Pesan', [{ text: 'OK', onPress: () => {...} }])
//   showAlert('Judul', 'Pesan', [
//     { text: 'Batal', style: 'cancel' },
//     { text: 'Lanjut', onPress: () => {...} },
//   ])
export function showAlert(title, message, buttons) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons)
    return
  }

  const fullMessage = message ? `${title}\n\n${message}` : title

  // Tidak ada tombol custom / hanya 1 tombol -> cukup window.alert (tombol OK bawaan browser)
  if (!buttons || buttons.length <= 1) {
    window.alert(fullMessage)
    if (buttons && buttons[0] && typeof buttons[0].onPress === 'function') {
      buttons[0].onPress()
    }
    return
  }

  // Lebih dari 1 tombol -> window.confirm (OK/Cancel bawaan browser).
  // Tombol dengan style 'cancel' dianggap sebagai tombol "Cancel" di dialog;
  // tombol lainnya (biasanya yang menjalankan aksi utama) dianggap tombol "OK".
  const cancelButton = buttons.find((b) => b.style === 'cancel')
  const confirmButton = buttons.find((b) => b.style !== 'cancel') || buttons[buttons.length - 1]

  const confirmed = window.confirm(fullMessage)
  if (confirmed) {
    if (confirmButton && typeof confirmButton.onPress === 'function') confirmButton.onPress()
  } else {
    if (cancelButton && typeof cancelButton.onPress === 'function') cancelButton.onPress()
  }
}