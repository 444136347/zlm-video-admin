import { login, logout, getInfo } from '@/api/user'
import { setToken, getToken, removeToken } from  '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
    return {
        token: getToken(),
        name: '',
        avatar: ''
    }
}


const state = getDefaultState();

const mutations = {
    reset_state(state) {
        Object.assign(state, getDefaultState())
    },
    set_token(state, token) {
        state.token = token
    },
    set_name(state, name) {
        state.name = name
    },
    set_avatar(state, avatar) {
        state.avatar = avatar 
    }
}

const actions = {
    login({ commit }, userInfo) {
        const { username, password } = userInfo;
        return new Promise((resolve, reject) => {
            login({username: username, password: password}).then(res => {
                const { data } = res;
                commit('set_token', data.token);
                setToken(data.token)
                resolve() 
            }).catch(err => {
                reject(err);
            })
        })
    },

    getInfo({ commit, state }) {
        return new Promise((resolve, reject) => {
            getInfo(state.token).then(res => {
                const { data } = res;
                if (!data) {
                    return reject('验证失败，请重新登录！');
                }
                const { name, avatar } = data;
                commit('set_name', name);
                commit('set_avatar', avatar);

                resolve(data);
            }).catch(err => {
                reject(err);
            })
        })
    },

    logout({ commit, state }) {
        return new Promise((resolve, reject) => {
            logout(state.token).then(() => {
                removeToken();
                resetRouter();
                commit('reset_state');
                resolve();
            }).catch(err => {
                reject(err);
            })
        })
    }
}


export default {
    namespaced: true,
    state,
    mutations,
    actions
}