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
                var key=domain+'/'+ e.id;
                statement='match (d:DOMAIN{name:"'+domain+'"}) with d merge (t:TEMPLATE {key:"'+ key+'" ,id:"'+ e.id+'"';
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
                var keyp=domain+'/'+ _.get(r,'parent_id');
                var keyc=domain+'/'+ _.get(r,'child_id');
                statement='match (p:TEMPLATE {key:"'+keyp+'"}) with p match (c:TEMPLATE {key:"'+keyc+'"}) merge (p)-[:'+r.type+']->(c)';
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
        var statement='match (p:TEMPLATE{key:"'+domain+'/'+type+'"}) with p merge (pi:INSTANCE {key:"'+kp+'",id:"'+name+'",type:"'+type+'"}) with p,pi merge (p)-[:HAS_INSTANCE]->(pi)';
        return [{statement:statement}];
    };
    M.getCypherInjectParentAndChildNodeInstances=function(domain,parentType,parentName,childType,childName){
        var kp=domain+'/'+parentType+'/'+parentName;
        var kc=domain+'/'+childType+'/'+childName;
        var statement='match (p:TEMPLATE{key:"'+domain+'/'+parentType+'"})-->(c:TEMPLATE {key:"'+domain+'/'+childType+'"}) with p,c  merge (pi:INSTANCE {key:"'+kp+'",id:"'+parentName+'",type:"'+parentType+'"}) with p,c,pi merge (ci:INSTANCE {key:"'+kc+'",id:"'+childName+'",type:"'+childType+'"}) with p,c,pi,ci merge (p)-[:HAS_INSTANCE]->(pi)  with p,c,pi,ci merge (c)-[:HAS_INSTANCE]->(ci)  with p,c,pi,ci merge (pi)-[:HAS_CHILD]->(ci)';
        //console.log('ddddddddddddddddddd', statement);
        return  [{statement:statement}];
    };
    M.getCypherInjectKPIInstances=function(domain,neType,neID,granularity,kpiname,ts,kpivalue,gran){
        //var key=kpiname+'/'+neID+'/'+ts+'/'+gran;
        //if have kpiid will improve the performance because it's index
        var statement= _.isNaN(parseFloat(kpivalue))?
        'match (ne:INSTANCE{key:"'+domain+'/'+neType+'/'+neID+'"})<--(:TEMPLATE)-->(d:KPI_DEF{type:0,formula:"'+kpiname+'"})<-[:HAS_KPI]-(g:GRANULARITY)  create (k:KPI_VALUE{name:"'+kpiname+'", ts:'+ts+',value:'+kpivalue+',gran:'+gran+', neID:"'+neID+'"}) , (ne)-[:HAS_KPI_VALUE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.key=d.id+"/"+ne.key+"/"+k.ts, k.id=d.id, k.updateTS=timestamp()'
        :'match (ne:INSTANCE{key:"'+domain+'/'+neType+'/'+neID+'"})<--(:TEMPLATE)-->(d:KPI_DEF{type:0,formula:"'+kpiname+'"})<-[:HAS_KPI]-(g:GRANULARITY)  create (k:KPI_VALUE{name:"'+kpiname+'", ts:'+ts+',value:"'+kpivalue+'",gran:'+gran+', neID:"'+neID+'"}) , (ne)-[:HAS_KPI_VALUE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.key=d.id+"/"+ne.key+"/"+k.ts, k.id=d.id, k.updateTS=timestamp()';
        //console.log('nnnnnnnnnnnnnnnnnnnnn',statement);
        return  [{statement:statement}];
    };

    //cypher for SNMP collector
    M.getCypherQueryTemplate=function(domain,type){
        var statement='match (e:TEMPLATE {key:"'+domain+'/'+type+'"}) return e';
        return  [{statement:statement}];
    };

    M.getCypherInjectSNMPNodeInstances=function(domain,type,id,ip,community,version){
        var key=domain+'/'+type+'/'+id;
        var statement='match (t:TEMPLATE{key:"'+domain+'/'+type+'"}) with t merge (i:INSTANCE{key:"'+key+'",id:"'+id+'",type:"'+type+'", ip:"'+ip+'",community:"'+community+'",version:"'+version+'"}) with t,i merge (t)-[:HAS_INSTANCE]->(i)';
        //console.log(statement);
        return  [{statement:statement}];
    };

    M.getCypherGetLatestKPIValue=function(id){
        var statement='match (e:KPI_VALUE{id:'+id+'}) return e order by e.ts desc limit 1';
        //console.log(statement);
        return  [{statement:statement}];
    };

    M.getCypherInjectSNMPKPIInstances=function(domain,devicetype,devicename,gran,kpiid,kpiname,ts,kpivalue,kpiraw){
        var key=kpiid+'/'+ domain+'/'+devicetype+'/'+devicename+'/'+ts;
        var statement=
        _.isNaN(kpivalue)?  //string
            'match (ne:INSTANCE{key:"'+domain+'/'+devicetype+'/'+devicename+'"})<--(:TEMPLATE)-->(d:KPI_DEF{id:'+kpiid+'})<-[:HAS_KPI]-(g:GRANULARITY)  create (k:KPI_VALUE{key:"'+key+'",id:'+kpiid+',name:"'+kpiname+'", ts:'+ts+',value:"'+kpivalue+'",gran:'+gran+', neID:"'+devicename+'",raw:"'+kpiraw+'"}) , (ne)-[:HAS_KPI_INSTANCE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.updateTS=timestamp()':
        'match (ne:INSTANCE{key:"'+domain+'/'+devicetype+'/'+devicename+'"})<--(:TEMPLATE)-->(d:KPI_DEF{id:'+kpiid+'})<-[:HAS_KPI]-(g:GRANULARITY)  create (k:KPI_VALUE{key:"'+key+'",id:'+kpiid+',name:"'+kpiname+'", ts:'+ts+',value:'+kpivalue+',gran:'+gran+', neID:"'+devicename+'",raw:'+kpiraw+'}) , (ne)-[:HAS_KPI_VALUE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.updateTS=timestamp()';
        //console.log('nnnnnnnnnnnnnnnnnn',statement);
        return  [{statement:statement}];
    };

    //cypher for NFVD log collector
    M.getCypherInjectNFVDGUIModel=function(){
        var statements=[
            {statement:'merge (domain:DOMAIN{name:"NFVD"})-[:HAS]->(server:TEMPLATE {key:"NFVD/NFVD_GUI_SERVER",id:"NFVD_GUI_SERVER",desc:"nfvd GUI server"})-[:CONTAINS]->(request:TEMPLATE {key:"NFVD/NFVD_GUI_SERVER_REQUEST",id:"NFVD_GUI_SERVER_REQUEST",desc:"nfvd GUI server"}) with request,domain merge (domain)-[:HAS]->(user:TEMPLATE{key:"NFVD/NFVD_GUI_USER",id:"NFVD_GUI_USER",desc:"NFVD GUI USER"})-[:CONTAINS]->(request) with domain,request merge (domain)-[:HAS]->(request)'},
            {statement:'merge (:GRANULARITY {id:-1,type:"Real _Time",seconds:0})'}
        ];
        return statements;
    };
    M.getCypherInjectNFVDGUIServerInstance=function(id){
        var statement='merge (e:INSTANCE{key:"NFVD/NFV_GUI_SERVER/'+id+'",id:"'+id+'",type:"NFVD_GUI_SERVER"}) with e match  (server:TEMPLATE {key:"NFVD/NFVD_GUI_SERVER"}) merge (server)-[:HAS_INSTANCE]->(e)';
        return  [{statement:statement}];
    };
    M.getCypherInjectNFVDGUIUserInstance=function(user){
        var statement='match (t:TEMPLATE{key:"NFVD/NFVD_GUI_USER"}) with t  merge (user:INSTANCE{key:"NFVD/NFVD_GUI_USER/'+user+'",id:"'+user+'", type:"NFVD_GUI_USER"}) with t ,user merge (t)-[:HAS_INSTANCE]->(user) ';
        return  [{statement:statement}];
    };
    M.getCypherInjectNFVDGUIUriInstance=function(uri){
        var statement='match (t:TEMPLATE{key:"NFVD/NFVD_GUI_SERVER_REQUEST"}) with t merge (uri:INSTANCE{key:"NFVD/NFVD_GUI_SERVER_REQUEST/'+uri+'",id:"'+uri+'", type:"NFVD_GUI_SERVER_REQUEST"}) with t, uri merge (t)-[:HAS_INSTANCE]->(uri)';
        return  [{statement:statement}];
    };
    M.getCypherInjectNFVDInventoryRelationships=function(id,user,uri){
        var statement='match (server:INSTANCE{key:"NFVD/NFVD_GUI_SERVER/'+id+'"}) with server match (uri:INSTANCE{key:"NFVD/NFVD_SERVER_REQUEST/'+uri+'"}) merge (server)-[:HAS_CHILD]->(uri) with uri match(user:INSTANCE{key:"NFVD/NFVD_GUI_USER/'+user+'"}) merge (user)-[:HAS_CHILD]->(uri)' ;
        return  [{statement:statement}];
    };
    M.getCypherInjectServerRequestCost=function(uri,ts,cost){
        //var key=kpiid+'/'+ domain+'/'+devicetype+'/'+devicename+'/'+ts;
        var statement='match(g:GRANULARITY)-[:HAS_KPI]->(d:KPI_DEF{type:0,formula:"Server_Request_cost"})<-[:HAS_KPI]-(t:TEMPLATE{key:"NFVD/NFVD_GUI_SERVER_REQUEST"})-[:HAS_INSTANCE]->(ne:INSTANCE{key:"NFVD/NFVD_GUI_SERVER_REQUEST/'+uri+'"}) with g,ne ,d create (k:KPI_VALUE{name:"Server_Request_cost", ts:'+ ts+',value:'+parseFloat(cost)+', neID:"'+uri+'"}) , (ne)-[:HAS_KPI_VALUE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.id=d.id,k.key=k.id+"/"+ne.key+"/"+k.ts , k.gran=g.seconds,k.updateTS=timestamp()';
        return  [{statement:statement}];
    };
    M.getCypherInjectServerReponse=function(uri,ts,returnCode,method,value){
        //var key=kpiid+'/'+ domain+'/'+devicetype+'/'+devicename+'/'+ts;
        var statement='match(g:GRANULARITY)-[:HAS_KPI]->(d:KPI_DEF{type:0,formula:"Server_Response"})<-[:HAS_KPI]-(t:TEMPLATE{key:"NFVD/NFVD_GUI_SERVER_REQUEST"})-[:HAS_INSTANCE]->(ne:INSTANCE{key:"NFVD/NFVD_GUI_SERVER_REQUEST/'+uri+'"}) with g,ne ,d create (k:KPI_VALUE{name:"Server_Response", ts:'+ ts+',value:"'+value+'", neID:"'+uri+'", returnCode:"'+returnCode+'",method:"'+ method+'"}) , (ne)-[:HAS_KPI_VALUE]->(k) ,(d)-[:HAS_KPI_VALUE]->(k) set k.id=d.id,k.key=k.id+"/"+ne.key+"/"+k.ts, k.gran=g.seconds,k.updateTS=timestamp()';
        return  [{statement:statement}];
    };

    //cypher for KPI engine
    M.getCypherForLatestTsOfKPIInstance=function(kpiid){
        var statement='match(k:KPI_VALUE{id:'+kpiid+'}) return max(k.ts)';
        return  [{statement:statement}];
    };
    return M;
})();