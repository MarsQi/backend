import Vue from 'vue'
import Router from 'vue-router'
import projectList from '@/pages/ProjectManagement/projectList/index.vue'
import navigator from '@/pages/navigate/index'

Vue.use(Router)

const router = new Router({
    routes: [{
        //登录
        path: '/',
        component: resolve => require(['../pages/register/index'], resolve)
    }, {
        path: '/navigator',
        meta: {
            index: '1',
        },
        component: navigator,
        children: [{
                //项目管理
                path: '',
                meta: {
                    index: '1',
                },
                component: projectList
            },
            {
                path: 'addProject',
                meta: {
                    index: '1',
                },
                component: resolve => require(['../pages/ProjectManagement/addProject/index'], resolve)
            },
            //模板管理
            {
                path: 'templateList',
                meta: {
                    index: '2',
                },
                component: resolve => require(['../pages/templateManagement/templateList/index'], resolve)
            },
            {
                path: 'addtemplate',
                meta: {
                    index: '2',
                },
                component: resolve => require(['../pages/templateManagement/addtemplate/index'], resolve)
            },
            // 模块管理
            {
                path: 'moduleList',
                meta: {
                    index: '3',
                },
                component: resolve => require(['../pages/moduleManage/moduleList/index'], resolve)
            },
            {
                path: 'addModule',
                meta: {
                    index: '3',
                },
                component: resolve => require(['../pages/moduleManage/addModule/index'], resolve)
            },
            // 权限管理
            {
                path: 'usersList',
                meta: {
                    index: '4',
                },
                component: resolve => require(['@/pages/authorityManagement/userList/index'], resolve)
            },
            {
                path: 'authorityList',
                meta: {
                    index: '4',
                },
                component: resolve => require(['@/pages/authorityManagement/authorityList/index'], resolve)
            },
            {
                path: 'CreatingRoles',
                meta: {
                    index: '4',
                },
                component: resolve => require(['@/pages/authorityManagement/createRoles/index'], resolve)
            },
            {
                path: 'authoritySet',
                meta: {
                    index: '4',
                },
                component: resolve => require(['@/pages/authorityManagement/authoritySet/index'], resolve),
                children: [{
                        path: '',
                        meta: {
                            index: '4',
                        },
                        redirect: 'menuList'
                    },
                    {
                        path: 'menuList',
                        meta: {
                            index: '4',
                        },
                        component: resolve => require(['@/pages/authorityManagement/authoritySet/page/menuList'], resolve),
                    },
                    {
                        path: 'resourceList',
                        meta: {
                            index: '4',
                        },
                        component: resolve => require(['@/pages/authorityManagement/authoritySet/page/resourceList'], resolve),
                    },
                    {
                        path: 'authorityResource',
                        meta: {
                            index: '4',
                        },
                        component: resolve => require(['@/pages/authorityManagement/authoritySet/page/authorityResource'], resolve),
                    }
                ]
            },
            //发布日志
            {
                path: 'logManage',
                meta: {
                    index: '5',
                },
                component: resolve => require(['@/pages/publishLog/logManage/index.vue'], resolve)
            }, {
                path: ''
            }
        ]
    }]
});
// // 判断是否需要登录权限 以及是否登录
// router.beforeEach((to, from, next) => {
//     if (to.matched.some(res => res.meta.requireAuth)) { // 判断是否需要登录权限
//         if (localStorage.getItem('login')) { // 判断是否登录
//             next();
//         } else { // 没登录则跳转到登录界面
//             next({ path: '/' });
//         }
//     } else {
//         next();
//     }
// });
export default router