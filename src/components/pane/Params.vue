<script setup>
import { ref, watch } from 'vue'
import AddParams from '../form/AddParams.vue'

const props = defineProps({
  params: Array
})

const emit = defineEmits(['setParams'])

const addParamsRef = ref(null)
const params = ref([])

const showModal = () => {
  addParamsRef.value.showAddModal = true
}
const handleOk = (val) => {
  emit('setParams', val)
}

const setParams = (val) => {
  emit('setParams', params.value)
}

watch(() => props.params, (val) => {
  params.value = val || []
}, {immediate: true})
</script>
<template>
  <div class="prams">
    <div class="card" v-if="params && params.length">
      <div class="flex-center-sb params-hd">
        <div class="flex-center">
          <p>变量名称</p>
          <p>值</p>
        </div>
        <div class="flex-center" @click="showModal">
          <div class="edit-btn">编辑</div>
        </div>
      </div>
      <div class="params">
        <div v-for="(item, index) in params" :key="index">
          <div class="params-item flex-center">
            <div class="params-item-key flex-center-center">{{item.key}}</div>
            <div class="params-item-value flex-center-center">
              <n-input v-model:value="item.value" class="input" @blur="setParams" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="btn" @click="showModal">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8H13" stroke="#2152EC" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 13L8 3" stroke="#2152EC" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      设置全局变量
    </div>
    <AddParams ref="addParamsRef" @handleOk="handleOk" />
  </div>
</template>

<style lang="scss" scoped>
.prams {
  padding: 16px;
  box-sizing: border-box;
  min-height: 72px;
  .params-hd {
    p {
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: #4C4F53;
      &:first-child {
        width: 130px;
      }
    }
    .edit-btn {
      font-size: 12px;
      line-height: 16px;
      color: #4C4F53;
      cursor: pointer;
    }
  }
  .params-item {
    height: 40px;
    margin-top: 12px;
    .params-item-key {
      background: #F8F9FA;
      width: 130px;
      height: 40px;
      border-width: 1px 0px 1px 1px;
      border-style: solid;
      border-color: #E5E7EB;
      border-radius: 6px 0px 0px 6px;
      box-sizing: border-box;
      font-size: 13px;
      line-height: 16px;
      color: #9BA0A8;
    }
    .params-item-value {
      flex: 1;
      .input {
        width: 100%;
        height: 40px;
        background: #FFFFFF;
        border-radius: 0px 6px 6px 0px;
        box-sizing: border-box;
        font-size: 13px;
        color: #262C33;
      }
    }
  }
}
.mt12 {
  margin-top: 12px;
}
</style>