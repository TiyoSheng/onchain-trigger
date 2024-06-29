<script setup>
import { ref } from 'vue'
import { ethers } from 'ethers'
import { useUtils } from '../../hooks/utils'

const { copy } = useUtils()

const options = [
  { label: 'BigNumber', value: 'bignumber' },
  { label: 'ethereum/eth', value: 'eth' }
]

const showToolsModal = ref(false)
const result = ref(null)
const original = ref(null)
const type = ref('bignumber')
const eth = ref({
  wei: '',
  gwei: '',
  ethers: ''
})

const computed = () => {
  if (type.value && original.value) {
    if (type.value === 'bignumber') {
      try {
        result.value = ethers.BigNumber.from(original.value).toString()
      } catch (error) {
        result.value = null
      }
    }
  }
}

const computedWei = () => {
  if (eth.value.wei) {
    eth.value.gwei = ethers.utils.formatUnits(eth.value.wei, 'gwei') >= 1 ? Number(ethers.utils.formatUnits(eth.value.wei, 'gwei')).toString() : ethers.utils.formatUnits(eth.value.wei, 'gwei')
    eth.value.ethers = ethers.utils.formatUnits(eth.value.wei, 'ether') >= 1 ? Number(ethers.utils.formatUnits(eth.value.wei, 'ether')).toString() : ethers.utils.formatUnits(eth.value.wei, 'ether')
  }
}

const computedGwei = () => {
  if (eth.value.gwei) {
    eth.value.wei = ethers.utils.parseUnits(eth.value.gwei, 'gwei').toString()
    eth.value.ethers = ethers.utils.formatUnits(eth.value.wei, 'ether') >= 1 ? Number(ethers.utils.formatUnits(eth.value.wei, 'ether')).toString() : ethers.utils.formatUnits(eth.value.wei, 'ether')
  }
}

const computedEth = () => {
  if (eth.value.ethers) {
    eth.value.wei = ethers.utils.parseUnits(eth.value.ethers, 'ether').toString()
    eth.value.gwei = ethers.utils.formatUnits(eth.value.wei, 'gwei') >= 1 ? Number(ethers.utils.formatUnits(eth.value.wei, 'gwei')).toString() : ethers.utils.formatUnits(eth.value.wei, 'gwei')
  }
}

const selectChange = (e) => {
  if (type.value === 'eth') {
    computedEth()
  } else {
    computed()
  }
}

const copyResult = () => {
  if (result.value) {
    copy(result.value)
  }
}

const close = () => {
  type.value = 'bignumber'
  result.value = null
  original.value = null
  eth.value = {
    wei: '',
    gwei: '',
    ethers: ''
  }
  showToolsModal.value = false
}

defineExpose({
  showToolsModal
})
</script>
<template>
  <div v-if="showToolsModal" class="tools flex-center-center" @click="close">
    <div class="tools-content" @click.stop>
      <div class="title">换算工具</div>
      <n-form-item label="类型" label-placement="left" label-width="50">
        <n-select v-model:value="type" :options="options" placeholder="选择要转换的类型"  @update:value="selectChange" />
      </n-form-item>
      <div v-show="type == 'bignumber'">
        <n-form-item label="原始值" label-placement="left" label-width="50">
          <n-input v-model:value="original" placeholder="输入要换算的值" @update:value="computed" />
        </n-form-item>
        <n-form-item label="结果" label-placement="left" label-width="50">
          <div class="result flex-center" :style="{color: result ? '#262C33' : 'rgb(194, 194, 194)'}" @click="copyResult">{{ result || '计算结果' }}</div>
        </n-form-item>
      </div>
      <div v-show="type == 'eth'">
        <n-form-item label="Wei" label-placement="left" label-width="50">
          <n-input v-model:value="eth.wei" placeholder="输入值" @update:value="computedWei" @click="eth.wei && copy(eth.wei)" />
        </n-form-item>
        <n-form-item label="Gwei" label-placement="left" label-width="50">
          <n-input v-model:value="eth.gwei" placeholder="输入值" @update:value="computedGwei" @click="eth.gwei && copy(eth.gwei)" />
        </n-form-item>
        <n-form-item label="Ethers" label-placement="left" label-width="50">
          <n-input v-model:value="eth.ethers" placeholder="输入值" @update:value="computedEth" @click="eth.ethers && copy(eth.ethers)" />
        </n-form-item>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.tools {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 999;

  .tools-content {
    background: #fff;
    border-radius: 8px;
    width: 500px;
    padding: 24px;
    font-size: 14px;
    line-height: 20px;

    .title {
      text-align: center;
      font-size: 16px;
      line-height: 22px;
      font-weight: 700;
      margin-bottom: 24px;
    }

    .result {
      height: 40px;
      width: 100%;
      padding: 0 12px;
      box-sizing: border-box;
      border-radius: 3px;
      border: 1px solid rgb(224, 224, 230);
      font-size: 14px;
      color: rgba(194, 194, 194, 1)
    }
  }
}
</style>