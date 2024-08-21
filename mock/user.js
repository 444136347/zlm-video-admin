const { splitUrl } = require('@/utils/uitls')

const data = {
    username: 'admin',
    password: '666666'
};

const users = {
    'admin-token': {
        roles: ['admin'],
        avatar: require("@/assets/images/avatar.jpeg"),
        name: '超级管理员'
    }
}

const token = 'admin-token';

module.exports = [
    {
        url: '/login',
        type: 'post',
        response: config => {
            const { username, password } = JSON.parse(config.body);
            if (username === data.username &&  password === data.password) {
                return {
                    code: 20000,
                    data: {
                        token: token
                    }
                }
            }

            return {
                code: 502,
                message: ' 用户名或密码错误！请重试'
            }
        }
    },
    {
        url: '/getInfo.*',
        type: 'get',
        response: config => {
            const { token } = splitUrl(config.url);
            const info = users[token];
            if (!info) {
                return {
                    code: 50008,
                    message: '登录失败，无法获取用户信息！'
                }
            }

            return {
                code: 20000,
                data: info
            }
        }

    },
    {
        url: '/logout',
        type: 'post',
        response: config => {
            const { token } = JSON.parse(config.body);
            if (token) {
                return {
                    code: 20000,
                    message: 'success'
                }
            }

            return {
                code: 50008,
                message: '无权限，请重新获取token！'
            }
        }
    }
]
