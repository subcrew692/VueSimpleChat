<template>
  <b-container class="col-md-4">
    <h2><b-badge variant="success">Login</b-badge></h2>

    <!-- Using components -->
    <b-input-group prepend="Username" class="mt-3">
      <b-form-input v-model="username"></b-form-input>
    </b-input-group>
    
    <b-input-group prepend="Password" class="mt-3">
      <b-form-input type="password" v-model="password" v-if="!passwordShow"></b-form-input>
      <b-form-input type="text" v-model="password" v-if="passwordShow"></b-form-input>
      <b-input-group-append>
        <b-button variant="outline-primary" @click="passwordShow = !passwordShow"><i class="fa fa-eye"></i></b-button>
      </b-input-group-append>   
    </b-input-group>
    <hr>
    <table width="100%">
      <tbody>
        <tr>
          <td style="width:50%;text-align:left;">
            <b-button variant="info" size="sm" @click="login()">登入</b-button>
          </td>
          <td style="width:50%;text-align:right;">
            <router-link to="/register" class="btn btn-outline-primary btn-sm">註冊</router-link>
          </td>
        </tr>
      </tbody>
    </table>

    <b-modal ref="msgModal" title="Infomation" ok-only>
        {{message}}
    </b-modal>
  </b-container>
</template>

<script>
const userFileRef = firebase.database().ref('/userAccount/');
export default {
  data() {
    return {
      username: '',
      password: '',
      loginSuccess: false,
      allUserList: [],
      message: '',
      passwordShow: false
    }
  },
  methods: {
    login() {
      const vm = this;
      const username = vm.username;
      const password = vm.password;
      const allUserList = vm.allUserList;
      // 以username找出是否有該筆帳號
      for(var i = 0; i < allUserList.length; i++) {
        const userAccount = allUserList[i];
        if(username === userAccount.username && password === userAccount.password) {
          vm.setCookie('name', username, 30);
          vm.$router.push('/chatRoom');
        }else {
          vm.message = '帳號或密碼有誤!';
          this.$refs['msgModal'].show();
        }
      }
    },
    setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays * 1000 * 60 * 60 * 24));
      var expires = 'expires=' + d.toUTCString();
      document.cookie = `${cname}=${cvalue};${expires};path/`;
      console.log(document.cookie);
    }
  },
  mounted() {
    const vm = this;
    userFileRef.on('value', function(snapshot) {
        const val = snapshot.val();
        Object.keys(val).forEach(key => {
            const obj = val[key];
            Object.keys(obj).forEach(objKey => {
                vm.allUserList.push(obj[objKey]);
            });
        });
        console.log(vm.allUserList);
    });
  }
}
</script>

<style>
</style>