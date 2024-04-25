<template>
  <div id="erro">
    <div class="container">
      <svg-icon type="mdi" :path="mdiEmoticonCryOutline"></svg-icon>
      <h2>Esta página não existe.
        <router-link to="/">Ir para o início</router-link>
      </h2>
    </div>
  </div>
</template>

<script>
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiEmoticonCryOutline } from '@mdi/js';

export default {
  name: 'Erro_page',
  data() {
    return {
      mdiEmoticonCryOutline,
    }
  },
  components: {
    SvgIcon
  }
}
</script>

<style scoped>
.container {
  margin-top: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
}

.container svg {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

.container h2 {
  margin-top: 20px;
}

.container a {
  margin-left: 10px;
  color: #0059b3;
}

.container a:hover {
  opacity: 0.5;
  transition: all 0.3s;
  color: #000;
}

.container a:active {
  color: #400080;
}
</style>