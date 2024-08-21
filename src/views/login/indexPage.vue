<template>
  <div id="login">
    <a-card title="zlm流媒体管理后台" class="card-style" :bordered="false">
      <a-form
        id="normal-login"
        :form="form"
        class="login-form"
        @submit="handleSubmit"
      >
        <a-form-item>
          <a-input
            v-decorator="[
          'username',
          { rules: [{ required: true, message: '请输入账号!' }] },
        ]"
            placeholder="请输入账号：admin"
          >
            <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)" />
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input
            v-decorator="[
          'password',
          { rules: [{ required: true, message: '请输入密码!' }] },
        ]"
            type="password"
            placeholder="请输入密码：666666"
          >
            <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)" />
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-checkbox
            v-decorator="[
          'remember',
          {
            valuePropName: 'checked',
            initialValue: true,
          },
        ]"
          >记住登录</a-checkbox>
          <a-button type="primary" html-type="submit" :loading="loading" class="login-form-button">登录</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script>
import {  mapActions } from 'vuex'
export default {
  data() {
    return {
      form: this.$form.createForm(this, { name: "normal_login" }),
      loading: false
    }
  },
  mounted() {
    this.form.setFieldsValue({
      username: 'admin',
      password: '123456'
    })
  },
  methods: {
    ...mapActions({
      login: 'user/login'
    }),
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.loading = true;
          this.login(values).then(async() => {
            await this.$router.push({path: '/'});
            this.loading = false;
          }).catch(err => {
            console.log(err);
            this.loading = false;
          })
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
#login {
  background: url('/src/assets/images/login_bg.jpg') no-repeat center center fixed; /* 设置背景图片 */
  background-size: cover; /* 背景图片铺满整个页面 */
  height: 100vh;
  position: relative;
  .card-style {
    width: 500px;
    background: #ffffff;
    position: absolute;
    top: 200px;
    left: 0;
    right: 0;
    margin: auto;
  }

  #normal-login .login-form {
    max-width: 200px;
  }
  #normal-login .login-form-forgot {
    float: right;
  }
  #normal-login .login-form-button {
    margin-top: 20px;
    bottom: -20px;
    width: 100%;
  }
}
</style>
