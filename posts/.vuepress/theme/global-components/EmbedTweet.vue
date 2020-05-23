<template>
  <figure>
    <Tweet :id="id" />
    <figcaption>{{ caption }}</figcaption>
  </figure>
</template>

<script>
import { Tweet } from 'vue-tweet-embed/dist'

export default {
  components: {
    Tweet
  },

  props: [
    'id',
    'caption',
  ]
}
</script>
