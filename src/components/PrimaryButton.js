import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native'

export default function PrimaryButton({ title, onPress, loading = false, disabled = false, variant = 'primary' }) {
  const isOutline = variant === 'outline'
  const isDanger = variant === 'danger'

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isOutline && styles.outlineButton,
        isDanger && styles.dangerButton,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? '#1B5E20' : '#fff'} />
      ) : (
        <Text style={[styles.text, isOutline && styles.outlineText]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1B5E20',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1B5E20',
  },
  dangerButton: {
    backgroundColor: '#c0392b',
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  outlineText: {
    color: '#1B5E20',
  },
})