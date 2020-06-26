import axios from 'axios'
import qs from 'qs'
const ajax = {
    async get(url, args) {
        let _args = {};
        if (args) {
            _args = { params: args };
        }
        var s = await axios.get(url, _args)
        return s.data;
    },
    async post(url, args) {
        let _args = args || {};
        var s = await axios.post(url, _args)
        return s.data;
    },
    async delete(url, args) {
        let _args = {};
        if (args) {
            _args = { data: args };
        }
        var s = await axios.delete(url, _args)
        return s.data;
    },
    async postJTW(args) {
        const config = {
            method: 'post',
            url: '/users/login/jwt',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify(args)
        };
        debugger
        const s = await axios(config);
        debugger
        return s.data;
    },
    async postNew(args, url) {
        debugger
        const config = {
            method: 'post',
            url: url,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(args)
        };
        const s = await axios(config)
        return s.data;
    },
    async getBearer(url, token) {
        debugger
        const config = {
            method: 'get',
            url: url,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        const s = await axios(config)
        return s.data;
    },
}
export default ajax;