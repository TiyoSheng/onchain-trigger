<script setup>
import { ref, onBeforeMount } from 'vue'
import Nav from '../components/Nav.vue'
import { useRouter } from 'vue-router'
import { getPlayground } from '../http/api'

const router = useRouter()

const triggerList = ref([])

onBeforeMount(async () => {
  const res = await getPlayground()
  triggerList.value = res.trigger_list
  console.log(res)
})

const getTrigger = (id) => {
  router.push(`/${id}`)
}

</script>
<template>
  <div class="playground">
    <Nav />
    <div class="content">
      <n-grid :x-gap="12" :y-gap="8" :cols="5">
        <n-grid-item v-for="item in triggerList" :key="item.trigger_id">
          <n-card :title="item.name" hoverable @click="getTrigger(item.trigger_id)">
            <p class="note">{{item.note}}</p>
          </n-card>
        </n-grid-item>
      </n-grid>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.content {
  padding: 24px;
  box-sizing: border-box;
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  .n-card {
    height: 116px;
    cursor: pointer;
  }
  .note {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>