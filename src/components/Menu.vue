<template>
  <div class="menu">
    <div v-for="(item, index) in triggerList" :key="index" :class="['menu-item', 'flex-center-sb', activatedId == item.id ? 'menu-item-a' : '']" @click="selectTriggrt(item.id)">
      <span>{{item.name}}</span>
      <n-popconfirm :show-icon="false" positive-text="确认" negative-text="取消" @positiveClick.stop="del(index)">
        <template #trigger>
          <svg t="1675512681148" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2711" width="18" height="18"><path d="M789.333333 343.466667c-12.8 0-21.333333 8.533333-21.333333 21.333333v490.666667c0 23.466667-19.2 42.666667-42.666667 42.666666H298.666667c-23.466667 0-42.666667-19.2-42.666667-42.666666V362.666667c0-12.8-8.533333-21.333333-21.333333-21.333334s-21.333333 8.533333-21.333334 21.333334v490.666666c0 46.933333 38.4 85.333333 85.333334 85.333334h426.666666c46.933333 0 85.333333-38.4 85.333334-85.333334V362.666667c0-10.666667-10.666667-19.2-21.333334-19.2zM915.2 234.666667H746.666667V170.666667c0-46.933333-38.4-85.333333-85.333334-85.333334H362.666667c-46.933333 0-85.333333 38.4-85.333334 85.333334v64H106.666667c-12.8 0-21.333333 8.533333-21.333334 21.333333s8.533333 21.333333 21.333334 21.333333h808.533333c12.8 0 21.333333-8.533333 21.333333-21.333333s-8.533333-21.333333-21.333333-21.333333zM320 170.666667c0-23.466667 19.2-42.666667 42.666667-42.666667h298.666666c23.466667 0 42.666667 19.2 42.666667 42.666667v64H320V170.666667z" fill="#666666" p-id="2712"></path><path d="M640 704V364.8c0-12.8-8.533333-21.333333-21.333333-21.333333s-21.333333 8.533333-21.333334 21.333333V704c0 12.8 8.533333 21.333333 21.333334 21.333333s21.333333-10.666667 21.333333-21.333333zM426.666667 704V362.666667c0-12.8-8.533333-21.333333-21.333334-21.333334s-21.333333 8.533333-21.333333 21.333334v341.333333c0 12.8 8.533333 21.333333 21.333333 21.333333s21.333333-10.666667 21.333334-21.333333z" fill="#666666" p-id="2713"></path></svg>
        </template>
        <p style="margin: 10px 0">是否确认删除{{item.name}}?</p>
      </n-popconfirm>
    </div>
    <div class="menu-item flex-center" @click="showAddTrigger">
      <svg t="1675055009990" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2701" width="18" height="18"><path d="M512 832a32 32 0 0 0 32-32v-256h256a32 32 0 0 0 0-64h-256V224a32 32 0 0 0-64 0v256H224a32 32 0 0 0 0 64h256v256a32 32 0 0 0 32 32" fill="#3E3A39" p-id="2702"></path></svg>
      新增
    </div>
    <AddTrigger ref="addTrigger" />
  </div>
</template>
<script>
import AddTrigger from './AddTrigger.vue'
import { useStore } from 'vuex'
import { setLs } from '@/service/service'
import { computed, ref, watch, toRaw } from 'vue'
export default {
  components: {
    AddTrigger
  },
  setup() {
    const store = useStore()
    const triggerData = ref({})
    const addTrigger = ref(null)
    const activatedId = computed(() => {
      return store.state.activatedId || ''
    })
    const triggerList = computed(() => {
      return store.state.triggerList || []
    })
    const showAddTrigger = () => {
      addTrigger.value.showModal = true
    }
    const selectTriggrt = (id) => {
      console.log(id)
      setLs('activatedId', id).then(() => {
        store.commit('setActivatedId', id)
      })
    }
    const del = (index) => {
      console.log(index, triggerList.value)
      triggerList.value.splice(index, 1)
      setLs('triggers', JSON.parse(JSON.stringify(toRaw(triggerList.value)))).then((res) => {
        store.commit('setTriggers', res)
        let id = res[0].id
        selectTriggrt(id)
      })
    }
    watch(() => activatedId.value, async () => {
      triggerList.value.forEach(e => {
        if (e.id == activatedId.value) {
          triggerData.value = e
        }
      })
    }, {immediate: true})
    return {
      triggerData,
      triggerList,
      addTrigger,
      activatedId,
      selectTriggrt,
      showAddTrigger,
      del
    }
  },
}
</script>
<style lang="scss" scoped>
.menu {
  flex: 0 0 180px;
  width: 180px;
  height: 100vh;
  padding: 24px 24px;
  box-sizing: border-box;
  border-right: 1px solid rgba(133, 141, 153, 0.1);
  background: #ffffff;
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
      width: 16px;
      height: 16px;
    }
    .icon {
      display: none;
    }
    &:hover {
      background: rgba(133, 141, 153, 0.1);
      border-radius: 4px;
      .icon {
        display: flex;
      }
    }
    &.menu-item-a {
      background: rgba(133, 141, 153, 0.2);
      border-radius: 4px;
      .icon {
        display: flex;
      }
    }
  }
}
</style>