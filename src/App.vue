<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-12" v-if="!loading">
        <div v-if="hasil">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">Hasil Ujian:</h3>
              <p class="card-text">Nama: {{ hasil.nama }}</p>
              <p class="card-text">Nomor WA: {{ hasil.wa }}</p>
              <p class="card-text">Sosmed: {{ hasil.sosmed }}</p>
              <p class="card-text">Asal Sekolah: {{ hasil.sekolah }}</p>
              <p class="card-text">Program Studi Pilihan: {{ hasil.prodi }}</p>
              
              <p class="card-text">Nilai: {{ hasil.nilai }}</p>

              <hr>
              <div class="alert alert-info"> Anda akan segera dihubungi untuk melanjutkan proses beasiswa</div>
            </div>
          </div>
        </div>

        <div v-else>
          <div class="mb-3" v-if="!examStarted">
            <form @submit.prevent="startExam">
              <label for="name" class="form-label">Nama:</label> 
              <input type="text" @input="validateName" class="form-control" id="name" v-model="name" placeholder="Ketik nama Anda di sini" required />
              <div v-if="nameError" class="text-danger">{{ nameError }}</div>

              <label for="phoneNumber" class="form-label">Nomor WA:</label>
              <input type="text" @input="validatePhoneNumber" class="form-control" id="phoneNumber" v-model="phoneNumber" placeholder="ketik nomor whatsapp di sini" required />
              <div v-if="phoneNumberError" class="text-danger">{{ phoneNumberError }}</div>

              <label for="sosmed" class="form-label">Tiktok / Instragram :</label>
              <input type="text" class="form-control" id="sosmed" v-model="sosmed" placeholder="Ketik username sosmed Anda di sini" required />

              <label for="sekolahSelected" class="form-label">Asal Sekolah</label>
              <select class="form-control" id="sekolahSelected" v-model="sekolahSelected" required>
                <option value="">Silahkan pilih</option>
                <option v-for="x in sekolah" :value="x.nama">{{ x.nama }}</option>
              </select>

              <label for="jurusanSelected" class="form-label">Program Studi Pilihan</label>
              <select class="form-control" id="jurusanSelected" v-model="jurusanSelected" required>
                <option value="">Silahkan pilih</option>
                <option v-for="x in jurusan" :value="x.nama">{{ x.nama }}</option>
              </select>

              <!-- Display button only if exam has not started -->
              <div class=" mt-3">
                <div>
                  <button type="submit" class="btn btn-primary w-100">
                    Mulai Ujian
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          <div v-else>

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
                <a v-for="(question, index) in soal" :key="question.id" class="dropdown-item" @click="goToQuestion(question.id)">
                  Soal {{ index + 1 }} - Jawaban: {{ answers[question.id] || 'Belum dijawab' }}
                </a>
              </div>
            </div>
            
            <div class="d-flex justify-content-between mt-3">
              <div>
                <button @click="prevPage" :disabled="currentPage === 0" class="btn btn-primary me-2">
                  Kembali
                </button>
                <button @click="nextPage" :disabled="currentPage === totalPages - 1" class="btn btn-primary me-2">
                  Selanjutnya
                </button>
              </div>
              <div class="btn-group" role="group">
                <button @click="submitAnswers" class="btn btn-success">Kirim Jawaban</button>
              </div>
            </div>

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
      loading:true,
      name: '',           // New data property for name
      phoneNumber: '',    // New data property for phone number
      examStarted: false, // New data property to track if the exam has started
      sekolah:null,
      sekolahSelected:'',
      jurusan:null,
      jurusanSelected:'',
      sosmed:null,
      nameError: null,
      phoneNumberError: null,
      hasil:null,
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
    async submitAnswers() {
      try {
        this.loading = true;
        const localStorageKey = `userAnswers_${this.kuis}`;
        const savedAnswers = localStorage.getItem(localStorageKey);
        const data = {
          jawaban : savedAnswers,
          kuis:this.kuis,
          nama:this.name,
          wa:this.phoneNumber,
          sosmed:this.sosmed,
          sekolah:this.sekolahSelected,
          prodi:this.jurusanSelected
        }
        // console.log(data);
        const response = await axios.post('pct-kuis-submit',data);
        this.hasil  = response.data.data
        // console.log(this.hasil.nama);
        clearInterval(this.timer); // Clear the timer when the result is available
      } catch (error) {
        
      }finally{
        
        this.loading = false;

      }
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
          this.sekolah = response.data.sekolah;
          this.jurusan = response.data.prodi;
      } catch (error) {
        
      } finally {
        this.loading = false;
      }

    },
    startExam() {
      // Check if name and phone number are provided
      if (!this.validateName() || !this.validatePhoneNumber()) {
        // alert('Please provide your name and phone number before starting the exam.');
        return;
      }

      // Update the state to indicate that the exam has started
      this.examStarted = true;

      // Rest of your existing code to start the exam
      // You may want to store name and phone number in localStorage or somewhere else
      // for future reference or analysis.
    },

    validateName() {
      if (!this.name || this.name.length < 3) {
        this.nameError = 'Nama harus terdiri dari minimal 3 karakter.';
        return false;
      } else {
        this.nameError = null;
        return true;
      }
    },

    validatePhoneNumber() {
      const phoneNumberRegex = /^08\d{9,}$/;
      if (!this.phoneNumber || !phoneNumberRegex.test(this.phoneNumber)) {
        this.phoneNumberError = 'Nomor WA harus diisi dan berformat 08xxxxxxxxxx.';
        return false;
      } else {
        this.phoneNumberError = null;
        return true;
      }
    },
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
