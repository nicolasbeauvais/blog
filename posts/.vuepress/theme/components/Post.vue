<template>
  <section class="post-view">
    <div class="post-head">
      <h1 class="post-title">
        {{ $page.title }}
      </h1>
      <time>{{ (new Date($page.frontmatter.date)).toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' }) }}</time>
    </div>
    <Content />

    <Disqus />
  </section>
</template>

<script>
export default {

}
</script>
