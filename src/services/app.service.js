import axios from 'axios';
import Cookies from 'js-cookie';
import env from '../config/env';

const ajaxUrl = env === 'development' ?
  'http://127.0.0.1:5505/api/v1/' :
  env === 'production' ?
  'https://www.url.com' :
  'https://debug.url.com';

axios.defaults.baseURL = ajaxUrl;

const appService = {
  login(reqObj) {
    return new Promise((resolve, reject) => {
      const obj = {
        url: '/authentication',
        method: 'POST',
        data: reqObj
      }
      axios.request(obj).then(response => {
        resolve(response.data);
      }).catch(response => {
        reject(response.response.data);
      })
    });
  },
  generateOTP(reqObj) {
    return new Promise((resolve, reject) => {
      const obj = {
        url: '/authentication/generateOTP',
        method: 'POST',
        data: reqObj
      };
      axios.request(obj).then(res => {
        resolve(res);
      }).catch(res => {
        resolve(res.response.data);
      });
    });
  },
  /** reqObj: 
    {
        url,
        method,
        params,
        data,
    } 
        `url` is the server URL that will be used for the request
        get default
        `method` is the request method to be used when making the request
        `params` are the URL parameters to be sent with the request
        Must be a plain object or a URLSearchParams object
        `data` is the data to be sent as the request body
        Only applicable for request methods 'PUT', 'POST', and 'PATCH' 
    */
  request(reqObj) {
    return new Promise((resolve, reject) => {
      const obj = {
        headers: {
          'X-ACCESS-TOKEN': Cookies.get('token')
        }
      };

      obj['url'] = reqObj.url;
      obj['method'] = reqObj.method;
      if (reqObj.params) obj['params'] = reqObj.params;
      if (reqObj.data) obj['data'] = reqObj.data;

      axios.request(obj).then((response) => {
        if (response && response.data) {
          return resolve(response.data);
        }
        resolve(response);
      }).catch((err) => {
        if (err.response && err.response.data) {
          return reject(err.response.data);
        }
        reject(err);
      })
    });
  }
}

export default appService