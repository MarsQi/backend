<template>
  <div id="app">    
      <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
    };
  },
};
</script>

<style lang="less" scoped>
  #app{
    height: 100%;
    width: 100%;
  }
</style>
