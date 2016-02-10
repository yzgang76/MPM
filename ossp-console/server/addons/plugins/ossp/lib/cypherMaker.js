/**
 * Created by yanzhig on 2/6/2016.
 */
module.exports = (function() {
    'use strict';
    //var _ = require(process.env.ROOT + '/node_modules/lodash/index');
    var K = {};
    //For KPI Manager
    K.getCypherForLookupKPIDefinition=function(domain,neType,granularity,kpiName,kpiType,kpiFormula){
        var statement='match (t:TEMPLATE {key:"'+domain+'/'+neType+'"})-->(kd:KPI_DEF {name:"'+kpiName+'",type:'+kpiType+',formula:"'+kpiFormula+'"})<--(g:GRANULARITY {seconds:'+granularity+'}) return kd.id';
        return  [{statement:statement}];
    };
    K.getCypherForRegisterKPIDefinition=function(domain,neType,granularity,kpiID,kpiName,kpiType,kpiFormula,kpiUnit,kpiDesc){
      /*  create (:KPI_DEF {id:1,name:"kpi_test",type:0,formula:"kpi_test",description:"",unit:""})
        match (k:KPI_DEF {id:1}) with k match (t:TEMPLATE {id:"BTS"}) merge (t)-[:HAS_KPI]->(k)
        match (k:KPI_DEF {id:1}) with k match (g:GRANULARITY {seconds:900}) merge (g)-[:HAS_KPI]->(k);*/
        var statement='match (t:TEMPLATE {key:"'+domain+'/'+neType+'"}) with t match (g:GRANULARITY {seconds:'+granularity+'}) with t,g merge(kd:KPI_DEF {id:'+kpiID+',name:"'+kpiName+'",type:'+kpiType+',formula:"'+kpiFormula+'",description:"'+(kpiDesc||"")+'",unit:"'+(kpiUnit||"")+'"}) with t,g,kd merge (g)-[:HAS_KPI]->(kd) with t,g,kd merge (t)-[:HAS_KPI]->(kd)';
        //console.log('rgeeeeeeeeeeeeeeeeeeeeee',statement);
        return  [{statement:statement}];
    };

    K.getCypherForGetKPIDefinitionList=function(){
        var statement='MATCH (d:DOMAIN)-->(t:TEMPLATE)-[:HAS_KPI]->(n:KPI_DEF)<-[:HAS_KPI]-(g:GRANULARITY)  return d.name as domain, n.id as id,t.type as ne,g.type as gran,n.name as name,n.type as type ,n.formula as formula,n.unit as unit,n.description as description';
        return  [{statement:statement}];
    };


    return K;
})();