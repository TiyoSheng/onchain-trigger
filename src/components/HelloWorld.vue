<template>
  <div class="hello">
    <div class="l">
      <p>输入需要监听的地址：<input type="text" v-model="notifyAddresss"></p>
      <button @click="notifyFun">开始监听</button>
    </div>
    <div class="r">
      <div
        class="msgs"
        v-for="(item, index) in msgList"
        :key="index"
        ref="child"
      >
        <JsonViewer :value="item" boxed sort expanded />
      </div>
    </div>
  </div>
</template>

<script>
import { useIsActivating } from '../hooks/useIsActivating'
import { useStore } from 'vuex'
import { ethers } from 'ethers'
import {JsonViewer} from "vue3-json-viewer"
import "vue3-json-viewer/dist/index.css"
import { onMounted, computed, toRaw, ref, watch, nextTick } from 'vue'
const { Alchemy, Network, AlchemySubscription } = require("alchemy-sdk");
const settings = {
  apiKey: "72nGqLuxAL9xmlekqc_Ep33qNh0Z-C4G",
  network: Network.ETH_GOERLI,
};
const alchemy = new Alchemy(settings);
export default {
  name: 'HelloWorld',
  components: { JsonViewer },
  setup() {
    const child = ref(null)
    const msgList = ref([])
    const notifyAddresss = ref('')
    const store = useStore()
    const { getProvider } = useIsActivating()
    const toAddress = ref('')
    const address = computed(() => {
      return store.state.address
    })
    const provider = computed(() => {
      return store.state.provider
    })
    const transactions = () => {
      let tx = {
        from: address.value,
        to: toAddress.value,
        value: ethers.utils.parseEther('0.01')
      }
      toRaw(provider.value).getSigner().sendTransaction(tx).then(async (transaction) => {
        console.dir(new Date().getTime(), transaction)
        const receipt = await transaction.wait()
        alert("发送成功")
        console.log(new Date().getTime(), receipt)
      }).catch(err => {
        console.log(err)
        if (err.message) {
          alert(err.message)
        }
      })
    }
    const notifyFun = () => {
      if (!notifyAddresss.value) {
        alert('请先输入监听地址')
        return
      }
      alchemy.core.getTokenBalances(notifyAddresss.value).then(res => {
        console.log(11, res)
        alert('开始监听')
      })
      alchemy.ws.on(
        { method: AlchemySubscription.PENDING_TRANSACTIONS,
        toAddress: notifyAddresss.value },
        (res) => {
          msgList.value.push(res)
        }
      );
    }
    onMounted(() => {
      getProvider()
    })
    watch(() => msgList, () => {
      nextTick(() => {
        setTimeout(() => {
          // let child = document.querySelectorAll('.msgs')[msgList.value.length - 1]
          child.value[msgList.value.length - 1].scrollIntoView({block: "end", behavior: "smooth"})
        }, 200)
        
      });
    }, { deep: true })


    return {
      child,
      address,
      toAddress,
      msgList,
      notifyAddresss,
      transactions,
      notifyFun
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.hello {
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  align-items: flex-start;
  padding: 30px;
  box-sizing: border-box;
  .l {
    flex: 0 0 500px;
    p {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      input {
        width: 300px;
        height: 30px;
      }
    }
  }
  .r {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    .msgs {
      width: 100%;
      margin-bottom: 14px;
    }
  }
}
</style>
<style>
.jv-more {
  display: none;
}

.jv-container.boxed:hover {
  box-shadow: none
}
.jv-container.boxed {
  border: none;
}
  
</style>
