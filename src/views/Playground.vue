<script setup>
import { ref, onBeforeMount } from 'vue'
import Nav from '../components/Nav.vue'
import { useRouter } from 'vue-router'
import { getPlayground } from '../http/api'

const router = useRouter()

const triggerList = ref([])
const showSpin = ref(false)

onBeforeMount(async () => {
  showSpin.value = true
  const res = await getPlayground()
  triggerList.value = res.trigger_list
  showSpin.value = false
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
      <n-spin :show="showSpin">
        <div class="title">Select a template.</div>
        <div class="sub-title">Jumpstart your trigger with our pre-built solutions.</div>
        <n-grid :x-gap="14" :y-gap="8" :cols="4">
          <n-grid-item v-for="item in triggerList" :key="item.trigger_id">
            <div class="card" @click="getTrigger(item.trigger_id)">
              <div class="cover-img">
                <img v-if="item.cover" :src="item.cover" alt="">
                <div v-else class="cover flex-center-center">Trigger</div>
              </div>
              <div class="card-title">{{ item.name }}</div>
              <p class="card-note">{{ item.note }}</p>
            </div>
          </n-grid-item>
        </n-grid>
      </n-spin>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.playground {
  height: 100vh;
}

.content {
  padding: 24px;
  box-sizing: border-box;
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 1298px;
  margin: auto;

  .title {
    font-size: 40px;
    font-weight: 600;
    color: #000;
  }

  .sub-title {
    font-size: 14px;
    line-height: 16px;
    color: #9BA0A8;
    margin-bottom: 96px;
    margin-top: 8px;
  }

  .card {
    border: 1px solid rgb(239, 239, 245);
    border-radius: 8px;
    box-sizing: border-box;
    font-size: 0;
    padding-bottom: 24px;
    box-sizing: border-box;
    cursor: pointer;

    &:hover {
      box-shadow: 0 8px 30px rgba(0, 0, 0, .12);
    }

    .cover-img {
      width: 100%;
      height: 180px;
      overflow: hidden;
      border-radius: 8px 8px 0 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #000;
        color: #FFF;
        font-size: 36px;
      }
    }

    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: #000;
      margin-top: 24px;
      padding-left: 16px;
      padding-right: 16px;
      box-sizing: border-box;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-note {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      font-size: 12px;
      color: #9BA0A8;
      margin-top: 12px;
      padding-left: 16px;
      padding-right: 16px;
    }
  }
}</style>