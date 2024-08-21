/**
 * @description: 截取url
 * @author: MAO
 * @date: 2022-06-07 10:36:57
 * @version: V1.0.0
**/
export function splitUrl(url) {
    let jsonData = {};
    let arr = url.split('?')[1].split('&');

    for(let item of arr) {
        const [key, value] = item.split('=');
        jsonData[key] = value;
    }

    return jsonData;
}

/**
 * @description: 动态获取router
 * @author: MAO
 * @date: 2022-06-08 14:04:01
 * @version: V1.0.0
**/
export function routesObj(data) {
    let obj = {};
    
    obj.path = data.path;
    if (data.name) obj.name = data.name;
    if (data.redirect) obj.redirect = data.redirect;
    obj.component = () => import('@/views' + data.component + '.vue');
    if (data.meta) obj.meta = data.meta;

    if (data.children) {
        obj.children = [];
        data.children.forEach(item => {
            obj.children.push(routesObj(item));
        });
    }

    return obj;

}