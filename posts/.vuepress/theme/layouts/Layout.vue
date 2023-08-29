<template>
  <div class="theme-container vuepress-theme-simple">
    <header class="header">
      <router-link
        to="/"
        :title="$description"
      >
        <h2 class="site-name">{{ $site.title }}</h2>
        <h4 class="site-subtitle">{{ $site.description }}</h4>
      </router-link>

      <p>Support my work with <a href="https://phare.io/">Phare website monitoring</a>.</p>

      <div style="clear: both" />
      <nav-bar />
    </header>
    <home-page v-if="isHome" />
    <post-page v-else />
    <footer-bar />
  </div>
</template>

<script>
import HomePage from "../components/Home";
import PostPage from "../components/Post";
import FooterBar from '../components/FooterBar';
import NavBar from '../components/NavBar';

export default {
  components: {
    HomePage,
    PostPage,
    FooterBar,
    NavBar,
  },
  computed: {
    isHome() {
      return this.$page.path === '/';
    }
  }
};
</script>
