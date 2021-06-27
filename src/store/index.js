import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const key ='token'
const store =new Vuex.Store({
    state(){
        return{
            token:localStorage.getItem('token') ? localStorage.getItem('token'):'',
            unionid:localStorage.getItem('unionid') ? localStorage.getItem('unionid'):'',
            user:localStorage.getItem('user') ? localStorage.getItem('user'):''
        }
    },
    getters:{
        getSortage:function (state) {
            if(!state.token){
                state.token =JSON.parse(localStorage.getItem(key))
            }
            return state.token
        },
        getUnionid:function (state) {
            if(!state.unionid) {
                state.unionid = JSON.parse(localStorage.getItem('unionid'))
            }
            return state.unionid
        },
        getUser:function (state) {
            if(!state.user) {
                state.user = JSON.parse(localStorage.getItem('user'))
            }
            return state.user
        }
    },
    mutations:{
        $_setStorage(state,value){
            state.token =value;
            localStorage.setItem(key,JSON.stringify(value))
        },
        $_removeStorage(state){
            state.token =null;
            localStorage.removeItem(key)
        },
        $_setUnionid(state,value){
            state.unionid =value;
            localStorage.setItem('unionid', JSON.stringify(value))
        },
        $_removeUnionid(state){
            state.unionid =null;
            localStorage.removeItem('unionid')
        },
        $_setUser(state,value){
            state.user =value;
            localStorage.setItem(key,JSON.stringify(value))
        },
        $_removeUser(state){
            state.user =null;
            localStorage.removeItem(key)
        },
    },
})
export default store