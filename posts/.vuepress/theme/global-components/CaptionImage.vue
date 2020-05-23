<template>
  <figure>
    <img
      :src="src"
      :alt="alt"
    />
    <figcaption>{{ caption }}</figcaption>
  </figure>
</template>

<script>
export default {
  props: [
    'src',
    'alt',
    'caption'
  ],
}
</script>
