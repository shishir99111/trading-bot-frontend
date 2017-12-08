<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="login">
        <div class="login-con">
            <Card :bordered="false">
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    Welcome Login
                </p>
                <div class="form-con">
                    <Form ref="loginForm" :model="form" :rules="rules">
                        <FormItem prop="userName">
                            <Input v-model="form.userName" placeholder="please enter user name" v-bind:disabled="disableUP">
                                <span slot="prepend">
                                    <Icon :size="16" type="person"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="password">
                            <Input type="password" v-model="form.password" placeholder="Please enter the password" v-bind:disabled="disableUP">
                                <span slot="prepend">
                                    <Icon :size="14" type="locked"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="otp">
                            <a href="javascript:void(0)" @click="generateOTP" v-bind:disabled="disableUP">
                                <span class="main-user-name">[ Generate Dynamic Access Code ]</span>
                            </a>
                            <Input type="password" v-model="form.otp" placeholder="Dynamic Access Code" v-bind:disabled="disableOtp">
                                <span slot="prepend">
                                    <Icon :size="14" type="key"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem>
                            <Button @click="login" type="primary" long>LOGIN</Button>
                        </FormItem>
                    </Form>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
import Cookies from 'js-cookie';
export default {
    data () {
        return {
            disableOtp : true,
            disableUP : false,  // flag for disabling username and password feild
            form: {
                userName: '',
                password: '',
                otp: '',
            },
            rules: {
                userName: [
                    { required: true, message: 'Account can not be empty', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: 'password can not be blank', trigger: 'blur' }
                ],
                otp: [
                    { required: true, message: 'Dynamic access code can not be blank', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
      login () {
        this.$store.dispatch('login', { email: this.form.userName, password: this.form.password, otp: this.form.otp })
          .then((response) => {
            // clearing the existing data
            this.username = '';
            this.password = '';
            this.otp = '';
            this.$router.push({
                name: 'home_index'
            });
          }).catch((error)=>{
            this.$Notice.error({
                title: 'Authentication',
                desc: response.message,
            }); 
          });
      },
      generateOTP () {
        this.$store.dispatch('generateOTP', {email: this.form.userName, password: this.form.password})
        .then((response) => {
            this.$Notice.info({
                title: 'Dynamic Access Code',
                desc: 'Your Dynamic Access Code has been generated and sent to you via Email / Mobile Number.',
            });
            this.disableOtp = false; 
            this.disableUP = true;
        }).catch((e)=>{
            this.$Notice.error({
                title: 'Authentication',
                desc: error.message,
            });
        });
      }
    }
};
</script>

<style>

</style>
