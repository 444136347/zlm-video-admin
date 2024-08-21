import router from "./router";
import store from "./store";
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from "./utils/auth";
import { routerList } from "./api/user"
import { routesObj } from "./utils/uitls"

NProgress.configure({ showSpinner: false });

const whiteList = ['/login'];

router.beforeEach(async(to, from, next) => {
    NProgress.start();

    const hasToken = getToken();

    if (hasToken) {
        // 如果已经登录了，直接跳到默认页
        if (to.path === '/login') {
            next({ path: '/' });
            NProgress.done();
        } else {
            const hasGetUserInfo = store.getters.name;

            if (hasGetUserInfo) {
                next()
            } else {
                try {
                    await store.dispatch('user/getInfo');
                    await routerList().then(res => {
                        const routerList = res.data;
                        router.options.routes[2].children = [];
                        if (routerList) {
                            routerList.forEach(item => {
                                router.addRoute('home', routesObj(item));
                                router.options.routes[2].children.push(routesObj(item))
                            });
                        }
                    });
                    if (to.redirectedFrom) {
                        next(to.redirectedFrom); // 这里的 next 应该带上当前路径
                    } else {
                        next('/');
                    }
                } catch (error) {
                    next(`/login?redirect=${to.path}`);
                    NProgress.done();
                }
            }
        }
    } else {
        if (whiteList.indexOf(to.path) !== -1) {
            next();
        } else {
            if (process.env.VUE_APP_FAKE_LOGIN) {
                store.dispatch('user/login', {username: 'admin', password: '666666'});
                NProgress.done();
            } else {
                next(`/login?redirect=${to.path}`);
                NProgress.done();
            }
        }
    }
})

// 完成进度条
router.afterEach(() => {
    NProgress.done();
})
