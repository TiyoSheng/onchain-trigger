<script setup>
import { ref, watch } from 'vue'
import Params from './pane/Params.vue'
import Functions from './pane/Functions.vue'
import Flows from './pane/Flows.vue'
import Triggers from './pane/Triggers.vue'
import EditRemark from './form/EditRemark.vue'

const props = defineProps({
  trigger: Object
})
const emit = defineEmits(['setTrigger'])

const triggerData = ref({})
const editRemarkRef = ref(null)
const tabIndex = ref(0)
const tabs = [
  {label: '全局变量', name: 'globalParams'},
  {label: '流程', name: 'flows'},
  {label: '附加函数', name: 'functions'},
  {label: '触发器', name: 'triggers'}
]

const getName = () => {
  if (tabIndex.value === 0) {
    return '全局变量'
  } else if (tabIndex.value === 1) {
    return '流程'
  } else if (tabIndex.value === 2) {
    return '附加函数'
  } else if (tabIndex.value === 3) {
    return '触发器'
  }
}

const getRemark = () => {
  if (tabIndex.value === 0) {
    return triggerData.value.remark.params
  } else if (tabIndex.value === 1) {
    return triggerData.value.remark.flows
  } else if (tabIndex.value === 2) {
    return triggerData.value.remark.functions
  } else if (tabIndex.value === 3) {
    return triggerData.value.remark.triggers
  } else {
    return ''
  }
}

const showEditRemark = () => {
  console.log('showEditRemark', editRemarkRef.value)
  if (tabIndex.value == 0) {
    editRemarkRef.value.modalType = 'params'
    editRemarkRef.value.modalTitle = '全局变量备注'
    editRemarkRef.value.text = triggerData.value.remark.params
  } else if (tabIndex.value == 1) {
    editRemarkRef.value.modalType = 'flows'
    editRemarkRef.value.modalTitle = '流程备注'
    editRemarkRef.value.text = triggerData.value.remark.flows
  } else if (tabIndex.value == 2) {
    editRemarkRef.value.modalType = 'functions'
    editRemarkRef.value.modalTitle = '附加函数备注'
    editRemarkRef.value.text = triggerData.value.remark.functions
  } else if (tabIndex.value == 3) {
    editRemarkRef.value.modalType = 'triggers'
    editRemarkRef.value.modalTitle = '触发器备注'
    editRemarkRef.value.text = triggerData.value.remark.triggers
  }
  editRemarkRef.value.isShowModal = true
}

const setTrigger = () => {
  emit('setTrigger', triggerData.value)
}

const setRemark = ({data, type}) => {
  console.log(data, type)
  triggerData.value.remark[type] = data
  setTrigger()
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
}, {immediate: true, deep: true})
</script>
<template>
  <div class="tabs">
    <div class="tab-hd-w">
      <div class="tab-hd flex-center">
        <div v-for="(item, index) in tabs" :key="index" class="tab-item flex-center-center" :class="[index == tabIndex - 1 ? 'tab-item-active-pre' : '', index == tabIndex ? 'tab-item-actived' : '']" @click="tabIndex = index">{{item.label}} ({{triggerData[item.name].length}})</div>
      </div>
    </div>
    <div class="tab-pane">
      <div class="remark">
        <div class="remark-hd flex-center-sb">
          <p class="name">{{getName()}}备注</p>
          <p class="edit-btn" @click="showEditRemark">编辑备注</p>
        </div>
        <div class="mt12 remark-bd">
          <v-md-preview v-if="getRemark()" :text="getRemark()"></v-md-preview>
          <p v-else>暂未添加备注</p>
        </div>
      </div>
      <div v-if="tabIndex == 0">
        <Params :params="triggerData.globalParams" @setParams="setParams" />
      </div>
      <div v-if="tabIndex == 1">
        <Flows 
          :triggerData="triggerData"
          @setFlows="setFlows"
          @setMessage="setMessage"
        />
      </div>
      <div v-if="tabIndex == 2">
        <Functions
          :triggerData="triggerData"
          @setFunctions="setFunctions"
          @setMessage="setMessage"
        />
      </div>
      <div v-if="tabIndex == 3">
        <Triggers :trigger="triggerData" @setTrigger="setTriggers" @setMessage="setMessage" />
      </div>
    </div>
  </div>
  <EditRemark ref="editRemarkRef" @setRemark="setRemark" />
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
    .remark {
      margin-top: 16px;
      padding: 0 16px;
      box-sizing: border-box;
    }
    .remark-hd {
      .name {
        font-weight: 600;
        font-size: 13px;
        line-height: 16px;
        color: #262C33;
      }
      .edit-btn {
        font-size: 12px;
        line-height: 16px;
        color: #4C4F53;
        margin-left: 8px;
        cursor: pointer;
      }
    }
    .remark-bd {
      padding: 12px 12px 0;
      box-sizing: border-box;
      border: 1px solid rgb(239, 239, 245);
      border-radius: 6px;
      font-size: 12px;
      line-height: 16px;
      color: #4C4F53;
      p {
        margin-bottom: 12px;
        opacity: .4;
      }
    }
  }
}
.mt12 {
  margin-top: 12px;
}
</style>
<style>
.github-markdown-body {
  padding: 0 !important;
  font-size: 12px !important;
  line-height: 16px !important;
  color: #4C4F53 !important;
}
.github-markdown-body blockquote, .github-markdown-body details, .github-markdown-body dl, .github-markdown-body ol, .github-markdown-body p, .github-markdown-body pre, .github-markdown-body table, .github-markdown-body ul {
  margin-bottom: 12px;
}
</style>