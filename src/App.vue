<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-12" v-if="!loading">
        <div class="card mb-4" >
          <div class="card-body" >
            <div class="d-flex justify-content-between">
              <h4 class="mb-3">{{ soal[displayedQuestions[0]].soal }}</h4>
              <div>
              <span v-if="timeLimit > 60">{{ Math.floor(timeLimit / 60) }}:{{ timeLimit % 60 }} </span>
              <span v-else>{{ timeLimit }} </span>
            </div>
            </div>
            
            <div v-if="soal[displayedQuestions[0]].tipe === 'pilihan Ganda'">
              <div v-for="option in soal[displayedQuestions[0]].opsi" :key="option.label" class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  :id="'question_' + soal[displayedQuestions[0]].id + '_' + option.label"
                  :name="'question_' + soal[displayedQuestions[0]].id"
                  :value="option.label"
                  v-model="answers[soal[displayedQuestions[0]].id]"
                  @change="saveAnswer(soal[displayedQuestions[0]].id)"
                />
                <label class="form-check-label" :for="'question_' + soal[displayedQuestions[0]].id + '_' + option.label">
                  {{ option.teks }}
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="btn-group" role="group">
          <button type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Loncat ke Soal
          </button>
          <div class="dropdown-menu">
            <a v-for="question in soal" :key="question.id" class="dropdown-item" @click="goToQuestion(question.id)">
              {{ question.id }}
            </a>
          </div>
        </div>
        
        <div class="d-flex justify-content-between mt-3">
          <div>
            <button @click="prevPage" :disabled="currentPage === 0" class="btn btn-primary me-2">
              Kembali
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages - 1" class="btn btn-primary me-2">
              Lewati
            </button>
          </div>
          <div class="btn-group" role="group">
            <button @click="submitAnswers" class="btn btn-success">Kirim Jawaban</button>
          </div>
        </div>
      </div>
      <div v-else>
        <Loading/>  
      </div>
    </div>
  </div>
</template>
<script>
import axios from '@/axios'; // Adjust the path based on your project structure
import Loading from '@/components/Loading.vue'; // Import the Loading component
export default {
  components : {
    Loading
  },
  data() {
    return {
      kuis: 1,
      answers: {},
      currentPage: 0,
      questionsPerPage: 1,
      timeLimit: 3600, // Time limit in seconds
      timer: null, // Timer variable
      soal: [],
      loading:true
    };
  },
  
  computed: {
    displayedQuestions() {
      const start = this.currentPage * this.questionsPerPage;
      const end = start + this.questionsPerPage;
      return Array.from({ length: end - start }, (_, index) => start + index);
    },
    totalPages() {
      return Math.ceil(this.soal.length / this.questionsPerPage);
    },
  },
  methods: {
    submitAnswers() {
      const localStorageKey = `userAnswers_${this.kuis}`;
      const savedAnswers = localStorage.getItem(localStorageKey);
      console.log(savedAnswers);
      alert("Answers submitted and saved to local storage!");
    },
    saveAnswer(questionId) {
      const localStorageKey = `userAnswers_${this.kuis}`;
      const savedAnswers = localStorage.getItem(localStorageKey);
      const updatedAnswers = savedAnswers ? JSON.parse(savedAnswers) : {};
      updatedAnswers[questionId] = this.answers[questionId];
      localStorage.setItem(localStorageKey, JSON.stringify(updatedAnswers));
      console.log(`Question ${questionId} answer: ${this.answers[questionId]}`);
    },
    prevPage() {
      if (this.currentPage > 0) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
      }
    },
    goToQuestion(questionId) {
      const index = this.soal.findIndex((question) => question.id === questionId);
      if (index !== -1) {
        const page = Math.floor(index / this.questionsPerPage);
        this.currentPage = page;
      }
    },
    startTimer() {
      this.timer = setInterval(() => {
        if (this.timeLimit > 0) {
          this.timeLimit--;
        } else {
          this.submitAnswers();
          clearInterval(this.timer);
        }
      }, 1000);
    },
    async getKuis(){
      
      try {
          const data  = {
            id: this.kuis
          }

          const response = await axios.post('pct-kuis',data);
          console.log(response.data.data.soal);
          this.soal = response.data.data.soal;
      } catch (error) {
        
      } finally {
        this.loading = false;
      }

    }
  },
  mounted() {

    this.getKuis()
    const localStorageKey = `userAnswers_${this.kuis}`;
    const savedAnswers = localStorage.getItem(localStorageKey);
    if (savedAnswers) {
      this.answers = JSON.parse(savedAnswers);
    }
    this.startTimer();
  },
  beforeDestroy() {
    // Clear the timer when the component is destroyed
    clearInterval(this.timer);
  },
};
</script>
