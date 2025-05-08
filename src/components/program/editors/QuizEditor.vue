<template>
  <div class="quiz-editor">
    <div class="form-group">
      <label>Quiz Title</label>
      <input
        v-model="quiz.title"
        type="text"
        class="form-control"
        placeholder="Enter quiz title"
        @input="updateContent"
      />
    </div>

    <div class="form-group">
      <label>Description</label>
      <textarea
        v-model="quiz.description"
        class="form-control"
        rows="3"
        placeholder="Enter quiz description"
        @input="updateContent"
      ></textarea>
    </div>

    <div class="form-group">
      <label>Questions</label>
      <div v-for="(question, index) in quiz.questions" :key="question.id" class="question-item">
        <div class="question-header">
          <h4>Question {{ index + 1 }}</h4>
          <button class="btn btn-danger" @click="removeQuestion(index)">Remove</button>
        </div>

        <div class="form-group">
          <label>Question Text</label>
          <input
            v-model="question.question"
            type="text"
            class="form-control"
            placeholder="Enter question text"
            @input="updateContent"
          />
        </div>

        <div class="form-group">
          <label>Question Type</label>
          <select
            v-model="question.type"
            class="form-control"
            @change="handleQuestionTypeChange(question)"
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="true-false">True/False</option>
            <option value="short-answer">Short Answer</option>
          </select>
        </div>

        <!-- Multiple Choice Options -->
        <div v-if="question.type === 'multiple-choice'" class="form-group">
          <label>Options</label>
          <div
            v-for="(option, optionIndex) in question.options"
            :key="optionIndex"
            class="option-item"
          >
            <div class="option-input">
              <input
                v-model="question.options[optionIndex]"
                type="text"
                class="form-control"
                :placeholder="`Option ${optionIndex + 1}`"
                @input="updateContent"
              />
              <button class="btn btn-danger" @click="removeOption(question, optionIndex)">
                Remove
              </button>
            </div>
            <div class="option-correct">
              <label>
                <input
                  type="radio"
                  :name="'correct-' + question.id"
                  :value="optionIndex"
                  v-model="question.correctAnswer"
                  @change="updateContent"
                />
                Correct Answer
              </label>
            </div>
          </div>
          <button class="btn btn-secondary" @click="addOption(question)">Add Option</button>
        </div>

        <!-- True/False Options -->
        <div v-if="question.type === 'true-false'" class="form-group">
          <label>Correct Answer</label>
          <select v-model="question.correctAnswer" class="form-control" @change="updateContent">
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>

        <!-- Short Answer -->
        <div v-if="question.type === 'short-answer'" class="form-group">
          <label>Correct Answer</label>
          <input
            v-model="question.correctAnswer"
            type="text"
            class="form-control"
            placeholder="Enter correct answer"
            @input="updateContent"
          />
        </div>

        <div class="form-group">
          <label>Explanation</label>
          <textarea
            v-model="question.explanation"
            class="form-control"
            rows="2"
            placeholder="Enter explanation for the correct answer"
            @input="updateContent"
          ></textarea>
        </div>
      </div>

      <button class="btn btn-primary" @click="addQuestion">Add Question</button>
    </div>

    <div class="form-group">
      <label>Passing Score (%)</label>
      <input
        v-model.number="quiz.passingScore"
        type="number"
        class="form-control"
        min="0"
        max="100"
        @input="updateContent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Quiz, QuizQuestion } from '../../../types/program';

const props = defineProps<{
  modelValue: Quiz;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Quiz): void;
}>();

const quiz = ref<Quiz>({
  id: props.modelValue.id,
  title: props.modelValue.title,
  description: props.modelValue.description,
  questions: [...props.modelValue.questions],
  passingScore: props.modelValue.passingScore,
});

watch(
  () => props.modelValue,
  newValue => {
    quiz.value = {
      id: newValue.id,
      title: newValue.title,
      description: newValue.description,
      questions: [...newValue.questions],
      passingScore: newValue.passingScore,
    };
  }
);

const updateContent = () => {
  emit('update:modelValue', { ...quiz.value });
};

const addQuestion = () => {
  const newQuestion: QuizQuestion = {
    id: crypto.randomUUID(),
    question: '',
    type: 'multiple-choice',
    options: [''],
    correctAnswer: '',
    explanation: '',
  };
  quiz.value.questions.push(newQuestion);
  updateContent();
};

const removeQuestion = (index: number) => {
  quiz.value.questions.splice(index, 1);
  updateContent();
};

const handleQuestionTypeChange = (question: QuizQuestion) => {
  switch (question.type) {
    case 'multiple-choice':
      question.options = ['', ''];
      question.correctAnswer = '';
      break;
    case 'true-false':
      question.options = undefined;
      question.correctAnswer = 'true';
      break;
    case 'short-answer':
      question.options = undefined;
      question.correctAnswer = '';
      break;
  }
  updateContent();
};

const addOption = (question: QuizQuestion) => {
  if (!question.options) {
    question.options = [];
  }
  question.options.push('');
  updateContent();
};

const removeOption = (question: QuizQuestion, index: number) => {
  if (question.options) {
    question.options.splice(index, 1);
    if (question.options.length === 0) {
      question.options.push('');
    }
    updateContent();
  }
};
</script>

<style scoped>
.quiz-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.question-item {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.option-item {
  margin-bottom: 0.5rem;
}

.option-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.option-correct {
  margin-left: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}
</style>
