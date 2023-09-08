<template>
  <div class="login">
    <div class="login-from flex-center-center">
      <div class="title">Get started with Jetable</div>
      <div class="input">
        <input type="text" placeholder="Type your email" v-model="email">
      </div>
      <div class="input">
        <input type="password" placeholder="Type your password" v-model="password">
      </div>
      <div :class="['btn', 'flex-center-center', password && email ? 'btn-activated' : '']" @click="startFun">Create
        Account</div>
      <div class="hint">
        <router-link to="/login">Already have an account? Log in</router-link>
      </div>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue'
import { regist } from '../http/api'
import { useRouter } from 'vue-router'
import { useMessage } from "naive-ui"
export default {
  name: 'regist',
  setup() {
    const message = useMessage()
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const type = ref(0)
    const loginFun = () => {
      login({ email: email.value, password: password.value }).then(res => {
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
      regist({ email: email.value, password: password.value }).then(res => {
        console.log(res)
        if (res.code == 0) {
          loginFun()
        } else {
          message.error(res.msg)
        }
      })
    }
    const startFun = () => {
      registerFun()
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
      border: none;
      background: none;
      width: 390px;
      height: 50px;
      border: 1px solid #E5E7EB;
      border-radius: 6px;
      background: #FFFFFF;
      border-radius: 8px;
      font-size: 16px;
      color: #262C33;
      padding: 0 24px;
      box-sizing: border-box;
      outline: none;

      &:focus {
        border-color: #2152EC;
      }
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

    a {
      color: #4C4F53;
      text-decoration: none;

      &:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    }
  }
}</style>