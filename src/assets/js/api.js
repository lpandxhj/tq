/**
 * 接口方法名,后缀必须添加类型（_GET、_POST、_PUT、_DELETE...），
 * 用于express模拟数据的时候区分type类型，
 * 也用于restful风格对应响应的接口type类型
 */
"use strict";
let api = {
  // ===== 公用
  "getPublicDic_GET": "/PublicDic/getPublicDic.htm",                                    // 查询公共字典数据（方案状态、方案（任务）等级、任务类型、任务性质、任务周期等）   ok
  
  // ====== 特勤监测
  "getActionPush_GET": "/scheme/getActionPush",                                         // 任务开始                             ok
  "getSchemeForWeek_GET": "/scheme/getSchemeForWeek",                                   // 查询指定时间内(今日、近一周)的待执行方案  ok
  "editSchemeWaitStatus_PUT": "/scheme/editSchemeWaitStatus",                           // 待执行方案修改                        ok
  "selectExecuteTaskDetailInfoList_GET": "/task/selectExecuteTaskDetailInfoList",       // 指定方案下的待执行任务                  ok
  
  // 特勤监测（派警）
  "getDeptTree_GET": "/ExecuteTaskDispatch/getDeptTree",                                // 查询部门信息树                         ok
  "getPersonInfoPage_GET": "/ExecuteTaskDispatch/getPersonInfoPage",                    // 查询警员基础信息分页list               ok
  "getPostPoliceDispatchList_GET": "/ExecuteTaskDispatch/getPostPoliceDispatchList",    // 查询岗位及对应派警列表信息              ok
  "addDispatchPolice_PUT": "/ExecuteTaskDispatch/addDispatchPolice",                    // 派警                                   ok
  "delExecuteTaskDispatch_DELETE": "/ExecuteTaskDispatch/delExecuteTaskDispatch",       // 移除                                  ok
  "addPoliceCallStatus_PUT": "/policeCallName/addPoliceCallStatus",                     // 警员点名（在岗、离岗）                  ok
  

  
  // ====== 特勤方案
  "getSchemeInfoPage_GET": "/scheme/getSchemeInfoPage",                                 // 查询方案分页list   ok
  "getSchemeBaseInfoList_GET": "/scheme/getSchemeBaseInfoList",                         // 查询方案list      ok
  "addSchemeInfo_POST": "/scheme/addSchemeInfo",                                        // 方案新增          ok
  "editSchemeInfo_PUT": "/scheme/editSchemeInfo",                                       // 方案修改          ok
  "deleteSchemeInfo_DELETE": "/scheme/deleteSchemeInfo",                                // 方案删除          ok
  "submitSchemeInfo_PUT": "/scheme/submitSchemeInfo",                                   // 方案提交          ok
  "checkSchemeInfo_PUT": "/scheme/checkSchemeInfo",                                     // 方案审核          ok
  "getSchemeRehearseList_GET": "/scheme/getSchemeRehearseList",                         // 查询指定执行日期内的方案（日历）ok

  // 关联任务
  "selectTaskInfoList_GET": "/task/selectTaskInfoList",                                 // 查询任务list      ok
  "addTaskInfo_POST": "/task/addTaskInfo",                                              // 任务添加          ok
  "editTaskInfo_PUT": "/task/editTaskInfo",                                             // 任务修改          ok
  "deleteTaskInfo_DELETE":"/task/deleteTaskInfo",                                       // 任务删除          ok
  
  // 快速特勤任务
  "selectFastTaskInfoPage_GET": "/task/selectFastTaskInfoPage",                         // 查询快速特勤任务分页list  ok
  "selectFastTaskInfoList_GET": "/task/selectFastTaskInfoList",                         // 查询快速特勤任务list     ok
  "addFastTaskInfo_POST": "/task/addFastTaskInfo",                                      // 快速特勤任务添加         ok
  "editFastTaskInfo_PUT": "/task/editFastTaskInfo",                                     // 快速特勤任务修改         ok
  "deleteFastTaskInfo_DELETE": "/task/deleteFastTaskInfo",                              // 快速特勤任务删除         ok

  // 关联线路
  "getRouteInfoList_GET": "/route/getRouteInfoList",                                    // 查询线路list            ok
  "addRouteInfo_POST": "/route/addRouteInfo",                                           // 线路新增                ok
  "editRouteInfo_PUT": "/route/editRouteInfo",                                          // 线路修改                ok
  "deleteRouteInfo_DELETE": "/route/deleteRouteInfo",                                   // 线路删除                ok
  "changeRouteType_PUT": "/route/changeRouteType",                                      // 线路主备类型修改（备用线路切换为执行线路） ok

  // 关联岗位
  "getPostInfoList_GET": "/rltPost/getPostInfoList",                                    // 查询关联岗位list        ok
  "rltRoutePostList_POST": "/rltPost/rltRoutePostList",                                 // 关联岗位保存            ok

  // 关联设备
  "getRltDeviceList_GET": "/rltDevice/getRltDeviceList",                                // 查询关联设备list        ok
  "rltRouteDeviceList_POST": "/rltDevice/rltRouteDeviceList",                           // 关联设备保存            ok
  
  // 预演
  "getPushServer_GET":"/scheme/getPushServer",                                          // 预演（开始、停止、暂停）  ok
  
  
  
  // ====== 基础信息（常备线路）
  "getCommonRoutePage_GET": "/commonRoute/getCommonRoutePage",                          // 查询常备线路分页list     ok
  "getCommonRouteList_GET": "/commonRoute/getCommonRouteList",                          // 查询常备线路list        ok
  "addCommonRoute_POST": "/commonRoute/addCommonRoute",                                 // 常备线路新增            ok
  "editCommonRoute_PUT": "/commonRoute/editCommonRoute",                                // 常备线路修改            ok
  "delCommonRoute_DELETE": "/commonRoute/delCommonRoute",                               // 常备线路删除            ok
  
  // 基础信息(常备单位)
  "getCommonPlacePage_GET": "/CommonPlace/getCommonPlacePage",                          // 查询常备单位分页list     ok
  "getCommonPlaceList_GET": "/CommonPlace/getCommonPlaceList",                          // 查询常备单位list         ok
  "addCommonPlace_POST": "/CommonPlace/addCommonPlace",                                 // 常备单位新增             ok
  "editCommonPlace_PUT": "/CommonPlace/editCommonPlace",                                // 常备单位修改             ok
  "delCommonPlace_DELETE": "/CommonPlace/delCommonPlace"                                // 常备单位删除             ok
};
exports.api = api;






























// 以下配置在dev mock环境下有效，在build/webpack.dev.conf.js/express.Router() 中有配置,暂时只考虑了4中类型，有其他类型可追加
let [apiGet, apiPost, apiPut, apiDelete ] = [[],[],[],[]];
for (let key in api) {
  if (key.indexOf("_GET") >= 0) {
    apiGet.push({
      "url": api[key],
      "key": key
    })
  } else if (key.indexOf("_POST") >= 0) {
    apiPost.push({
      "url": api[key],
      "key": key
    })
  } else if (key.indexOf("_PUT") >= 0) {
    apiPut.push({
      "url": api[key],
      "key": key
    })
  } else if (key.indexOf("_DELETE") >= 0) {
    apiDelete.push({
      "url": api[key],
      "key": key
    })
  }
}
exports.apiName = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete
}
