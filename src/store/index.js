import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
const key ='token'
const store =new Vuex.Store({
    state(){
        return{
            token:localStorage.getItem('token') ? localStorage.getItem('token'):'',
            unionid:localStorage.getItem('unionid') ? localStorage.getItem('unionid'):''
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
        }
    },
})
export default store