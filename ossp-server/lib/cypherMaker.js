/**
 * Created by yanzhig on 2/4/2016.
 */
module.exports = (function() {
    'use strict';
    var path = require('path');
    var _ = require(path.join(__dirname,'/../node_modules/lodash/index'));
    var M={};

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

    return M;
})();