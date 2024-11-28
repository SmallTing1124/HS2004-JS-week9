const baseURL = "https://livejs-api.hexschool.io";
const api_path = "ting1124";
const customerApi = `${baseURL}/api/livejs/v1/customer/${api_path}`;


const token = "2JaKkF5RNSZoBHnHAynhsCU1NBf2";
const adminApi = `${baseURL}/api/livejs/v1/admin/${api_path}`;

const headers = {
    headers: {
        authorization: token
    }
}

const adminInstance = axios.create({
    baseURL: adminApi,
    headers: {
        authorization: token
    }
  });