import Vue from 'vue'
//时间格式的过滤器
Vue.filter('time', function(value) {
    var format = 'yyyy-MM-dd  h:m:s'
    var date = {
        "M+": new Date(value).getMonth() + 1,
        "d+": new Date(value).getDate(),
        "h+": new Date(value).getHours(),
        "m+": new Date(value).getMinutes(),
        "s+": new Date(value).getSeconds(),
        "q+": Math.floor((new Date(value).getMonth() + 3) / 3),
        "S+": new Date(value).getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (new Date(value).getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
})