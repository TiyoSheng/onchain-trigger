<script setup>
import { ref, watch } from 'vue'
import Params from './pane/Params.vue'
import Functions from './pane/Functions.vue'
import Flows from './pane/Flows.vue'
import Triggers from './pane/Triggers.vue'

const props = defineProps({
  trigger: Object
})
const emit = defineEmits(['setTrigger'])

const triggerData = ref({})
const tabIndex = ref(0)
const tabs = [
  {label: '全局变量', name: 'globalParams'},
  {label: '流程', name: 'flows'},
  {label: '附加函数', name: 'functions'},
  {label: '触发器', name: 'triggers'}
]

const setTrigger = () => {
  emit('setTrigger', triggerData.value)
}

const setMessage = (msg) => {
  console.log(msg)
  if (!triggerData.value.messages) {
    triggerData.value.messages = []
  }
  triggerData.value.messages.push(msg)
  setTrigger()
}

const setParams = (params) => {
  triggerData.value.globalParams = params
  setTrigger()
}

const setFunctions = (functions) => {
  triggerData.value.functions = functions
  setTrigger()
}

const setTriggers = (triggers) => {
  triggerData.value.triggers = triggers
  setTrigger()
}

const setFlows = (flows) => {
  triggerData.value.flows = flows
  setTrigger()
}

watch(() => props.trigger, (val) => {
  triggerData.value = val
}, {immediate: true})
</script>
<template>
  <div class="tabs">
    <div class="tab-hd-w">
      <div class="tab-hd flex-center">
        <div v-for="(item, index) in tabs" :key="index" class="tab-item flex-center-center" :class="[index == tabIndex - 1 ? 'tab-item-active-pre' : '', index == tabIndex ? 'tab-item-actived' : '']" @click="tabIndex = index">{{item.label}} ({{triggerData[item.name].length}})</div>
      </div>
    </div>
    <div class="tab-pane">
      <div v-if="tabIndex == 0">
        <Params :params="triggerData.globalParams" @setParams="setParams" />
      </div>
      <div v-if="tabIndex == 1">
        <Flows 
          :triggerId="triggerData.id"
          @setFlows="setFlows"
          @setMessage="setMessage"
        />
      </div>
      <div v-if="tabIndex == 2">
        <Functions
          :triggerId="triggerData.id"
          @setFunctions="setFunctions"
          @setMessage="setMessage"
        />
      </div>
      <div v-if="tabIndex == 3">
        <Triggers :triggerId="triggerData.id" @setTrigger="setTriggers" @setMessage="setMessage" />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.tabs {
  margin-top: 24px;
  .tab-hd-w {
    display: inline-block;
    border: 1px solid #D9D9D9;
    border-bottom-width: 0;
    border-radius: 8px 8px 0 0;
    box-sizing: border-box;
    height: 40px;
    background: linear-gradient(180deg, #F8F9FA 0%, #fff 70%);
  }
  .tab-hd {
    height: 100%;
    .tab-item {
      width: 130px;
      height: 100%;
      background: #F8F9FA;
      font-weight: 400;
      font-size: 13px;
      line-height: 16px;
      color: #9BA0A8;
      box-sizing: border-box;
      cursor: pointer;
      & ~ .tab-item {
        position: relative;
        &::after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          width: 1px;
          height: 12px;
          background: #E5E7EB;
        }
      }
      &:first-child {
        border-top-left-radius: 8px;
        border-bottom-left-radius: 0px !important;
      }
      &:last-child {
        border-top-right-radius: 8px;
        border-bottom-right-radius: 0px !important;
      }
      &.tab-item-actived {
        background: #FFFFFF;
        color: #262C33;
        border-radius: 10px;
        position: relative;
        &::after {
          display: none;
        }
        & + .tab-item {
          border-bottom-left-radius: 8px;
          &::after {
            display: none;
          }
        }
      }
      &.tab-item-active-pre {
        border-bottom-right-radius: 8px;
      }
    }
  }
  .tab-pane {
    box-sizing: border-box;
    width: 100%;
    background: #fff;
    border: 1px solid #D9D9D9;
    border-radius: 0px 8px 8px 8px;
    margin-top: -1px;
  }
}
</style>