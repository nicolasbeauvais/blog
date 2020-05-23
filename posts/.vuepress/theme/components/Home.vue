<template>
  <div class="list-view">
    <div
      v-if="filteredList.length === 0"
      class="empty-list"
    >
      Ooops! Nothing here..🙈
    </div>
    <ol
      v-else
      class="list"
    >
      <li
        v-for="page of filteredList"
        :key="page.key"
        class="list-item"
      >
        <router-link :to="page.path">
          <h3 class="item-title">{{ page.title }}</h3>
          <p>{{ page.frontmatter.excerpt }}</p>
          <time :datetime="new Date(page.frontmatter.date)">
            {{ (new Date(page.frontmatter.date)).toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' }) }}
          </time>
        </router-link>
      </li>
    </ol>
  </div>
</template>

<script>
export default {
  computed: {
    filteredList() {
      // Order by publish date, desc
      return this.$site.pages
        .filter(item => item.path !== '/')
        .sort((a, b) => {
          return new Date(b.frontmatter.date || b.lastUpdated) - new Date(a.frontmatter.date || a.lastUpdated)
        })
    }
  },
}
</script>
