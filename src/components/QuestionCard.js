import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export default function QuestionCard({ question, selectedOption, onSelectOption, questionNumber, totalQuestions }) {
  const options = ['a', 'b', 'c', 'd']

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Soal {questionNumber} dari {totalQuestions}</Text>
      <Text style={styles.questionText}>{question.question_text}</Text>

      {options.map((opt) => {
        const optionText = question[`option_${opt}`]
        const isSelected = selectedOption === opt

        return (
          <TouchableOpacity
            key={opt}
            style={[styles.optionCard, isSelected && styles.optionSelected]}
            onPress={() => onSelectOption(opt)}
          >
            <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
              {opt.toUpperCase()}
            </Text>
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
              {optionText}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progress: { textAlign: 'center', color: '#666', marginBottom: 12 },
  questionText: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, padding: 12, marginBottom: 10,
  },
  optionSelected: { backgroundColor: '#1B5E20', borderColor: '#1B5E20' },
  optionLabel: { fontWeight: 'bold', width: 24, color: '#333' },
  optionLabelSelected: { color: '#fff' },
  optionText: { flex: 1, color: '#333' },
  optionTextSelected: { color: '#fff' },
})