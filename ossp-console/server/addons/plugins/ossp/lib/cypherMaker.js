/**
 * Created by yanzhig on 2/6/2016.
 */
module.exports = (function() {
    'use strict';
    var _ = require(process.env.ROOT + '/node_modules/lodash/index');
    var K = {};
    //For KPI Manager
    K.getCypherForLookupKPIDefinition=function(domain,neType,granularity,kpiName,kpiType,kpiFormula){
        var statement='match (d:DOMAIN{name:"'+domain+'"})-->(t:TEMPLATE {id:"'+neType+'"})-->(kd:KPI_DEF {name:"'+kpiName+'",type:'+kpiType+',formula:"'+kpiFormula+'"})<--(g:GRANULARITY {seconds:'+granularity+'}) return kd.id';
        return  [{statement:statement}];
    };
    K.getCypherForRegisterKPIDefinition=function(domain,neType,granularity,kpiID,kpiName,kpiType,kpiFormula,kpiUnit,kpiDesc){
      /*  create (:KPI_DEF {id:1,name:"kpi_test",type:0,formula:"kpi_test",description:"",unit:""})
        match (k:KPI_DEF {id:1}) with k match (t:TEMPLATE {id:"BTS"}) merge (t)-[:HAS_KPI]->(k)
        match (k:KPI_DEF {id:1}) with k match (g:GRANULARITY {seconds:900}) merge (g)-[:HAS_KPI]->(k);*/
        var statement='match (d:DOMAIN{name:"'+domain+'"})-->(t:TEMPLATE {id:"'+neType+'"}) with t match (g:GRANULARITY {seconds:'+granularity+'}) with t,g merge(kd:KPI_DEF {id:'+kpiID+',name:"'+kpiName+'",type:'+kpiType+',formula:"'+kpiFormula+'",description:"'+(kpiDesc||"")+'",unit:"'+(kpiUnit||"")+'"}) with t,g,kd merge (g)-[:HAS_KPI]->(kd) with t,g,kd merge (t)-[:HAS_KPI]->(kd)';
        return  [{statement:statement}];
    };


    return K;
})();