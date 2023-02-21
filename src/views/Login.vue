<template>
  <div class="login">
    <div class="login-from flex-center-center">
      <div class="title">{{!type ? 'Log in to Jetable' : 'Get started with Jetable'}}</div>
      <div class="input">
        <input type="text" placeholder="Type your email" v-model="email">
      </div>
      <div class="input">
        <input type="password" placeholder="Type your password" v-model="password">
      </div>
      <div :class="['btn', 'flex-center-center', password && email ? 'btn-activated' : '']" @click="startFun">{{!type ? 'Log in' : 'Create Account'}}</div>
      <div class="hint">
        <p v-if="type"  @click="type = !type">Already have an account? Log in</p>
        <p v-if="!type" @click="type = !type">Forgot password?</p>
        <p v-if="!type" @click="type = !type">Sign up</p>
      </div>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue'
import { regist, login } from '../http/api'
import { useRouter } from 'vue-router'
import { useMessage } from "naive-ui"
export default {
  name: 'Login',
  setup() {
    const message = useMessage()
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const type = ref(0)
    const loginFun = () => {
      login({email: email.value, password: password.value}).then(res => {
        console.log(res)
        if (res.code == 0) {
          localStorage.setItem('token', res.access_token)
          router.push('/')
        } else {
          message.error(res.msg)
        }
      })
    }
    const registerFun = () => {
      regist({email: email.value, password: password.value}).then(res => {
        console.log(res)
        if (res.code == 0) {
          loginFun()
        } else {
          message.error(res.msg)
        }
      })
    }
    const startFun = () => {
      if (type.value) {
        registerFun()
      } else {
        loginFun()
      }
    }
    return {
      email,
      password,
      type,
      registerFun,
      loginFun,
      startFun
    }
  },
}
</script>
<style lang="scss" scoped>
.login {
  height: calc(100vh - 60px);
  width: 100vw;
  .login-from {
    width: 100%;
    height: 100%;
    flex-direction: column;
  }
  .title {
    font-weight: 500;
    font-size: 30px;
    line-height: 36px;
    color: #262C33;
    text-align: center;
  }
  .input {
    text-align: center;
    margin-top: 32px;
    input {
      width: 390px;
      height: 50px;
      background: #FFFFFF;
      border-radius: 8px;
      font-size: 16px;
      color: #262C33;
      padding: 0 24px;
      box-sizing: border-box;
      outline: none;
    }
  }
  .btn {
    margin-top: 32px;
    width: 390px;
    height: 50px;
    background: #C9D1DC;
    border-radius: 8px;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    color: #FFFFFF;
    cursor: no-drop;
    &.btn-activated {
      background: #2152EC;
      cursor: pointer;
      &:hover {
        background: #426DF4;
      }
    }
  }
  .hint {
    width: 390px;
    font-size: 15px;
    line-height: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #4C4F53;
    margin-top: 16px;
    font-weight: 300;
    p {
      &:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    }
  }
}
</style>
