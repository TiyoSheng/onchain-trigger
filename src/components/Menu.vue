<template>
  <div class="menu">
    <div v-for="(item, index) in triggerList" :key="index" :class="['menu-item', 'flex-center', formValue.id == item.id ? 'menu-item-a' : '']" @click="selectTriggrt(item)">{{item.name}}</div>
    <div class="menu-item flex-center" @click="showAddTrigger">
      <svg t="1675055009990" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2701" width="18" height="18"><path d="M512 832a32 32 0 0 0 32-32v-256h256a32 32 0 0 0 0-64h-256V224a32 32 0 0 0-64 0v256H224a32 32 0 0 0 0 64h256v256a32 32 0 0 0 32 32" fill="#3E3A39" p-id="2702"></path></svg>
      新增
    </div>
    <AddTrigger ref="addTrigger" />
  </div>
</template>
<script>
import AddTrigger from './AddTrigger.vue'
import { useStore } from 'vuex'
import { computed, ref } from 'vue'
export default {
  components: {
    AddTrigger
  },
  setup() {
    const store = useStore()
    const addTrigger = ref(null)
    const triggerList = computed(() => {
      return store.state.triggerList
    })
    const showAddTrigger = () => {
      addTrigger.value.showModal = true
    }
    const formValue = computed(() => {
      return store.state.activateTrigger || {}
    })
    const selectTriggrt = (item) => {
      store.commit('setActivateTrigger', item)
    }
    return {
      formValue,
      triggerList,
      addTrigger,
      selectTriggrt,
      showAddTrigger
    }
  },
}
</script>
<style lang="scss" scoped>
.menu {
  flex: 0 0 180px;
  width: 180px;
  height: 100vh;
  padding: 24px 24px 10px;
  box-sizing: border-box;
  border-right: 1px solid rgba(133, 141, 153, 0.1);
  .menu-item {
    height: 30px;
    cursor: pointer;
    padding: 0 12px;
    box-sizing: content-box;
    width: 100%;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    box-sizing: border-box;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    svg {
      margin-right: 4px;
    }
    &:hover {
      background: rgba(133, 141, 153, 0.1);
      border-radius: 4px;
    }
    &.menu-item-a {
      background: rgba(133, 141, 153, 0.2);
      border-radius: 4px;
    }
  }
}
</style>