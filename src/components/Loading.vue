<!-- Loading.vue -->
<template>
<div class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading...</p>
</div>
</template>

<script>
export default {
// You can add props or other options here if needed
};
</script>

<style scoped>
.loading-container {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
height: 100vh;
z-index: 1000 !important;
}

.loading-spinner {
border: 4px solid rgba(0, 0, 0, 0.1);
border-top: 4px solid #3498db;
border-radius: 50%;
width: 40px;
height: 40px;
animation: spin 1s linear infinite;
margin-bottom: 16px;
}

@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}

/* Add your additional styling here if needed */
</style>
