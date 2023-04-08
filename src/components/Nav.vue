<template>
  <div class="nav flex-center">
    <div class="logo flex-center">
      <img src="../assets/images/logo.svg" alt="">
    </div>
    <div class="menu flex-center">
      <div class="menu-item"><router-link to="/">Trigger</router-link></div>
      <div class="menu-item"><router-link to="/playground">Playground</router-link></div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.nav {
  padding: 0 24px;
  height: 64px;
  border-bottom: 1px solid rgb(239, 239, 245);
  box-sizing: border-box;
  .logo {
    flex: 0 0 200px;
    height: 100%;
    img {
      height: 92px;
      height: auto;
    }
  }
  .menu {
    flex: 1;
    justify-content: flex-end;
    .menu-item {
      margin-left: 24px;
      font-size: 14px;
      line-height: 20px;
      font-weight: 500;
      color: #262C33;
      cursor: pointer;
      &:hover {
        color: #2152Ec;
      }
      a {
        text-decoration: none;
        color: inherit;
      }
    }
  }
}
</style>