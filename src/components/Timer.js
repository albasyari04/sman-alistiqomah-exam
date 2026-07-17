import { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function Timer({ durationMinutes, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isWarning = secondsLeft <= 60

  return (
    <View style={[styles.container, isWarning && styles.warning]}>
      <Text style={[styles.text, isWarning && styles.warningText]}>
        ⏱ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1B5E20', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'center' },
  warning: { backgroundColor: '#c0392b' },
  text: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  warningText: { color: '#fff' },
})