/**
 * Created by yanzhig on 2/4/2016.
 */
module.exports = (function() {
    'use strict';
    var path = require('path');
    var _ = require(path.join(__dirname,'/../node_modules/lodash/index'));
    var M={};

    // cyphers for Modelling
    M.getCypherInjectModel=function(domain,elements,relationships){
        try{
            var statements=[];
            var statement='merge (d:DOMAIN{name:"'+domain+'"})';
            statements.push({statement:statement});
            _.forEach(elements,function(e){
                statement='match (d:DOMAIN{name:"'+domain+'"}) with d merge (t:TEMPLATE {id:"'+ e.id+'"';
                _.forIn(e,function(v,k){
                    if(k!=='id'){
                        if(_.isNumber(v)){
                            statement=statement+','+k+':'+v;
                        }else{
                            statement=statement+','+k+':"'+v+'"';
                        }
                    }
                });
                statement=statement+"})  merge (d)-[:HAS]->(t)";
                statements.push({statement:statement});
            });
            _.forEach(relationships,function(r){
                statement='match (p:TEMPLATE {id:"'+ _.get(r,'parent_id')+'"}) with p merge (c:TEMPLATE {id:"'+ _.get(r,'child_id')+'"}) merge (p)-[:'+r.type+']->(c)';
                statements.push({statement:statement});
            });
            return statements;
        }catch(e){
            throw e;
        }

    };

    //cyphers for standard csv collector
    M.getCypherInjectNodeInstance=function(domain,type,name){
        var kp=domain+'/'+type+'/'+name;
        var statement='match (d:DOMAIN {name:"'+domain+'"})-->(p:TEMPLATE{id:"'+type+'"}) with d,p merge (pi:INSTANCE {key:"'+kp+'",id:"'+name+'",type:"'+type+'"}) with d,p,pi merge (p)-[:HAS_INSTANCE]->(pi)';
        return [{statement:statement}];
    };
    M.getCypherInjectParentAndChildNodeInstances=function(domain,parentType,parentName,childType,childName){
        var kp=domain+'/'+parentType+'/'+parentName;
        var kc=domain+'/'+childType+'/'+childName;
        var statement='match (d:DOMAIN {name:"'+domain+'"})-->(p:TEMPLATE{id:"'+parentType+'"})-->(c:TEMPLATE {id:"'+childType+'"}) with d,p,c  merge (pi:INSTANCE {key:"'+kp+'",id:"'+parentName+'",type:"'+parentType+'"}) with d,p,c,pi merge (ci:INSTANCE {key:"'+kc+'",id:"'+childName+'",type:"'+childType+'"}) with  d,p,c,pi,ci merge (p)-[:HAS_INSTANCE]->(pi)  with  d,p,c,pi,ci merge (c)-[:HAS_INSTANCE]->(ci)  with  d,p,c,pi,ci merge (pi)-[:HAS_CHILD]->(ci)';
        //console.log(statement);
        return  [{statement:statement}];
    };
    M.getCypherInjectKPIInstances=function(domain,neType,neID,granularity,kpiname,ts,kpivalue,gran){
        //var key=kpiname+'/'+neID+'/'+ts+'/'+gran;
        //if have kpiid will improve the performance because it's index
        var statement= _.isNaN(parseFloat(kpivalue))?
        'match (ne:INSTANCE{key:"'+domain+'/'+neType+'/'+neID+'"})<--(:TEMPLATE)-->(d:KPI_DEF{type:0,formula:"'+kpiname+'"})<-[:HAS_KPI]-(g:GRANULARITY)  create (k:KPI_VALUE{name:"'+kpiname+'", ts:'+ts+',value:'+kpivalue+',gran:'+gran+', neID:"'+neID+'"}) , (ne)-[:HAS_KPI_VALUE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.key=d.id+"/"+ne.key+"/"+k.ts, k.id=d.id, k.updateTS=timestamp()'
        :'match (ne:INSTANCE{key:"'+domain+'/'+neType+'/'+neID+'"})<--(:TEMPLATE)-->(d:KPI_DEF{type:0,formula:"'+kpiname+'"})<-[:HAS_KPI]-(g:GRANULARITY)  create (k:KPI_VALUE{name:"'+kpiname+'", ts:'+ts+',value:"'+kpivalue+'",gran:'+gran+', neID:"'+neID+'"}) , (ne)-[:HAS_KPI_VALUE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.key=d.id+"/"+ne.key+"/"+k.ts, k.id=d.id, k.updateTS=timestamp()';
        //console.log(statement);
        return  [{statement:statement}];
    };

    //cypher for SNMP collector
    M.getCypherQueryTemplate=function(domain,type){
        var statement='match(d:DOMAIN{name:"'+domain+'"})-->(e:TEMPLATE {id:"'+type+'"}) return e';
        return  [{statement:statement}];
    };

    M.getCypherInjectSNMPNodeInstances=function(domain,type,id,ip,community,version){
        var statement='match(d:DOMAIN{name:"'+domain+'"})-->(t:TEMPLATE{id:"'+type+'"}) with t merge (i:INSTANCE{id:"'+id+'",type:"'+type+'", ip:"'+ip+'",community:"'+community+'",version:"'+version+'"}) with t,i merge (t)-[:HAS_INSTANCE]->(i)';
        //console.log(statement);
        return  [{statement:statement}];
    };
    return M;
})();