<template>
  <footer class="footer">
    <p>
      © {{ thisYear }} · {{ author }} · <a href="https://github.com/nicolasbeauvais">GitHub</a> · <a href="https://twitter.com/w3Nicolas">Twitter</a>
    </p>
  </footer>
</template>

<script>
export default {
  computed: {
    thisYear() {
      return new Date().getFullYear();
    },
    author() {
      return this.$themeConfig.author || '';
    },
  }
}
</script>
