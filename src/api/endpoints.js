import { list } from "postcss";

export const endpoints = {
    auth: {
        login: "api/v1/users/login",
        session: "api/v1/users/current-user",
        logout :"api/v1/users/logout"
    },
    banners: {
        create: "api/v1/banners/create",
        list: "api/v1/banners",
        delete: "api/v1/banners/delete-multiple",
        importData: "api/v1/banners/import-excel",
        getById: (id) => `api/v1/banners/${id}`,
        updateBanner: (id) => `api/v1/banners/${id}`,
        bulkUpdate : "api/v1/banners/bulk-updates"
    },
    category: {
        list: "api/v1/category",
        create : "api/v1/category/create",
        getById :(id)=> `api/v1/category/${id}`,
        update : (id)=>`api/v1/category/${id}`,
        delete :"api/v1/category/delete-category",
        bulkUpdate : "api/v1/category/bulk-updates"

    },
       brand: {
        list: "api/v1/brands",
        create : "api/v1/brands/create",
        getById :(id)=> `api/v1/brands/${id}`,
        update : (id)=>`api/v1/brands/${id}`,
        delete :"api/v1/brands/delete-brands",
        importData:"api/v1/brands/import-data",
        bulkUpdate : "api/v1/brands/bulk-updates",
        exportData : "api/v1/brands/export-data",
        sample: "api/v1/brands/sample",

    },


    product :{
        add:"api/v1/products/create",
        list : "api/v1/products",
        getById : (id)=>`api/v1/products/${id}`,
        updateProduct :(id)=>`api/v1/products/${id}`,
        delete :"api/v1/products/delete-product",
        importData: "api/v1/products/import-excel",
        bulkUpdate: "api/v1/products/bulk-updates",
        sample: "api/v1/products/template",
        export: "api/v1/products/export",
        assignGoals : "api/v1/products/assign-goals",

    },
    ip:{
        add: "api/v1/ip/create",
        list : "api/v1/ip",
        update :(id)=> `api/v1/ip/${id}`,
        delete : "api/v1/ip/delete-ips",
        bulkUpdate : "api/v1/ip/bulk-update-status",
        getById:(id)=> `api/v1/ip/get-details/${id}` 
    },
    tracking :{
        generate_link : '/api/generate-link',
        clicks : '/api/v1/clicks',
    },
    postback : {
        generate_link : 'api/v1/postback/generate-url',
        list :'api/v1/postback/all',
        create : 'api/v1/postback/create',
        delete : 'api/v1/postback/bulk-delete'
    },
    postbackLog : {
        //generate_link : 'api/v1/postback/generate-url',
        list :'api/v1/postbacklog',
       // create : 'api/v1/postback/create'
    },
    goals :{
        add: "api/v1/goals/create",
        list : "api/v1/goals",
        update :(id)=> `api/v1/goals/${id}`,
        delete : "api/v1/goals/delete",
        bulkUpdate : "api/v1/goals/bulk-update-status",
        getById:(id)=> `api/v1/goals/get-details/${id}`
    },
    blogs :{
        list :"api/v1/blogs",
        create: "api/v1/blogs/create",
        getById: (id) => `api/v1/blogs/${id}`,
        update: (id) => `api/v1/blogs/${id}`,
        delete: "api/v1/blogs/delete",
        importData: "api/v1/blogs/import-json",
        bulkUpdate : "api/v1/blogs/bulk-updates",
        sample: "api/v1/blogs/sample",
        export: "api/v1/blogs/export",

    },

    videos :{
        list :"api/v1/videos",
        create: "api/v1/videos/create",
        getById: (id) => `api/v1/videos/${id}`,
        update: (id) => `api/v1/videos/${id}`,
        delete: "api/v1/videos/delete",
        importData: "api/v1/videos/import-json",
        bulkUpdate : "api/v1/videos/bulk-updates",
        sample: "api/v1/videos/sample",
        export: "api/v1/videos/export",

    },

    users :{
        list : "api/v1/users/get-users",
        create : "api/v1/users/admin/create-manager",
        update : (id)=>`api/v1/users/admin/update-manager/${id}`,
        getById :(id)=>`api/v1/users/admin/${id}`,
        delete : "api/v1/users/admin/delete-user",
        impersonate : `api/v1/users/admin/impersonate`,
        bulkUpdate : "api/v1/users/admin/bulk-updates"
    },
        stores :{
        list : "api/v1/stores",
        create : "api/v1/stores/create",
        update : (id)=>`api/v1/stores/${id}`,
        updateFields : 'api/v1/stores/update-fields',
        updatePosition : 'api/v1/stores/bulk-positions',
        getById :(id)=>`api/v1/stores/${id}`,
        delete : "api/v1/stores/delete",
        bulkUpdate : "api/v1/stores/bulk-updates",
        importData : "api/v1/stores/import-data",
        sample:"api/v1/stores/sample",
        export: "api/v1/stores/export",
    },
    network :{
        list : "api/v1/networks",
        create : "api/v1/networks/create",
        update : (id)=>`api/v1/networks/${id}`,
        getById :(id)=>`api/v1/networks/${id}`,
        delete : "api/v1/networks/bulk-delete",
        bulkUpdate : "api/v1/networks/bulk-updates",
        bulkDelete : "api/v1/networks/bulk-delete"
    },
    dashboard : {
        home : "api/v1/dashboard/home"
    },
    walletHistory : {
        list : "api/v1/walletHistory",
        export :"api/v1/walletHistory/export-excel"
    },
    withdrawHistory : {
        list : "api/v1/withdrawHistory",
        export :"api/v1/withdrawHistory/export-excel"
    },
    offerAffiliate  : {
        list :"api/v1/offerAffiliate",
        create : "api/v1/offerAffiliate/create",
        getById :(id)=>`api/v1/offerAffiliate/${id}`,
        update : (id)=>`api/v1/offerAffiliate/${id}`,
        delete : "api/v1/offerAffiliate/bulk-delete",
        bulkUpdate : "api/v1/offerAffiliate/bulk-update-status"
    },
    notifications : {
        send: "/api/v1/notifications/send",
        list: "/api/v1/notifications",
        seen: (id) => `/api/v1/notifications/${id}/seen`,
    },
        conversion :{
        list :"api/v1/conversions",
    }
}