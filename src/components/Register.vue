<template>
  <b-container class="col-4">
    <h2><b-badge variant="success">Register</b-badge></h2>
    <b-form>
        <div style="text-align:left;">
            <i class="fa fa-user"></i> Username: 
            <b-input v-model.trim="username" :state="usernamePass" @change="validationUsername()" 
            placeholder="請輸入5-15位英數字..." class="mb-3"></b-input>

            <i class="fa fa-lock"></i> Password: 
            <b-input v-model.trim="password" type="password" :state="passwordPass" @change="validationPassword()"
            placeholder="請輸入6-20位英數字..." class="mb-3"></b-input>

            <i class="fa fa-envelope"></i> Email address:
            <b-input v-model.trim="email" type="email" :state="emailPass" @change="validationEmail()"
            placeholder="請輸入Email..." class="mb-3"></b-input>

            <div style="text-align:right;">
                <router-link to="/">回登入頁面</router-link>
                <button class="btn btn-primary btn-sm" @click="register()">註冊</button>
            </div>
        </div>
    </b-form>
    <b-modal ref="msgModal" title="Infomation" ok-only>
        {{message}}
    </b-modal>
  </b-container>
</template>

<script>
Date.prototype.yyyymmddByDash = function() {
	var yyyy = this.getFullYear();
	var mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
	var dd  = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
	return "".concat(yyyy).concat('-').concat(mm).concat('-').concat(dd);
};
const userFileRef = firebase.database().ref('/userAccount/');
export default {
  data() {
    return {
        username: '',
        password: '',
        email: '',
        usernamePass: '',
        passwordPass: '',
        emailPass: '',
        allUserList: [],
        message: ''
    }
  },
  methods: {
    validationUsername() {
        this.usernamePass = this.username.length > 3 && this.username.length < 15;
    },
    validationPassword() {
        this.passwordPass = this.password.length > 3 && this.password.length < 15;
    },
    validationEmail() {
        this.emailPass = this.email.length > 5;
    },
    register() {
        const vm = this;
        const username = vm.username;
        const password = vm.password;
        const email = vm.email;
        if(vm.validationInput()) {
            userFileRef.child(username + '/').push({
                username: username,
                password: password,
                email: email,
                timeStamp: new Date().yyyymmddByDash()
            }).then(() => {
                this.message = '註冊成功!';
                this.$refs['msgModal'].show();
                vm.$router.push('/');
            }).catch(e => console.log('error'));
        }else {
            this.$refs['msgModal'].show();
        }        
    },
    validationInput() {
        const userList = this.allUserList;
        const username = this.username;
        const password = this.password;
        const email = this.email;
        let pass = true;
        if(username && password && email) {
            for(var i = 0; i < userList.length; i++) {
                if(userList[i] === username) {
                    this.message = 'username has been taken, please change one';
                    pass = false;
                }
            }
            return pass;
        }else {
            this.message = 'input wrong';
            pass = false;
            return pass;
        }
    }
  },
  mounted() {
    const vm = this;
    userFileRef.on('value', function(snapshot) {
        const val = snapshot.val();
        Object.keys(val).forEach(key => {
            const obj = val[key];
            Object.keys(obj).forEach(objKey => {
                vm.allUserList.push(obj[objKey].username);
            });
        });
        // console.log(vm.allUserList);
    });
  }
}
</script>

<style>
</style>